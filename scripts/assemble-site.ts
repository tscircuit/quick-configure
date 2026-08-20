import { cp, mkdir, rm } from "node:fs/promises"
import { join } from "node:path"

const projectRoot = join(import.meta.dir, "..")
const publicDir = join(projectRoot, "public")

await rm(publicDir, { recursive: true, force: true })
await mkdir(publicDir, { recursive: true })
await cp(join(projectRoot, "site", "index.html"), join(publicDir, "index.html"))
await cp(join(projectRoot, "site", "assets"), join(publicDir, "assets"), {
  recursive: true,
})
await cp(join(projectRoot, "dist"), join(publicDir, "viewer"), {
  recursive: true,
})

console.log("Assembled the deployable site in public/.")
