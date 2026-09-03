import { rotateDdrRouting } from "./rotate-ddr-routing"
import { routeDirectDdrConnections } from "./direct-ddr-autorouter"
import {
  validateOriginalEndpointConnectivity,
  validateRoutedCopperDrc,
} from "@tscircuit/fanout-solver"
import type {
  AutorouterCompleteEvent,
  AutorouterErrorEvent,
  GenericLocalAutorouter,
  SimpleRouteJson,
  SimplifiedPcbTrace,
} from "@tscircuit/core"
import type { SimpleRouteJson as SolverInput } from "@tscircuit/capacity-autorouter"
import type { DdrFanoutState } from "./latest-fanout-autorouter"

// Core supplies the actual paired fanout exits. Join them on their shared
// copper layer; incompatible exits must be fixed in the fanout configuration.
function routeCoordinatedExits(input: SimpleRouteJson): SimplifiedPcbTrace[] {
  return input.connections.map((connection, index) => {
    const [start, end] = connection.pointsToConnect
    if (
      !start ||
      !end ||
      connection.pointsToConnect.length !== 2 ||
      start.layer !== end.layer
    )
      throw new Error(
        `Uncoordinated fanout layers for ${connection.name}: ${connection.pointsToConnect.map((point) => point.layer).join(" -> ")}`,
      )
    return {
      type: "pcb_trace",
      pcb_trace_id: `ddr_coordinated_global_${index}`,
      connection_name: connection.name,
      route: connection.pointsToConnect.map((point) => ({
        route_type: "wire",
        x: point.x,
        y: point.y,
        layer: point.layer,
        width: connection.nominalTraceWidth ?? input.minTraceWidth,
      })),
    }
  })
}

export function createCoordinatedDdrGlobalAutorouter(
  state: DdrFanoutState,
  referenceRotation: 90 | 180 = 90,
) {
  return async (input: SimpleRouteJson): Promise<GenericLocalAutorouter> => {
    if (state.fanouts.length !== 2)
      throw new Error("Both fanouts must complete before global routing")
    const solve = () => {
      const capacitorConnections = input.connections.filter(
        (connection) => connection.pointsToConnect.length === 1,
      )
      const signalInput = {
        ...input,
        connections: input.connections.filter(
          (connection) => !capacitorConnections.includes(connection),
        ),
      }
      const capacitorInput = rotateDdrRouting(
        { ...input, connections: capacitorConnections },
        referenceRotation === 90 ? -90 : -180,
      )
      const capacitorTraces =
        rotateDdrRouting(
          {
            ...capacitorInput,
            traces: routeDirectDdrConnections(capacitorInput),
          },
          referenceRotation,
        ).traces ?? []
      const traces = [...routeCoordinatedExits(signalInput), ...capacitorTraces]
      const { connectivity, drc } = validateCompleteRouting(
        state,
        input,
        traces,
      )
      if (!connectivity.valid || !drc.valid)
        throw new Error(
          `Invalid DDR routing: ${JSON.stringify({ connectivity, drc })}`,
        )
      state.globalValidation = {
        connectedSignalCount: signalInput.connections.length,
        checkedTraceCount: drc.checkedTraceCount,
        copperErrorCount: drc.issues.length,
      }
      console.log(
        `Global DDR: ${signalInput.connections.length}/${signalInput.connections.length} signals connected; ${drc.checkedTraceCount} board traces checked, ${drc.issues.length} copper errors`,
      )
      return traces
    }
    let complete: ((event: AutorouterCompleteEvent) => void) | undefined
    let error: ((event: AutorouterErrorEvent) => void) | undefined
    const autorouter: GenericLocalAutorouter = {
      input,
      isRouting: false,
      start() {
        this.isRouting = true
        queueMicrotask(() => {
          if (!this.isRouting) return
          try {
            const traces = solve()
            this.isRouting = false
            complete?.({ type: "complete", traces })
          } catch (cause) {
            this.isRouting = false
            error?.({
              type: "error",
              error: cause instanceof Error ? cause : new Error(String(cause)),
            })
          }
        })
      },
      stop() {
        this.isRouting = false
      },
      on(event, callback) {
        if (event === "complete") complete = callback as typeof complete
        if (event === "error") error = callback as typeof error
      },
      solveSync: solve,
    }
    return autorouter
  }
}

// Audit the complete copper against the original pads, including fanout-to-
// global joins. Core's intermediate phase obstacles include generated trace
// bounding boxes; use the original pad geometry and the actual routed copper.
function validateCompleteRouting(
  state: DdrFanoutState,
  globalInput: SimpleRouteJson,
  globalTraces: SimplifiedPcbTrace[],
) {
  const aliases = new Map(
    state.fanouts.flatMap((fanout) =>
      fanout.input.connections.map(
        (connection) =>
          [
            connection.name,
            connection.source_trace_id ?? connection.name,
          ] as const,
      ),
    ),
  )
  const connections = new Map<string, SimpleRouteJson["connections"][number]>()
  for (const fanout of state.fanouts)
    for (const connection of fanout.input.connections) {
      const name = aliases.get(connection.name)!
      const combined = connections.get(name) ?? {
        ...connection,
        name,
        pointsToConnect: [],
      }
      combined.pointsToConnect.push(
        ...connection.pointsToConnect.filter(
          (point) => !point.pointId?.startsWith("pcb_breakout_point_"),
        ),
      )
      connections.set(name, combined)
    }
  for (const connection of globalInput.connections) {
    const name = connection.source_trace_id ?? connection.name
    if (!connections.has(name)) connections.set(name, { ...connection, name })
  }
  const original = {
    ...state.fanouts[0]!.input,
    bounds: globalInput.bounds,
    connections: [...connections.values()],
    obstacles: state.fanouts[0]!.input.obstacles.map((obstacle) => ({
      ...obstacle,
      connectedTo: obstacle.connectedTo.map((id) => aliases.get(id) ?? id),
    })),
  } as unknown as SolverInput
  const routed = {
    ...original,
    traces: [
      ...state.fanouts.flatMap((fanout) =>
        fanout.traces.map((trace) => ({
          ...trace,
          connection_name:
            aliases.get(trace.connection_name!) ?? trace.connection_name,
        })),
      ),
      ...globalTraces.map((trace) => ({
        ...trace,
        connection_name:
          globalInput.connections.find(
            (connection) => connection.name === trace.connection_name,
          )?.source_trace_id ?? trace.connection_name,
      })),
    ],
  } as unknown as SolverInput
  return {
    connectivity: validateOriginalEndpointConnectivity({
      inputSrj: original,
      routedSrj: routed,
    }),
    drc: validateRoutedCopperDrc({
      inputSrj: original,
      routedSrj: routed,
      clearance: 0.05,
      allowBlindAndBuriedVias: false,
    }),
  }
}
