import type {
  ImplicitBreakoutConnection,
  ImplicitBreakoutPointSolverFn,
} from "@tscircuit/props"
import {
  WindingBreakoutSolver,
  type ConnectionInput,
  type WindingBreakoutSolverInput,
} from "@tscircuit/winding-breakout-point-solver"
import { applyToPoint, rotateDEG } from "transformation-matrix"

// Winding's angular reference and increasing gate axis currently depend on
// world orientation. Solve the rotated pair in the Right reference's frame,
// then return board-space endpoints to core's ordinary fanout coordination.
export function createRotatedDdrWindingSolver(
  rotation: 90 | 180,
): ImplicitBreakoutPointSolverFn {
  return (input) => {
    const toHorizontal = rotateDEG(-rotation)
    const toBoard = rotateDEG(rotation)
    const point = (p: { x: number; y: number }, matrix = toHorizontal) => {
      const out = applyToPoint(matrix, p)
      return { x: Number(out.x.toFixed(12)), y: Number(out.y.toFixed(12)) }
    }
    const connection = (c: ImplicitBreakoutConnection): ConnectionInput => ({
      id: c.connectionId,
      endpoints: c.endpoints.map((e) => ({
        ...e,
        position: point(e.position),
      })),
    })
    const normalized: WindingBreakoutSolverInput = {
      regions: input.regions.map((r) => {
        const cpuEdge = rotation === 90 ? "top" : "left"
        const ramEdge = rotation === 90 ? "bottom" : "right"
        if (r.edge !== cpuEdge && r.edge !== ramEdge)
          throw new Error(
            `Rotated DDR requires facing ${cpuEdge}/${ramEdge} edges`,
          )
        const corners = [
          point({ x: r.bounds.minX, y: r.bounds.minY }),
          point({ x: r.bounds.maxX, y: r.bounds.maxY }),
        ]
        return {
          id: r.regionId,
          edge: r.edge === cpuEdge ? "right" : "left",
          bounds: {
            minX: Math.min(...corners.map((p) => p.x)),
            maxX: Math.max(...corners.map((p) => p.x)),
            minY: Math.min(...corners.map((p) => p.y)),
            maxY: Math.max(...corners.map((p) => p.y)),
          },
        }
      }),
      connections: input.connections.map((c) =>
        "type" in c
          ? {
              type: "differential",
              connections: c.connections.map(connection) as [
                ConnectionInput,
                ConnectionInput,
              ],
            }
          : connection(c),
      ),
      buses: input.buses.map((b) => ({
        id: b.busId,
        connectionIds: b.connectionIds,
        preferredLayers: b.targetLayers,
      })),
      boundaryPointSpacing: input.boundaryPointSpacing,
    }
    // Core orders regions in board space. For Left that puts RAM first, but
    // winding uses regions[0] as its ordering reference. Restore the CPU-first
    // order after normalization, before it assigns exits and layers.
    const solver = new WindingBreakoutSolver({
      ...normalized,
      regions: [...normalized.regions].sort(
        (a, b) => a.bounds.minX - b.bounds.minX,
      ),
    })
    solver.solve()
    return {
      breakoutPoints: solver
        .getOutput()
        .breakoutPoints.map((p) => ({ ...p, ...point(p, toBoard) })),
    }
  }
}

export const topDdrWindingSolver = createRotatedDdrWindingSolver(90)
export const leftDdrWindingSolver = createRotatedDdrWindingSolver(180)
