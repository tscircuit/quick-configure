import { mkdir, readFile, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { convertCircuitJsonToAltiumZip } from "circuit-json-to-altium"
import {
  convertSoupToExcellonDrillCommandLayers,
  convertSoupToGerberCommands,
  stringifyExcellonDrill,
  stringifyGerberCommandLayers,
} from "circuit-json-to-gerber"
import {
  CircuitJsonToKicadPcbConverter,
  CircuitJsonToKicadProConverter,
  CircuitJsonToKicadSchConverter,
} from "circuit-json-to-kicad"
import JSZip from "jszip"

const distDir = join(import.meta.dir, "..", "dist")

async function writeGerbers(circuitJson: any[], outputPath: string) {
  const zip = new JSZip()
  const gerbers = stringifyGerberCommandLayers(
    convertSoupToGerberCommands(circuitJson),
  )
  const drills = convertSoupToExcellonDrillCommandLayers({ circuitJson })

  for (const [layer, content] of Object.entries(gerbers)) {
    zip.file(`${layer}.gbr`, content)
  }
  for (const [filename, commands] of Object.entries(drills)) {
    zip.file(filename, stringifyExcellonDrill(commands))
  }

  await writeFile(
    outputPath,
    await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    }),
  )
}

async function writeKicadProject(
  circuitJson: any[],
  projectName: string,
  outputPath: string,
) {
  const schematicFilename = `${projectName}.kicad_sch`
  const pcbFilename = `${projectName}.kicad_pcb`
  const zip = new JSZip()

  const schematic = new CircuitJsonToKicadSchConverter(circuitJson)
  schematic.runUntilFinished()
  for (const file of schematic.getOutputFiles({ schematicFilename })) {
    zip.file(file.filename, file.content)
  }

  const pcb = new CircuitJsonToKicadPcbConverter(circuitJson, { projectName })
  pcb.runUntilFinished()
  zip.file(pcbFilename, pcb.getOutputString())

  const project = new CircuitJsonToKicadProConverter(circuitJson, {
    projectName,
    schematicFilename,
    pcbFilename,
    schematicSheetPlan: schematic.schematicSheetPlan,
  })
  project.runUntilFinished()
  zip.file(`${projectName}.kicad_pro`, project.getOutputString())

  await writeFile(
    outputPath,
    await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    }),
  )
}

async function writeSchematicPdf(svgPath: string, outputPath: string) {
  const process = Bun.spawn(
    ["rsvg-convert", "-f", "pdf", "-o", outputPath, svgPath],
    { stdout: "pipe", stderr: "pipe" },
  )
  const [exitCode, stderr] = await Promise.all([
    process.exited,
    new Response(process.stderr).text(),
  ])
  if (exitCode !== 0) {
    throw new Error(`rsvg-convert failed for ${svgPath}: ${stderr.trim()}`)
  }
}

const boardDirectories = (await readdir(distDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

let completed = 0
for (const boardDirectory of boardDirectories) {
  const boardPath = join(distDir, boardDirectory)
  const circuitJsonPath = join(boardPath, "circuit.json")
  const circuitJson = JSON.parse(await readFile(circuitJsonPath, "utf8"))
  const resourcePath = join(boardPath, "resources")
  const projectName = boardDirectory.replaceAll("-", "_")
  await mkdir(resourcePath, { recursive: true })

  await Promise.all([
    writeGerbers(circuitJson, join(resourcePath, "gerbers.zip")),
    writeKicadProject(
      circuitJson,
      projectName,
      join(resourcePath, "kicad-project.zip"),
    ),
    convertCircuitJsonToAltiumZip(circuitJson, projectName).then((zip) =>
      writeFile(join(resourcePath, "altium-project.zip"), zip),
    ),
    writeSchematicPdf(
      join(boardPath, "schematic.svg"),
      join(resourcePath, "schematic.pdf"),
    ),
  ])

  completed += 1
  console.log(`Resources ${completed}/${boardDirectories.length}: ${boardDirectory}`)
}

console.log(`Created fabrication and EDA resources for ${completed} boards.`)
