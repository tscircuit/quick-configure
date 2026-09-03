import {
  FanoutSolver,
  validateRoutedCopperDrc,
} from "@tscircuit/fanout-solver"
import type { SimpleRouteJson } from "@tscircuit/capacity-autorouter"

// Board-world points in mm: +X is right, +Y is up. RAM is above the CPU.
// Keep the CPU's actual exit layer and track order for every RAM connection.
const { input, options } = await Bun.file(
  new URL("./input.json", import.meta.url),
).json()
const solver = new FanoutSolver(input, options)
solver.solve()
if (!solver.solved) {
  console.error(solver.bestAttempt?.summary)
  throw new Error(solver.error ?? "Coordinated RAM fanout did not complete")
}
const output = solver.getOutput()
if (!output.validation.valid) throw new Error("Fanout failed independent validation")
const targets = new Map<string, { x: number; y: number; layer: string }>(
  options.buses.flatMap((bus: { connectionExitTargets: Record<string, { x: number; y: number; layer: string }> }) => Object.entries(bus.connectionExitTargets)),
)
const connections = output.simpleRouteJson.connections.map((connection) => {
  const cpuExit = targets.get(connection.name)!
  const ramExit = connection.pointsToConnect.find((point) => point.pointId?.startsWith("fanout-exit:"))!
  if (!("layer" in ramExit) || ramExit.layer !== cpuExit.layer)
    throw new Error(`Mismatched exit layers for ${connection.name}`)
  return { name: connection.name, pointsToConnect: [cpuExit, ramExit] }
})
if (connections.length !== 33) throw new Error("Expected all 33 DDR signals")
const globalInput: SimpleRouteJson = { ...input, connections, buses: [], differentialPairs: [], obstacles: [], traces: [] }
const globalOutput: SimpleRouteJson = { ...globalInput, traces: connections.map((connection, index) => ({
  type: "pcb_trace", pcb_trace_id: `global_${index}`, connection_name: connection.name,
  route: connection.pointsToConnect.map((point) => ({ route_type: "wire", x: point.x, y: point.y, layer: point.layer, width: input.minTraceWidth })),
})) }
const clearance = validateRoutedCopperDrc({ inputSrj: globalInput, routedSrj: globalOutput, clearance: 0.05, allowBlindAndBuriedVias: false })
if (!clearance.valid) throw new Error(`Global exit order still crosses copper: ${JSON.stringify(clearance.issues)}`)
console.log("33/33 RAM fanout connections; paired layers match; 33 direct global traces with zero vias and zero copper errors")
