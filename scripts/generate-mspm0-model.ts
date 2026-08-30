import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import * as jscad from "@jscad/modeling"
import { getJscadModelForFootprint } from "jscad-electronics/vanilla"
import { convertJscadModelToGltf } from "jscad-to-gltf"

const outputDirectory = join(import.meta.dir, "..", "src", "models")
await mkdir(outputDirectory, { recursive: true })

const mspm0 = getJscadModelForFootprint("lqfp64_w10_h10_p0.5mm", jscad)
const result = await convertJscadModelToGltf(
  { geometries: mspm0.geometries },
  { format: "glb", meshName: "MSPM0G3507SPMR" },
)

if (!(result.data instanceof ArrayBuffer)) {
  throw new Error("Expected binary GLB output for MSPM0G3507SPMR")
}

const outputPath = join(outputDirectory, "mspm0g3507spmr.glb")
await Bun.write(outputPath, new Uint8Array(result.data))
console.log(`MSPM0G3507SPMR: ${result.byteLength.toLocaleString()} bytes`)
