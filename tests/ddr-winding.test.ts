import { expect, test } from "bun:test"
import {
  WindingBreakoutSolver,
  type WindingBreakoutSolverInput,
  type ConnectionInput,
} from "@tscircuit/winding-breakout-point-solver"
import type { ImplicitBreakoutPointSolverInput } from "@tscircuit/props"
import { applyToPoint, rotateDEG } from "transformation-matrix"
import { createRotatedDdrWindingSolver } from "../src/ddr/rotated-ddr-winding-solver"

test.each([90, 180] as const)(
  "A %d degree layout preserves Right winding order, layers, and paired identities",
  async (degrees) => {
    const connections: ConnectionInput[] = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
      [0, -1],
      [0, 1],
    ].map(([x, y], index) => ({
      id: `net${index}`,
      endpoints: [
        { regionId: "cpu", position: { x: -5 + x!, y: y! } },
        { regionId: "ram", position: { x: 5 + x!, y: y! } },
      ],
    }))
    const input: WindingBreakoutSolverInput = {
      regions: [
        {
          id: "cpu",
          bounds: { minX: -8, maxX: -2, minY: -3, maxY: 3 },
          edge: "right",
        },
        {
          id: "ram",
          bounds: { minX: 2, maxX: 8, minY: -3, maxY: 3 },
          edge: "left",
        },
      ],
      connections: [
        ...connections.slice(0, 4),
        {
          type: "differential",
          connections: [connections[4]!, connections[5]!],
        },
      ],
      buses: [
        {
          id: "data",
          connectionIds: ["net0", "net1", "net2", "net3"],
          preferredLayers: ["top", "inner4"],
        },
        {
          id: "clock",
          connectionIds: ["net4", "net5"],
          preferredLayers: ["bottom"],
        },
      ],
      boundaryPointSpacing: 0.3,
    }
    const baseline = new WindingBreakoutSolver(input)
    baseline.solve()
    const rotation = rotateDEG(degrees)
    const rotate = (p: { x: number; y: number }) => applyToPoint(rotation, p)
    const mapConnection = (c: ConnectionInput) => ({
      connectionId: c.id,
      endpoints: c.endpoints.map((e) => ({
        ...e,
        position: rotate(e.position),
      })),
    })
    const top: ImplicitBreakoutPointSolverInput = {
      regions: input.regions.map((r) => {
        const corners = [
          rotate({ x: r.bounds.minX, y: r.bounds.minY }),
          rotate({ x: r.bounds.maxX, y: r.bounds.maxY }),
        ]
        return {
          regionId: r.id,
          edge:
            degrees === 90
              ? r.edge === "right"
                ? "top"
                : "bottom"
              : r.edge === "right"
                ? "left"
                : "right",
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
              connections: [
                mapConnection(c.connections[0]),
                mapConnection(c.connections[1]),
              ],
            }
          : mapConnection(c),
      ),
      buses: input.buses.map((b) => ({
        busId: b.id,
        connectionIds: b.connectionIds,
        targetLayers: b.preferredLayers,
      })),
      boundaryPointSpacing: input.boundaryPointSpacing,
    }
    const rotatedInput =
      degrees === 180 ? { ...top, regions: [...top.regions].reverse() } : top
    const before = structuredClone(rotatedInput)
    const actual = await createRotatedDdrWindingSolver(degrees)(rotatedInput)
    expect(rotatedInput).toEqual(before)
    expect(actual.breakoutPoints).toHaveLength(12)
    for (const point of baseline.getOutput().breakoutPoints) {
      const found = actual.breakoutPoints.find(
        (p) =>
          p.regionId === point.regionId &&
          p.connectionId === point.connectionId,
      )!
      expect(found.layer).toBe(point.layer)
      expect(found.x).toBeCloseTo(rotate(point).x, 10)
      expect(found.y).toBeCloseTo(rotate(point).y, 10)
    }
  },
)
