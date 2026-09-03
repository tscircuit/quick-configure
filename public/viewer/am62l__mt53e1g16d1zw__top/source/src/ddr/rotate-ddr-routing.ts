import type { SimpleRouteJson, SimplifiedPcbTrace } from "@tscircuit/core"
import type { FanoutExitPosition } from "@tscircuit/fanout-solver"
import { applyToPoint, rotateDEG } from "transformation-matrix"

// Board-space millimeters, +X right and +Y up. Normalize a quarter-turned
// reference into the solver's horizontal frame, and invert it for core's
// phase handoff. IDs, nets, layers, widths and clearances remain unchanged.
export function rotateDdrRouting(
  input: SimpleRouteJson,
  degrees: 90 | -90,
  precision?: number,
): SimpleRouteJson {
  const matrix = rotateDEG(degrees)
  const point = <T extends { x: number; y: number }>(p: T): T => {
    const rotated = applyToPoint(matrix, p)
    return {
      ...p,
      x:
        precision === undefined
          ? rotated.x
          : Number(rotated.x.toFixed(precision)),
      y:
        precision === undefined
          ? rotated.y
          : Number(rotated.y.toFixed(precision)),
    }
  }
  const corners = [
    point({ x: input.bounds.minX, y: input.bounds.minY }),
    point({ x: input.bounds.maxX, y: input.bounds.maxY }),
  ]
  return {
    ...input,
    bounds: {
      minX: Math.min(...corners.map((p) => p.x)),
      maxX: Math.max(...corners.map((p) => p.x)),
      minY: Math.min(...corners.map((p) => p.y)),
      maxY: Math.max(...corners.map((p) => p.y)),
    },
    obstacles: input.obstacles.map((obstacle) => ({
      ...obstacle,
      center: point(obstacle.center),
      width: obstacle.height,
      height: obstacle.width,
    })),
    connections: input.connections.map((connection) => ({
      ...connection,
      pointsToConnect: connection.pointsToConnect.map(point),
    })),
    buses: input.buses?.map((bus) => ({
      ...bus,
      ...(bus.connectionExitTargets
        ? {
            connectionExitTargets: Object.fromEntries(
              Object.entries(bus.connectionExitTargets).map(
                ([name, target]) => [name, point(target)],
              ),
            ),
          }
        : {}),
    })),
    traces: input.traces?.map((trace) => ({
      ...trace,
      route: trace.route.map((p) => ("x" in p ? point(p) : p)),
    })) as SimplifiedPcbTrace[] | undefined,
  }
}

const clockwiseExits: Partial<Record<FanoutExitPosition, FanoutExitPosition>> =
  {
    topside_left: "rightside_top",
    topside_center: "rightside_center",
    topside_right: "rightside_bottom",
    bottomside_left: "leftside_top",
    bottomside_center: "leftside_center",
    bottomside_right: "leftside_bottom",
  }
export function rotateDdrExitDirections(
  directions: Readonly<Record<string, FanoutExitPosition>>,
) {
  return Object.fromEntries(
    Object.entries(directions).map(([bus, direction]) => {
      const rotated = clockwiseExits[direction]
      if (!rotated)
        throw new Error(`Expected a Top fanout direction, got ${direction}`)
      return [bus, rotated]
    }),
  )
}
