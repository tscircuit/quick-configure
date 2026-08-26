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

const projectRoot = join(import.meta.dir, "..")
const publicDir = join(projectRoot, "public")
const stagingDir = join(projectRoot, `.public-staging-${process.pid}`)
const backupDir = join(projectRoot, `.public-backup-${process.pid}`)
const distDir = join(projectRoot, "dist")
const siteIndex = join(projectRoot, "site", "index.html")
const siteAssets = join(projectRoot, "site", "assets")

async function assertNonemptyFile(path: string) {
  const metadata = await stat(path)
  if (!metadata.isFile() || metadata.size === 0) {
    throw new Error(`Expected a non-empty file: ${path}`)
  }
}

await Promise.all(
  expectedConfigurationIds.flatMap((boardId) => [
    ...expectedBoardAssetFilenames.map((filename) =>
      assertNonemptyFile(join(distDir, boardId, filename)),
    ),
    ...expectedResourceFilenames.map((filename) =>
      assertNonemptyFile(join(distDir, boardId, "resources", filename)),
    ),
  ]),
)
await assertNonemptyFile(siteIndex)
if (!(await stat(siteAssets)).isDirectory()) {
  throw new Error(`Expected a directory: ${siteAssets}`)
}

await rm(stagingDir, { recursive: true, force: true })
await rm(backupDir, { recursive: true, force: true })
await mkdir(stagingDir, { recursive: true })
await cp(siteIndex, join(stagingDir, "index.html"))
await cp(siteAssets, join(stagingDir, "assets"), {
  recursive: true,
})
const viewerDir = join(stagingDir, "viewer")
await mkdir(viewerDir, { recursive: true })

for (const boardId of expectedConfigurationIds) {
  const sourceDir = join(distDir, boardId)
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
  `Assembled ${expectedConfigurationIds.length} configurations in public/.`,
)
