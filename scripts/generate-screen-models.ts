import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import * as jscad from "@jscad/modeling"
import { getJscadModelForFootprint } from "jscad-electronics/vanilla"
import { convertJscadModelToGltf } from "jscad-to-gltf"
import { screenModelSpecs } from "../src/screen-model-specs"

const outputDirectory = join(import.meta.dir, "..", "src", "models")
await mkdir(outputDirectory, { recursive: true })

for (const spec of Object.values(screenModelSpecs)) {
  const connector = getJscadModelForFootprint(spec.connectorModel, jscad)
  const display = getJscadModelForFootprint(spec.flexScreenModel, jscad)
  const result = await convertJscadModelToGltf(
    { geometries: [...connector.geometries, ...display.geometries] },
    { format: "glb", meshName: spec.id },
  )

  if (!(result.data instanceof ArrayBuffer)) {
    throw new Error(`Expected binary GLB output for ${spec.id}`)
  }

  const outputPath = join(outputDirectory, spec.outputFilename)
  await Bun.write(outputPath, new Uint8Array(result.data))
  console.log(`${spec.id}: ${result.byteLength.toLocaleString()} bytes`)
}
