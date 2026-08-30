import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { expectedConfigurationIds } from "./configuration-ids";

const projectRoot = join(import.meta.dir, "..");
const distDir = join(projectRoot, "dist");
const sensorBoardPattern = /^usb-c__mspm0g3507__.+\.circuit\.tsx$/;
const planOnly = process.argv.includes("--plan");

const commonBuildArgs = [
  "--ignore-warnings",
  "--autorouter-timeout",
  "8m",
  "--all-images",
  "--3d",
  "--glbs",
  "--pcb-svgs",
  "--schematic-svgs",
];

function boardIdFromFilename(filename: string) {
  return filename.replace(/\.circuit\.tsx$/, "");
}

async function assertCircuitJsonClean(boardId: string) {
  const circuitJsonPath = join(distDir, boardId, "circuit.json");
  let circuitJson: unknown;

  try {
    circuitJson = JSON.parse(await readFile(circuitJsonPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Missing or invalid circuit JSON for ${boardId}: ${error instanceof Error ? error.message : error}`,
    );
  }

  if (!Array.isArray(circuitJson)) {
    throw new Error(`Expected an array in ${circuitJsonPath}`);
  }

  const errorRecords = circuitJson.filter(
    (record): record is { type: string } =>
      typeof record === "object" &&
      record !== null &&
      "type" in record &&
      typeof record.type === "string" &&
      /(?:^|_)error$/.test(record.type),
  );

  if (errorRecords.length > 0) {
    const errorCounts = new Map<string, number>();
    for (const { type } of errorRecords) {
      errorCounts.set(type, (errorCounts.get(type) ?? 0) + 1);
    }
    const summary = [...errorCounts]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([type, count]) => `${type} (${count})`)
      .join(", ");
    throw new Error(`Circuit JSON errors in ${boardId}: ${summary}`);
  }
}

async function runTsci(
  args: string[],
  buildScope?: "legacy",
  options: { allowFailure?: boolean } = {},
) {
  const command = ["./node_modules/.bin/tsci", "build", ...args];
  console.log(`\n$ ${command.join(" ")}`);

  const process = Bun.spawn(command, {
    cwd: projectRoot,
    env: {
      ...globalThis.process.env,
      ...(buildScope
        ? { QUICK_CONFIGURE_TSCIRCUIT_BUILD_SCOPE: buildScope }
        : {}),
    },
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await process.exited;
  if (exitCode !== 0 && !options.allowFailure) {
    throw new Error(`tsci exited with code ${exitCode}`);
  }

  return exitCode;
}

const circuitFilenames = (await readdir(projectRoot))
  .filter((filename) => filename.endsWith(".circuit.tsx"))
  .sort();
const sensorFilenames = circuitFilenames.filter((filename) =>
  sensorBoardPattern.test(filename),
);
const legacyFilenames = circuitFilenames.filter(
  (filename) => !sensorBoardPattern.test(filename),
);
const discoveredBoardIds = circuitFilenames.map(boardIdFromFilename).sort();
const expectedBoardIds = [...expectedConfigurationIds].sort();

if (sensorFilenames.length !== 10) {
  throw new Error(
    `Expected 10 isolated MSPM0 sensor boards, found ${sensorFilenames.length}`,
  );
}
if (JSON.stringify(discoveredBoardIds) !== JSON.stringify(expectedBoardIds)) {
  const missing = expectedBoardIds.filter(
    (boardId) => !discoveredBoardIds.includes(boardId),
  );
  const unexpected = discoveredBoardIds.filter(
    (boardId) => !expectedBoardIds.includes(boardId),
  );
  throw new Error(
    `Circuit entrypoints do not match configuration IDs. Missing: ${missing.join(", ") || "none"}. Unexpected: ${unexpected.join(", ") || "none"}.`,
  );
}

console.log(
  `Artifact build plan: ${legacyFilenames.length} legacy boards in one batch; ${sensorFilenames.length} MSPM0 sensor boards in isolated processes.`,
);
console.log(
  "  retry: dirty or missing legacy batch outputs are rebuilt in isolated processes",
);
for (const filename of sensorFilenames) console.log(`  isolated: ${filename}`);

if (!planOnly) {
  const legacyBoardIds = legacyFilenames.map(boardIdFromFilename);
  await Promise.all(
    legacyBoardIds.map((boardId) =>
      rm(join(distDir, boardId), { recursive: true, force: true }),
    ),
  );
  const legacyBatchExitCode = await runTsci(
    [...commonBuildArgs, "--concurrency", "4"],
    "legacy",
    { allowFailure: true },
  );
  const dirtyLegacyBoardIds: string[] = [];
  for (const boardId of legacyBoardIds) {
    try {
      await assertCircuitJsonClean(boardId);
    } catch (error) {
      dirtyLegacyBoardIds.push(boardId);
      console.warn(
        `Legacy batch output rejected for ${boardId}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  if (legacyBatchExitCode !== 0 && dirtyLegacyBoardIds.length === 0) {
    throw new Error(
      `Legacy tsci batch exited with code ${legacyBatchExitCode}, but no dirty or missing board artifact was found to retry`,
    );
  }

  for (const boardId of dirtyLegacyBoardIds) {
    const filename = `${boardId}.circuit.tsx`;
    console.log(`\nRetrying legacy board in isolation: ${filename}`);
    await rm(join(distDir, boardId), { recursive: true, force: true });
    await runTsci([filename, ...commonBuildArgs, "--concurrency", "1"]);
    await assertCircuitJsonClean(boardId);
  }

  for (const boardId of legacyBoardIds) await assertCircuitJsonClean(boardId);

  for (const sensorFilename of sensorFilenames) {
    const boardId = boardIdFromFilename(sensorFilename);
    await rm(join(distDir, boardId), { recursive: true, force: true });
    await runTsci([sensorFilename, ...commonBuildArgs, "--concurrency", "1"]);
    await assertCircuitJsonClean(boardId);
  }

  for (const boardId of expectedBoardIds) await assertCircuitJsonClean(boardId);
  console.log(
    `\nValidated ${expectedBoardIds.length} clean circuit JSON artifacts.`,
  );
}
