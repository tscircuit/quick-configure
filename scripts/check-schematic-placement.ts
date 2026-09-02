import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const projectRoot = join(import.meta.dir, "..");
const tsciBinary = join(projectRoot, "node_modules", ".bin", "tsci");
const maxConcurrency = 4;
const issueMarker = "<SchematicPlacementIssues>";
const ignoredDirectories = new Set([
  ".git",
  ".tscircuit",
  "dist",
  "node_modules",
  "public",
]);

interface CheckResult {
  file: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  hasPlacementIssues: boolean;
}

async function findCircuitFiles(directory = projectRoot): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      // DDR configurations are PCB-only and use their own staged artifact build.
      if (absolutePath === join(projectRoot, "src", "ddr")) continue;
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await findCircuitFiles(absolutePath)));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".circuit.tsx")) {
      files.push(relative(projectRoot, absolutePath));
    }
  }

  return files.sort();
}

async function checkCircuit(file: string): Promise<CheckResult> {
  console.log(`Checking ${file}`);
  const child = Bun.spawn([tsciBinary, "check", "schematic-placement", file], {
    cwd: projectRoot,
    env: globalThis.process.env,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  const hasPlacementIssues =
    stdout.includes(issueMarker) || stderr.includes(issueMarker);

  console.log(
    `${exitCode === 0 && !hasPlacementIssues ? "PASS" : "FAIL"} ${file}`,
  );
  return { file, exitCode, stdout, stderr, hasPlacementIssues };
}

const circuitFiles = await findCircuitFiles();
if (circuitFiles.length === 0) {
  throw new Error("No *.circuit.tsx files found");
}

console.log(
  `Checking schematic placement for ${circuitFiles.length} circuits (concurrency ${maxConcurrency})`,
);

const results = new Array<CheckResult>(circuitFiles.length);
let nextIndex = 0;

async function runWorker() {
  while (nextIndex < circuitFiles.length) {
    const index = nextIndex;
    nextIndex += 1;
    results[index] = await checkCircuit(circuitFiles[index]!);
  }
}

await Promise.all(
  Array.from(
    { length: Math.min(maxConcurrency, circuitFiles.length) },
    runWorker,
  ),
);

const failures = results.filter(
  ({ exitCode, hasPlacementIssues }) => exitCode !== 0 || hasPlacementIssues,
);

for (const failure of failures) {
  console.error(`\n--- ${failure.file} ---`);
  console.error(`exit code: ${failure.exitCode}`);
  if (failure.hasPlacementIssues) {
    console.error(`found ${issueMarker} in tsci output`);
  }
  if (failure.stdout.trim()) {
    console.error(`stdout:\n${failure.stdout.trimEnd()}`);
  }
  if (failure.stderr.trim()) {
    console.error(`stderr:\n${failure.stderr.trimEnd()}`);
  }
}

if (failures.length > 0) {
  console.error(
    `\nSchematic placement failed for ${failures.length} of ${circuitFiles.length} circuits.`,
  );
  globalThis.process.exitCode = 1;
} else {
  console.log(
    `Schematic placement passed for all ${circuitFiles.length} circuits.`,
  );
}
