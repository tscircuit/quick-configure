import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import { join } from "node:path"

const projectRoot = join(import.meta.dir, "..")
const publicDir = join(projectRoot, "public")

await rm(publicDir, { recursive: true, force: true })
await mkdir(publicDir, { recursive: true })
await cp(join(projectRoot, "site", "index.html"), join(publicDir, "index.html"))
await cp(join(projectRoot, "site", "assets"), join(publicDir, "assets"), {
  recursive: true,
})
const distDir = join(projectRoot, "dist")
const viewerDir = join(publicDir, "viewer")
await mkdir(viewerDir, { recursive: true })

const directoryEntries = (await readdir(distDir, { withFileTypes: true })).filter(
  (entry) => entry.isDirectory(),
)

for (const boardDirectory of directoryEntries) {
  const sourceDir = join(distDir, boardDirectory.name)
  try {
    await access(join(sourceDir, "circuit.json"))
  } catch {
    continue
  }
  const targetDir = join(viewerDir, boardDirectory.name)
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

console.log("Assembled the deployable site in public/.")
