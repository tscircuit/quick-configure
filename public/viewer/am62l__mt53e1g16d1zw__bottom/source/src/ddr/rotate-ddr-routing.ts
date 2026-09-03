import type { SimpleRouteJson, SimplifiedPcbTrace } from "@tscircuit/core"
import type { FanoutExitPosition } from "@tscircuit/fanout-solver"
import { applyToPoint, rotateDEG } from "transformation-matrix"

export type DdrReferenceRotation = 90 | 180 | 270

export const inverseDdrRotation = (rotation: DdrReferenceRotation) =>
  (({ 90: -90, 180: -180, 270: -270 }) as const)[rotation]

// Board-space millimeters, +X right and +Y up. Normalize a rotated
// reference into the solver's horizontal frame, and invert it for core's
// phase handoff. IDs, nets, layers, widths and clearances remain unchanged.
export function rotateDdrRouting(
  input: SimpleRouteJson,
  degrees: DdrReferenceRotation | -90 | -180 | -270,
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
      width: Math.abs(degrees) % 180 === 90 ? obstacle.height : obstacle.width,
      height: Math.abs(degrees) % 180 === 90 ? obstacle.width : obstacle.height,
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
    rightside_top: "bottomside_right",
    rightside_center: "bottomside_center",
    rightside_bottom: "bottomside_left",
    leftside_top: "topside_right",
    leftside_center: "topside_center",
    leftside_bottom: "topside_left",
  }
export function rotateDdrExitDirections(
  directions: Readonly<Record<string, FanoutExitPosition>>,
  referenceRotation: DdrReferenceRotation,
) {
  return Object.fromEntries(
    Object.entries(directions).map(([bus, direction]) => {
      let rotated = direction
      for (let turn = 0; turn < referenceRotation / 90; turn++) {
        const next = clockwiseExits[rotated]
        if (!next)
          throw new Error(`Unsupported fanout exit direction: ${direction}`)
        rotated = next
      }
      return [bus, rotated]
    }),
  )
}
