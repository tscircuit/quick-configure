import {
  rotateDdrRouting,
  rotateDdrExitDirections,
  inverseDdrRotation,
  type DdrReferenceRotation,
} from "./rotate-ddr-routing"
import {
  FanoutSolver,
  type FanoutDirection,
  type FanoutExitPosition,
  type FanoutSolverOptions,
} from "@tscircuit/fanout-solver"
import type {
  AutorouterCompleteEvent,
  AutorouterErrorEvent,
  AutorouterProgressEvent,
  GenericLocalAutorouter,
  SimpleRouteBus,
  SimpleRouteJson,
  SimpleRoutePoint,
  SimplifiedPcbTrace,
} from "@tscircuit/core"

// Keep the solver explicit while core's fanout preset coordinates phase exits.
// Paired targets supplied by core are preserved when adapting the bus options.
const signalLayers = ["top", "inner4", "inner5", "inner6", "bottom"]
const getSourceComponentIdForPoint = (
  input: SimpleRouteJson,
  point: SimpleRoutePoint,
): string | undefined =>
  input.obstacles.find(
    (obstacle) =>
      obstacle.componentId &&
      obstacle.layers.includes(point.layer) &&
      ((point.pointId && obstacle.connectedTo.includes(point.pointId)) ||
        (point.x >= obstacle.center.x - obstacle.width / 2 &&
          point.x <= obstacle.center.x + obstacle.width / 2 &&
          point.y >= obstacle.center.y - obstacle.height / 2 &&
          point.y <= obstacle.center.y + obstacle.height / 2)),
  )?.componentId

const inferPlaneBusDirection = (
  input: SimpleRouteJson,
  bus: SimpleRouteBus,
): FanoutDirection | undefined => {
  const connectionNames = new Set(bus.connectionNames)
  const sourcePointsByComponentId = new Map<string, SimpleRoutePoint[]>()
  for (const connection of input.connections) {
    if (!connectionNames.has(connection.name)) continue
    for (const point of connection.pointsToConnect) {
      const componentId = getSourceComponentIdForPoint(input, point)
      if (!componentId) continue
      const sourcePoints = sourcePointsByComponentId.get(componentId) ?? []
      sourcePoints.push(point)
      sourcePointsByComponentId.set(componentId, sourcePoints)
    }
  }
  const sourceComponent = [...sourcePointsByComponentId.entries()].sort(
    ([firstId, firstPoints], [secondId, secondPoints]) =>
      secondPoints.length - firstPoints.length ||
      firstId.localeCompare(secondId),
  )[0]
  if (!sourceComponent) return undefined

  const [componentId, sourcePoints] = sourceComponent
  const componentObstacles = input.obstacles.filter(
    (obstacle) => obstacle.componentId === componentId,
  )
  if (componentObstacles.length === 0) return undefined

  const minX = Math.min(...componentObstacles.map(({ center }) => center.x))
  const maxX = Math.max(...componentObstacles.map(({ center }) => center.x))
  const minY = Math.min(...componentObstacles.map(({ center }) => center.y))
  const maxY = Math.max(...componentObstacles.map(({ center }) => center.y))
  const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
  const average = {
    x:
      sourcePoints.reduce((sum, point) => sum + point.x, 0) /
      sourcePoints.length,
    y:
      sourcePoints.reduce((sum, point) => sum + point.y, 0) /
      sourcePoints.length,
  }
  const normalizedX = (average.x - center.x) / Math.max((maxX - minX) / 2, 1e-6)
  const normalizedY = (average.y - center.y) / Math.max((maxY - minY) / 2, 1e-6)
  if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
    return normalizedX >= 0 ? "right" : "left"
  }
  if (Math.abs(normalizedY) > 1e-9) return normalizedY >= 0 ? "up" : "down"
  return "right"
}

const createFanoutOptions = (
  input: SimpleRouteJson,
  busDirections: Readonly<Record<string, FanoutExitPosition>>,
): FanoutSolverOptions => {
  const buses = (input.buses ?? []).map((bus) => {
    const { preferredLayer, preferredLayers, ...busWithoutPreferences } = bus
    const requestedLayers = [
      ...(preferredLayer ? [preferredLayer] : []),
      ...(preferredLayers ?? []),
    ].filter((layer, index, layers) => layers.indexOf(layer) === index)
    const allowedLayers = bus.allowedLayers
      ? requestedLayers.filter((layer) => bus.allowedLayers!.includes(layer))
      : requestedLayers
    const exitPosition = busDirections[bus.busId]

    return {
      ...busWithoutPreferences,
      ...(bus.termination?.type === "plane" || !exitPosition
        ? {}
        : { exitPosition }),
      ...(allowedLayers.length > 0 ? { allowedLayers } : {}),
    }
  })
  const planeDirections = Object.fromEntries(
    (input.buses ?? [])
      .filter((bus) => bus.termination?.type === "plane")
      .flatMap((bus) => {
        const direction = inferPlaneBusDirection(input, bus)
        return direction ? [[bus.busId, direction] as const] : []
      }),
  )

  return {
    buses,
    borderDistribution: "even",
    compactBusTracks: true,
    busDirections: planeDirections,
    escapeLayers: [...signalLayers],
    allowBlindAndBuriedVias: false,
    sharedBoundary: input.bounds,
  }
}

export interface DdrFanoutState {
  fanouts: Array<{
    input: SimpleRouteJson
    traces: SimplifiedPcbTrace[]
    validation: ReturnType<FanoutSolver["getOutput"]>["validation"]
  }>
  validation?: ReturnType<FanoutSolver["getOutput"]>["validation"]
  globalValidation?: {
    connectedSignalCount: number
    checkedTraceCount: number
    copperErrorCount: number
  }
}
export const createDdrFanoutState = (): DdrFanoutState => ({
  fanouts: [],
})

export function createDdrFanoutAutorouter(
  busDirections: Readonly<Record<string, FanoutExitPosition>>,
  options: Partial<FanoutSolverOptions> & {
    matchLengths?: boolean
    referenceRotation?: DdrReferenceRotation
    referenceFramePrecision?: number
  } = {},
  state = createDdrFanoutState(),
) {
  return async (input: SimpleRouteJson): Promise<GenericLocalAutorouter> => {
    const {
      matchLengths = true,
      referenceRotation,
      referenceFramePrecision,
      ...solverOptions
    } = options
    const phaseInput = referenceRotation
      ? rotateDdrRouting(
          input,
          inverseDdrRotation(referenceRotation),
          referenceFramePrecision,
        )
      : input
    const phaseOptions = createFanoutOptions(
      phaseInput,
      referenceRotation
        ? rotateDdrExitDirections(busDirections, referenceRotation)
        : busDirections,
    )
    if (!matchLengths)
      phaseOptions.buses = phaseOptions.buses?.map((bus) => ({
        ...bus,
        maxLengthSkew: undefined,
      }))
    const solverInput = {
      ...phaseInput,
      differentialPairs: matchLengths ? phaseInput.differentialPairs : [],
    }
    const solver = new FanoutSolver(
      solverInput as unknown as ConstructorParameters<typeof FanoutSolver>[0],
      {
        ...phaseOptions,
        ...solverOptions,
      },
    )
    const handlers = {
      complete: [] as Array<(event: AutorouterCompleteEvent) => void>,
      error: [] as Array<(event: AutorouterErrorEvent) => void>,
      progress: [] as Array<(event: AutorouterProgressEvent) => void>,
    }
    const outputInBoardFrame = (fanoutOnly = false) => {
      const output = solver.getOutput()
      const sourceComponentIds = new Set(
        solver.preparedBuses.map((bus) => bus.componentId),
      )
      const source = output.simpleRouteJson as unknown as SimpleRouteJson
      const keepouts = [...sourceComponentIds].map((componentId) => {
        const pads = source.obstacles.filter(
          (obstacle) => obstacle.componentId === componentId,
        )
        const minX = Math.min(...pads.map((p) => p.center.x - p.width / 2)),
          maxX = Math.max(...pads.map((p) => p.center.x + p.width / 2))
        const minY = Math.min(...pads.map((p) => p.center.y - p.height / 2)),
          maxY = Math.max(...pads.map((p) => p.center.y + p.height / 2))
        return {
          obstacleId: `fanout-source-keepout:${componentId}`,
          componentId,
          isFanoutSourceKeepout: true,
          type: "rect" as const,
          layers: [
            "top",
            "inner1",
            "inner2",
            "inner3",
            "inner4",
            "inner5",
            "inner6",
            "bottom",
          ],
          center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
          width: maxX - minX,
          height: maxY - minY,
          connectedTo: [],
        }
      })
      const srj = {
        ...source,
        obstacles: [
          ...source.obstacles.filter(
            (o) => !o.componentId || !sourceComponentIds.has(o.componentId),
          ),
          ...keepouts,
        ],
        ...(fanoutOnly ? { traces: output.fanoutTraces } : {}),
      } as unknown as SimpleRouteJson
      return referenceRotation
        ? rotateDdrRouting(srj, referenceRotation, referenceFramePrecision)
        : srj
    }
    const solve = () => {
      const start = Date.now()
      console.log(`Fanout 0.0.54: ${input.connections.length} connections`)
      while (!solver.solved && !solver.failed && Date.now() - start < 120_000)
        solver.step()
      if (!solver.solved)
        throw new Error(
          solver.error ??
            `Fanout timed out after ${Date.now() - start}ms (${solver.progress})`,
        )
      const output = solver.getOutput()
      if (
        !output.validation.valid ||
        output.validation.brokenOutConnectionCount !== input.connections.length
      )
        throw new Error(
          `Incomplete fanout: ${JSON.stringify(output.validation)}`,
        )
      state.fanouts.push({
        input,
        traces: outputInBoardFrame(true).traces!,
        validation: output.validation,
      })
      state.validation = output.validation
      console.log(
        `Fanout solved: ${output.fanoutTraces.length} traces in ${Date.now() - start}ms`,
      )
      return outputInBoardFrame(true).traces!
    }
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
            for (const handler of handlers.complete)
              handler({ type: "complete", traces })
          } catch (error) {
            this.isRouting = false
            for (const handler of handlers.error)
              handler({
                type: "error",
                error:
                  error instanceof Error ? error : new Error(String(error)),
              })
          }
        })
      },
      stop() {
        this.isRouting = false
      },
      on(event, callback) {
        handlers[event].push(callback as never)
      },
      solveSync: solve,
      getOutputSimpleRouteJson() {
        return solver.solved ? outputInBoardFrame() : undefined
      },
    }
    return autorouter
  }
}
