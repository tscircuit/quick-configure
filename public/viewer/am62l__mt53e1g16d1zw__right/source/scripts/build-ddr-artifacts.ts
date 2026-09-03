import { type Board, Circuit, orderedRenderPhases } from "@tscircuit/core"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { writeDdrSource } from "./write-ddr-source"
import { ddrConfigurations } from "../src/ddr/configurations"
import {
  validateDdrCircuit,
  validateTopDdrCircuit,
  validateTopDdrGlobalRouting,
} from "../src/ddr/validate-ddr-circuit"

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
  const routingState =
    "createRoutingState" in configuration
      ? configuration.createRoutingState()
      : undefined
  circuit.add(
    "createRoutingState" in configuration
      ? configuration.Board({ routingState })
      : configuration.Board(),
  )
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
  const routingErrors = circuit.db.pcb_autorouting_error.list()
  if (routingErrors.length)
    throw new Error(routingErrors.map((error) => error.message).join("\n"))
  if (configuration.routingStatus === "routed") validateDdrCircuit(circuitJson)
  else {
    const fanouts = routingState?.fanouts.map((fanout) => fanout.validation)
    if (
      !fanouts ||
      fanouts.length !== 2 ||
      !fanouts.every((fanout) => fanout.valid) ||
      fanouts[0]!.brokenOutConnectionCount !== 135 ||
      fanouts[1]!.brokenOutConnectionCount !== 33 ||
      routingState?.globalValidation?.connectedSignalCount !== 33 ||
      routingState.globalValidation.checkedTraceCount !== 201 ||
      routingState.globalValidation.copperErrorCount !== 0
    )
      throw new Error(
        "Top must route both fanouts and all 33 global connections without copper errors",
      )
    validateTopDdrCircuit(circuitJson)
    validateTopDdrGlobalRouting(circuitJson)
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
      showDebugObjects: configuration.routingStatus === "routed",
      shouldDrawRatsNest: false,
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

  await writeDdrSource(projectRoot, outputDir, configuration)

  console.log(
    `Generated ${configuration.id}: PCB, circuit JSON, and browsable TSX source`,
  )
}
