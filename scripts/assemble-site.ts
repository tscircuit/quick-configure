import {
  cp,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises"
import { join } from "node:path"
import {
  expectedBoardAssetFilenames,
  expectedConfigurationIds,
  expectedResourceFilenames,
} from "./configuration-ids"
import { ddrAssetFilenames, ddrConfigurations } from "../src/ddr/configurations"

const projectRoot = join(import.meta.dir, "..")
const publicDir = join(projectRoot, "public")
const stagingDir = join(projectRoot, `.public-staging-${process.pid}`)
const backupDir = join(projectRoot, `.public-backup-${process.pid}`)
const distDir = join(projectRoot, "dist")
const siteIndex = join(projectRoot, "site", "index.html")
const siteAssets = join(projectRoot, "site", "assets")
const siteDdrPage = join(projectRoot, "site", "ddr-breakouts")
// Reassemble page changes using the checked-in sensor/display artifacts.
const fromPublic = process.argv.includes("--from-public")
const boardAssetsDir = fromPublic ? join(publicDir, "viewer") : distDir
const boardAssetFilenames = fromPublic
  ? expectedBoardAssetFilenames.filter(
      (filename) => filename !== "circuit.json",
    )
  : expectedBoardAssetFilenames

async function assertNonemptyFile(path: string) {
  const metadata = await stat(path)
  if (!metadata.isFile() || metadata.size === 0) {
    throw new Error(`Expected a non-empty file: ${path}`)
  }
}

await Promise.all(
  expectedConfigurationIds.flatMap((boardId) => [
    ...boardAssetFilenames.map((filename) =>
      assertNonemptyFile(join(boardAssetsDir, boardId, filename)),
    ),
    ...expectedResourceFilenames.map((filename) =>
      assertNonemptyFile(join(boardAssetsDir, boardId, "resources", filename)),
    ),
  ]),
)
await Promise.all(
  ddrConfigurations.flatMap(({ id }) =>
    ddrAssetFilenames.map((filename) =>
      assertNonemptyFile(join(distDir, id, filename)),
    ),
  ),
)
await assertNonemptyFile(siteIndex)
await assertNonemptyFile(join(siteDdrPage, "index.html"))
if (!(await stat(siteAssets)).isDirectory()) {
  throw new Error(`Expected a directory: ${siteAssets}`)
}

await rm(stagingDir, { recursive: true, force: true })
await rm(backupDir, { recursive: true, force: true })
await mkdir(stagingDir, { recursive: true })
await cp(siteIndex, join(stagingDir, "index.html"))
await cp(siteDdrPage, join(stagingDir, "ddr-breakouts"), { recursive: true })
await cp(siteAssets, join(stagingDir, "assets"), {
  recursive: true,
})
const viewerDir = join(stagingDir, "viewer")
await mkdir(viewerDir, { recursive: true })

for (const boardId of expectedConfigurationIds) {
  const sourceDir = join(boardAssetsDir, boardId)
  const targetDir = join(viewerDir, boardId)
  await mkdir(targetDir, { recursive: true })
  for (const filename of ["3d.glb", "3d.png", "pcb.svg", "schematic.svg"]) {
    const targetPath = join(targetDir, filename)
    await cp(join(sourceDir, filename), targetPath)
    if (filename.endsWith(".svg")) {
      const svg = await readFile(targetPath, "utf8")
      await writeFile(targetPath, svg.replace(/[ \t]+$/gm, ""))
    }
  }
  await cp(join(sourceDir, "resources"), join(targetDir, "resources"), {
    recursive: true,
  })
}

for (const { id } of ddrConfigurations) {
  const targetDir = join(viewerDir, id)
  await mkdir(targetDir, { recursive: true })
  for (const filename of ddrAssetFilenames) {
    await cp(join(distDir, id, filename), join(targetDir, filename))
  }
}

let existingPublicMoved = false
try {
  await rename(publicDir, backupDir)
  existingPublicMoved = true
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
}

try {
  await rename(stagingDir, publicDir)
} catch (error) {
  if (existingPublicMoved) await rename(backupDir, publicDir)
  throw error
}

if (existingPublicMoved) {
  await rm(backupDir, { recursive: true, force: true })
}

console.log(
  `Assembled ${expectedConfigurationIds.length} sensor/display configurations and ${ddrConfigurations.length} DDR breakout in public/.`,
)
