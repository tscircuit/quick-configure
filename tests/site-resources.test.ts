import { describe, expect, test } from "bun:test"
import { join } from "node:path"

const projectRoot = join(import.meta.dir, "..")

describe("board downloads", () => {
  test("offers the selected board's generated GLB", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()

    expect(html).toContain('data-board-file="3d.glb"')
    expect(html).toContain("link.href=`${base}/${file}`")
    expect(html).toContain("link.download=`${boardKey()}.glb`")
  })
})
