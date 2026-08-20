import { cp, mkdir, readdir, rm } from "node:fs/promises"
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

const boardDirectories = (await readdir(distDir, { withFileTypes: true })).filter(
  (entry) => entry.isDirectory(),
)
for (const boardDirectory of boardDirectories) {
  const sourceDir = join(distDir, boardDirectory.name)
  const targetDir = join(viewerDir, boardDirectory.name)
  await mkdir(targetDir, { recursive: true })
  for (const filename of ["3d.glb", "3d.png", "pcb.svg", "schematic.svg"]) {
    await cp(join(sourceDir, filename), join(targetDir, filename))
  }
  await cp(join(sourceDir, "resources"), join(targetDir, "resources"), {
    recursive: true,
  })
}

console.log("Assembled the deployable site in public/.")
