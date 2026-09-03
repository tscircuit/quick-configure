import { validateOriginalEndpointConnectivity } from "@tscircuit/fanout-solver"
import type { SimpleRouteJson } from "@tscircuit/capacity-autorouter"
import type { AnyCircuitElement } from "circuit-json"
import {
  AM62L_DIRECT_POWER_BALLS,
  DDR_SIGNAL_CONNECTIONS,
} from "./am62l-lpddr4"

// Match core's reference one-for-one: these 45 processor power balls have
// logical PDN membership, with their segmented power planes left to the host
// board. Every other connectivity, routing, or clearance error is unexpected.
export function validateDdrCircuit(circuitJson: AnyCircuitElement[]) {
  const expectedMessages = new Set(
    AM62L_DIRECT_POWER_BALLS.map(
      (ball) =>
        `Port [U1.${ball.ballName}] is not connected to net [${ball.railNetName}] by a PCB trace.`,
    ),
  )
  const errors = circuitJson.filter((record) => record.type.endsWith("_error"))
  for (const error of errors) {
    if (
      error.type !== "pcb_port_not_connected_error" ||
      !expectedMessages.delete(error.message)
    ) {
      throw new Error(`Unexpected DDR circuit error: ${JSON.stringify(error)}`)
    }
  }
  if (expectedMessages.size) {
    throw new Error(
      `Missing ${expectedMessages.size} expected processor PDN membership diagnostics`,
    )
  }
}

// Top's 33 DDR signals must each have CPU, RAM, and global copper, with a
// physical path all the way between package pads. Reject all DRC errors.
export function validateTopDdrCircuit(circuitJson: AnyCircuitElement[]) {
  const errors = circuitJson.filter((record) => record.type.endsWith("_error"))
  if (errors.length)
    throw new Error(
      `Unexpected Top circuit error: ${JSON.stringify(errors[0])}`,
    )
  const sourceTraces = circuitJson.filter(
    (record) => record.type === "source_trace",
  )
  const pcbTraces = circuitJson.filter((record) => record.type === "pcb_trace")
  const ports = circuitJson.filter((record) => record.type === "pcb_port")
  if (sourceTraces.length !== 135 || pcbTraces.length !== 201)
    throw new Error("Expected 135 CPU, 33 RAM, and 33 global DDR traces")
  const connections = DDR_SIGNAL_CONNECTIONS.map((signal) => {
    const source = sourceTraces.find((trace) => trace.name === signal.traceName)
    if (
      !source ||
      pcbTraces.filter(
        (trace) => trace.source_trace_id === source.source_trace_id,
      ).length !== 3
    )
      throw new Error(`Missing fanout or global copper for ${signal.traceName}`)
    if (source.connected_source_port_ids.length !== 2)
      throw new Error(`Expected CPU and RAM endpoints for ${signal.traceName}`)
    return {
      name: source.source_trace_id,
      pointsToConnect: source.connected_source_port_ids.map((id) => {
        const port = ports.find((port) => port.source_port_id === id)
        if (!port) throw new Error(`Missing PCB port ${id}`)
        return {
          x: port.x,
          y: port.y,
          layer: port.layers[0]!,
          pointId: port.pcb_port_id,
        }
      }),
    }
  })
  const signalIds = new Set(connections.map((connection) => connection.name))
  const input = {
    layerCount: 8,
    minTraceWidth: 0.08128,
    bounds: { minX: -16, maxX: 16, minY: -27, maxY: 27 },
    connections,
    obstacles: [],
  } as SimpleRouteJson
  const routed = {
    ...input,
    traces: pcbTraces
      .filter((trace) => signalIds.has(trace.source_trace_id!))
      .map((trace) => ({ ...trace, connection_name: trace.source_trace_id })),
  } as SimpleRouteJson
  const connectivity = validateOriginalEndpointConnectivity({
    inputSrj: input,
    routedSrj: routed,
  })
  if (!connectivity.valid || connectivity.connectedConnectionCount !== 33)
    throw new Error(`Disconnected DDR copper: ${JSON.stringify(connectivity)}`)
}

// The global segment is the trace joining the two exported breakout points.
// Inspect emitted copper, so a later router cannot silently reintroduce vias.
export function validateTopDdrGlobalRouting(circuitJson: AnyCircuitElement[]) {
  const exits = circuitJson.filter(
    (record) => record.type === "pcb_breakout_point",
  )
  const traces = circuitJson.filter((record) => record.type === "pcb_trace")
  for (const signal of DDR_SIGNAL_CONNECTIONS) {
    const source = circuitJson.find(
      (record) =>
        record.type === "source_trace" && record.name === signal.traceName,
    )
    if (source?.type !== "source_trace")
      throw new Error(`Missing DDR signal ${signal.traceName}`)
    const pairedExits = exits.filter(
      (exit) => exit.source_trace_id === source.source_trace_id,
    )
    if (
      pairedExits.length !== 2 ||
      pairedExits[0]!.layer !== pairedExits[1]!.layer
    )
      throw new Error(
        `Top fanout exits must use one layer for ${signal.traceName}`,
      )
    const globalTraces = traces.filter(
      (trace) =>
        trace.source_trace_id === source.source_trace_id &&
        pairedExits.every((exit) =>
          [trace.route[0], trace.route.at(-1)].some(
            (point) =>
              point?.route_type === "wire" &&
              point.layer === exit.layer &&
              Math.hypot(point.x - exit.x, point.y - exit.y) < 1e-6,
          ),
        ),
    )
    if (
      globalTraces.length !== 1 ||
      globalTraces[0]!.route.some(
        (point) =>
          point.route_type !== "wire" || point.layer !== pairedExits[0]!.layer,
      )
    )
      throw new Error(
        `Top global routing must connect ${signal.traceName} without vias`,
      )
  }
}
