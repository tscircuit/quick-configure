import { type Board, Circuit, orderedRenderPhases } from "@tscircuit/core"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { mkdir, readdir } from "node:fs/promises"
import { join } from "node:path"
import JSZip from "jszip"
import { ddrConfigurations } from "../src/ddr/configurations"
import { validateDdrCircuit } from "../src/ddr/validate-ddr-circuit"

const projectRoot = join(import.meta.dir, "..")

const requestedPosition = process.argv[2]
const configurations = requestedPosition
  ? ddrConfigurations.filter(
      (configuration) => configuration.position === requestedPosition,
    )
  : ddrConfigurations
if (!configurations.length)
  throw new Error(`Unknown DDR position: ${requestedPosition}`)

for (const configuration of configurations) {
  const circuit = new Circuit({
    platform: { placementDrcChecksDisabled: true },
  })
  circuit.add(configuration.Board())
  console.log(`Rendering ${configuration.id} (${configuration.routingStatus})`)
  await circuit.renderUntilSettled()

  // Core's reference routes DDR before introducing the 60 fixed decouplers.
  // Stage the new subtree through source trace creation before refreshing the
  // board's connectivity map and emitting its authored PCB copper.
  if (configuration.DirectDecoupling) {
    const board = circuit._getBoard() as Board
    board.add(configuration.DirectDecoupling())
    const decouplingGroup = board.children[board.children.length - 1]!
    const sourcePhaseIndex = orderedRenderPhases.indexOf("SourceTraceRender")
    for (const phase of orderedRenderPhases.slice(0, sourcePhaseIndex + 1)) {
      decouplingGroup.runRenderPhaseForChildren(phase)
      decouplingGroup.runRenderPhase(phase)
    }
    board.doInitialSourceAddConnectivityMapKey()
    await circuit.renderUntilSettled()
    board._drcChecksComplete = false
    board._markDirty("PcbDesignRuleChecks")
    await circuit.renderUntilSettled()
  }

  const circuitJson = circuit.getCircuitJson()
  if (configuration.routingStatus === "routed") validateDdrCircuit(circuitJson)
  else {
    const errors = circuitJson.filter((record) =>
      record.type.endsWith("_error"),
    )
    if (errors.length)
      throw new Error(`Unexpected reference errors: ${JSON.stringify(errors)}`)
    if (circuitJson.some((record) => record.type === "pcb_trace"))
      throw new Error(
        "The unrouted Top reference unexpectedly contains routed copper",
      )
  }
  const outputDir = join(projectRoot, "dist", configuration.id)
  await mkdir(outputDir, { recursive: true })
  await Bun.write(
    join(outputDir, "circuit.json"),
    JSON.stringify(circuitJson, null, 2),
  )
  await Bun.write(
    join(outputDir, "pcb.svg"),
    convertCircuitJsonToPcbSvg(circuitJson, {
      showDebugObjects: true,
      shouldDrawRatsNest: configuration.routingStatus === "unrouted",
      // Match the reference: translucent power planes leave signal copper clear.
      colorOverrides: {
        copper: {
          inner1: "rgba(255, 140, 0, 0.2)",
          inner2: "rgba(255, 215, 0, 0.2)",
          inner3: "rgba(50, 205, 50, 0.2)",
        },
      },
    }),
  )

  const sourceZip = new JSZip()
  const sourceDir = join(projectRoot, "src", "ddr")
  for (const filename of await readdir(sourceDir)) {
    sourceZip.file(
      `src/ddr/${filename}`,
      await Bun.file(join(sourceDir, filename)).text(),
    )
  }
  sourceZip.file(
    "scripts/build-ddr-artifacts.ts",
    await Bun.file(import.meta.path).text(),
  )
  sourceZip.file(
    "package.json",
    await Bun.file(join(projectRoot, "package.json")).text(),
  )
  sourceZip.file(
    "package-lock.json",
    await Bun.file(join(projectRoot, "package-lock.json")).text(),
  )
  sourceZip.file(
    "README.md",
    `# DDR Breakouts · ${configuration.position}\n\nRouting status: **${configuration.routingStatus}**.\n\nInstall with \`npm ci --force\`, then run \`bun scripts/build-ddr-artifacts.ts ${configuration.position}\`.\n\nThe Right configuration preserves the staged DDR fanout and fixed decoupling copper from tscircuit/core's progressive-fanout reference.\n\nTop preserves the 02-top-center placement, netlist, and bus directions from https://github.com/tscircuit/dataset-fanout31-am62l/tree/8c73befb36b125c84651c07454a9b940b3c6500a. It is an unrouted reference: the preview shows connection guides, not PCB traces. The dataset disables RAM routing and board-level routing; CPU fanout is an unsolved benchmark. To attempt CPU fanout, render Am62lLpddr4Top({ routingDisabled: false }) separately. This does not produce a fully routed board.\n`,
  )
  await Bun.write(
    join(outputDir, "source.zip"),
    await sourceZip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
    }),
  )
  console.log(
    `Generated ${configuration.id}: PCB, circuit JSON, and TSX source bundle`,
  )
}
