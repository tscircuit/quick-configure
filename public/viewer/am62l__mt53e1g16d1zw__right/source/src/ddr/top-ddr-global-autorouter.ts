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

type Point = { x: number; y: number }
type Route = SimplifiedPcbTrace["route"]
const signalLayers = ["top", "inner4", "inner5", "inner6", "bottom"]
const traceWidth = 0.08128
const gridStep = 0.1
const minX = -12
const minY = 1.2
const columns = 241
const rows = 52
const cellsPerLayer = columns * rows
const gridPosition = (index: number): Point => ({
  x: minX + (index % columns) * gridStep,
  y: minY + Math.floor(index / columns) * gridStep,
})
const gridIndex = (point: Point) =>
  Math.round((point.y - minY) / gridStep) * columns +
  Math.round((point.x - minX) / gridStep)
const wire = (point: Point & { layer: string }): Route[number] => ({
  ...point,
  route_type: "wire",
  width: traceWidth,
})

function distanceToSegment(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) /
        (dx * dx + dy * dy || 1),
    ),
  )
  return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy)
}

// A deterministic A* channel router for Top's two parallel fanout boundaries.
// The 0.4 mm entry pitch leaves room for full-stack vias. Separate entry ramps
// preserve each fanout's track order before the middle channel crosses nets.
// Reserve every pending terminal's via site so earlier routes cannot seal it.
export function routeTopDdrChannel(
  input: SimpleRouteJson,
): SimplifiedPcbTrace[] {
  if (input.connections.length !== 33)
    throw new Error("Expected 33 global DDR connections")
  const ranked = [0, 1].map((side) =>
    input.connections
      .map((connection, index) => ({
        index,
        point: connection.pointsToConnect[side]!,
      }))
      .sort(
        (a, b) =>
          a.point.x - b.point.x || a.point.layer.localeCompare(b.point.layer),
      ),
  )
  const entries = input.connections.map((connection, index) =>
    connection.pointsToConnect.map((point, side) => {
      const rank = ranked[side]!.findIndex((entry) => entry.index === index)
      const grid = {
        x: -6.4 + rank * 0.4,
        y: side === 0 ? minY : minY + (rows - 1) * gridStep,
        layer: point.layer,
      }
      return {
        point,
        grid,
        route: [
          point,
          {
            x: grid.x,
            y: grid.y + (side === 0 ? -0.5 : 0.5),
            layer: point.layer,
          },
          grid,
        ].map(wire),
      }
    }),
  )
  const order = input.connections
    .map((_, index) => index)
    .sort(
      (a, b) =>
        Math.abs(entries[b]![0]!.grid.x - entries[b]![1]!.grid.x) -
        Math.abs(entries[a]![0]!.grid.x - entries[a]![1]!.grid.x),
    )

  // Promote a blocked connection and reroute the channel, bounded at 48 passes.
  for (let attempt = 0; attempt < 48; attempt++) {
    const traces: SimplifiedPcbTrace[] = []
    let blockedConnection = -1
    for (const connectionIndex of order) {
      const connection = input.connections[connectionIndex]!
      const [start, end] = entries[connectionIndex]!
      const blocked = signalLayers.map(() => new Uint8Array(cellsPerLayer))
      const blockedVias = new Uint8Array(cellsPerLayer)
      const mark = (a: Point, b: Point, radius: number, cells: Uint8Array) => {
        const left = Math.max(
          0,
          Math.floor((Math.min(a.x, b.x) - radius - minX) / gridStep),
        )
        const right = Math.min(
          columns - 1,
          Math.ceil((Math.max(a.x, b.x) + radius - minX) / gridStep),
        )
        const bottom = Math.max(
          0,
          Math.floor((Math.min(a.y, b.y) - radius - minY) / gridStep),
        )
        const top = Math.min(
          rows - 1,
          Math.ceil((Math.max(a.y, b.y) + radius - minY) / gridStep),
        )
        for (let y = bottom; y <= top; y++)
          for (let x = left; x <= right; x++) {
            const index = y * columns + x
            if (distanceToSegment(gridPosition(index), a, b) < radius - 1e-6)
              cells[index] = 1
          }
      }
      const markRoute = (route: Route) => {
        for (const [index, point] of route.entries()) {
          if (point.route_type === "via") {
            for (const cells of blocked) mark(point, point, 0.22, cells)
            mark(point, point, 0.33, blockedVias)
          } else if (point.route_type === "wire") {
            const previous = route[index - 1]
            if (
              previous?.route_type === "wire" &&
              previous.layer === point.layer
            ) {
              mark(
                previous,
                point,
                0.145,
                blocked[signalLayers.indexOf(point.layer)]!,
              )
              mark(previous, point, 0.225, blockedVias)
            }
          }
        }
      }
      for (const trace of traces) markRoute(trace.route)
      for (let index = 0; index < entries.length; index++) {
        if (index === connectionIndex) continue
        for (const entry of entries[index]!) {
          markRoute(entry.route)
          for (const cells of blocked)
            mark(entry.grid, entry.grid, 0.225, cells)
          mark(entry.grid, entry.grid, 0.33, blockedVias)
        }
      }
      const first =
        signalLayers.indexOf(start!.grid.layer) * cellsPerLayer +
        gridIndex(start!.grid)
      const last =
        signalLayers.indexOf(end!.grid.layer) * cellsPerLayer +
        gridIndex(end!.grid)
      const costs = new Float64Array(cellsPerLayer * signalLayers.length).fill(
        Infinity,
      )
      const previous = new Int32Array(costs.length).fill(-1)
      const heap: Array<{ id: number; cost: number; priority: number }> = []
      const push = (id: number, cost: number) => {
        const cell = id % cellsPerLayer
        const target = last % cellsPerLayer
        const distance =
          Math.abs((cell % columns) - (target % columns)) +
          Math.abs(Math.floor(cell / columns) - Math.floor(target / columns))
        let index = heap.length
        heap.push({
          id,
          cost,
          priority:
            cost +
            distance +
            (Math.floor(id / cellsPerLayer) === Math.floor(last / cellsPerLayer)
              ? 0
              : 15),
        })
        while (index > 0) {
          const parent = (index - 1) >> 1
          if (heap[parent]!.priority <= heap[index]!.priority) break
          ;[heap[parent], heap[index]] = [heap[index]!, heap[parent]!]
          index = parent
        }
      }
      const pop = () => {
        const result = heap[0]!
        const tail = heap.pop()!
        if (heap.length) {
          heap[0] = tail
          let index = 0
          while (true) {
            let child = index * 2 + 1
            if (child >= heap.length) break
            if (
              child + 1 < heap.length &&
              heap[child + 1]!.priority < heap[child]!.priority
            )
              child++
            if (heap[index]!.priority <= heap[child]!.priority) break
            ;[heap[index], heap[child]] = [heap[child]!, heap[index]!]
            index = child
          }
        }
        return result
      }
      costs[first] = 0
      push(first, 0)
      let solved = false
      while (heap.length) {
        const current = pop()
        if (current.cost !== costs[current.id]) continue
        if (current.id === last) {
          solved = true
          break
        }
        const cell = current.id % cellsPerLayer
        const layer = Math.floor(current.id / cellsPerLayer)
        const x = cell % columns
        const y = Math.floor(cell / columns)
        const visit = (id: number, cost: number) => {
          if (cost >= costs[id]!) return
          costs[id] = cost
          previous[id] = current.id
          push(id, cost)
        }
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          if (
            x + dx! < 0 ||
            x + dx! >= columns ||
            y + dy! < 0 ||
            y + dy! >= rows
          )
            continue
          const next = cell + dx! + dy! * columns
          if (!blocked[layer]![next])
            visit(layer * cellsPerLayer + next, current.cost + 1)
        }
        if (!blockedVias[cell])
          for (
            let nextLayer = 0;
            nextLayer < signalLayers.length;
            nextLayer++
          ) {
            if (nextLayer !== layer && !blocked[nextLayer]![cell])
              visit(nextLayer * cellsPerLayer + cell, current.cost + 25)
          }
      }
      if (!solved) {
        blockedConnection = connectionIndex
        break
      }
      const path: number[] = []
      for (let index = last; index >= 0; index = previous[index]!)
        path.push(index)
      path.reverse()
      const route: Route = [...start!.route]
      let previousLayer = Math.floor(path[0]! / cellsPerLayer)
      for (const index of path) {
        const point = gridPosition(index % cellsPerLayer)
        const layer = Math.floor(index / cellsPerLayer)
        if (layer !== previousLayer) {
          route.push({
            ...point,
            route_type: "via",
            from_layer: signalLayers[previousLayer]!,
            to_layer: signalLayers[layer]!,
            via_diameter: 0.24,
            via_hole_diameter: 0.1,
          })
          previousLayer = layer
        }
        route.push(wire({ ...point, layer: signalLayers[layer]! }))
      }
      route.push(...end!.route.toReversed())
      traces.push({
        type: "pcb_trace",
        pcb_trace_id: `ddr_top_global_${connectionIndex}`,
        connection_name: connection.name,
        route: simplifyCollinear(route),
      })
    }
    if (blockedConnection < 0) return traces
    order.splice(order.indexOf(blockedConnection), 1)
    order.unshift(blockedConnection)
  }
  throw new Error(
    "Could not route all 33 DDR connections with the configured channel clearance",
  )
}

function simplifyCollinear(route: Route): Route {
  const result: Route = []
  for (const point of route) {
    const last = result.at(-1)
    if (
      last?.route_type === "wire" &&
      point.route_type === "wire" &&
      last.layer === point.layer &&
      Math.hypot(last.x - point.x, last.y - point.y) < 1e-9
    )
      continue
    const before = result.at(-2)
    if (
      before?.route_type === "wire" &&
      last?.route_type === "wire" &&
      point.route_type === "wire" &&
      before.layer === last.layer &&
      last.layer === point.layer
    ) {
      const cross =
        (last.x - before.x) * (point.y - last.y) -
        (last.y - before.y) * (point.x - last.x)
      const dot =
        (last.x - before.x) * (point.x - last.x) +
        (last.y - before.y) * (point.y - last.y)
      if (Math.abs(cross) < 1e-9 && dot >= 0) result.pop()
    }
    result.push(point)
  }
  return result
}

export function createTopDdrGlobalAutorouter(state: DdrFanoutState) {
  return async (
    phaseInput: SimpleRouteJson,
  ): Promise<GenericLocalAutorouter> => {
    if (state.fanouts.length !== 2)
      throw new Error("Both fanouts must complete before global routing")
    const input: SimpleRouteJson = {
      ...phaseInput,
      connections: phaseInput.connections.map((connection) => ({
        ...connection,
        pointsToConnect: connection.pointsToConnect
          .map((point) => {
            const exit = point.pointId && state.exits.get(point.pointId)
            if (!exit)
              throw new Error(`Missing solved fanout exit: ${point.pointId}`)
            return { ...point, x: exit.x, y: exit.y, layer: exit.layer }
          })
          .sort((a, b) => a.y - b.y),
      })),
    }
    const solve = () => {
      const traces = routeTopDdrChannel(input)
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
        connectedSignalCount: input.connections.length,
        checkedTraceCount: drc.checkedTraceCount,
        copperErrorCount: drc.issues.length,
      }
      console.log(
        `Global DDR: 33/33 signals connected; ${drc.checkedTraceCount} board traces checked, ${drc.issues.length} copper errors`,
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
  const original = {
    ...state.fanouts[0]!.input,
    bounds: { minX: -16, maxX: 16, minY: -27, maxY: 27 },
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
          )!.source_trace_id ?? trace.connection_name,
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
