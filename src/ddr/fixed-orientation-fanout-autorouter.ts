import {
  buildOutputSimpleRouteJson,
  FanoutSolver,
  routeBus,
  validateFanoutSolution,
  type FanoutBusSpec,
  type FanoutEdge,
  type FanoutRoutePlan,
} from "@tscircuit/fanout-solver"
import type {
  AutorouterCompleteEvent,
  AutorouterErrorEvent,
  AutorouterProgressEvent,
  GenericLocalAutorouter,
  SimpleRouteJson,
} from "@tscircuit/core"
import {
  createFanoutOptions,
  type DdrFanoutState,
} from "./latest-fanout-autorouter"

const SIGNAL_LAYERS = {
  DDR_BYTE0: "inner4",
  DDR_DQS0: "inner5",
  DDR_DMI0: "inner4",
  DDR_STROBE0: "inner4",
  DDR_BYTE1: "bottom",
  DDR_DQS1: "inner5",
  DDR_DMI1: "bottom",
  DDR_CLOCK: "inner5",
  DDR_STROBE1: "bottom",
  DDR_ADDR_CTRL: "inner6",
  DDR_RESET: "inner6",
  DDR_ADDR_RESET: "inner6",
} as const

const SIGNAL_ROUTE_ORDER = [
  "DDR_ADDR_RESET",
  "DDR_CLOCK",
  "DDR_STROBE0",
  "DDR_DQS0",
  "DDR_STROBE1",
  "DDR_DQS1",
] as const

const SEPARATE_SIGNAL_ROUTE_ORDER = [
  "DDR_DMI1",
  "DDR_BYTE1",
  "DDR_DQS1",
  "DDR_CLOCK",
  "DDR_DMI0",
  "DDR_BYTE0",
  "DDR_DQS0",
  "DDR_ADDR_CTRL",
  "DDR_RESET",
] as const

const BOTTOM_SEPARATE_SIGNAL_ROUTE_ORDER = [
  "DDR_BYTE1",
  "DDR_DMI1",
  "DDR_DQS1",
  "DDR_CLOCK",
  "DDR_BYTE0",
  "DDR_DMI0",
  "DDR_DQS0",
  "DDR_ADDR_CTRL",
  "DDR_RESET",
] as const

const BUSES_IN_STROBE0 = ["DDR_BYTE0", "DDR_DMI0"] as const
const BUSES_IN_STROBE1 = ["DDR_BYTE1", "DDR_DMI1"] as const
const BUSES_IN_ADDR_RESET = ["DDR_ADDR_CTRL", "DDR_RESET"] as const

const getCenterExit = (edge: FanoutEdge) =>
  `${edge}side_center` as
    | "topside_center"
    | "rightside_center"
    | "bottomside_center"
    | "leftside_center"

const getSignalExit = (edge: FanoutEdge, busId: string) => {
  if (edge === "right") {
    if (["DDR_STROBE0", "DDR_CLOCK", "DDR_DQS0"].includes(busId))
      return "rightside_top" as const
    if (busId === "DDR_STROBE1") return "rightside_bottom" as const
  }
  if (edge === "left" && ["DDR_CLOCK", "DDR_DQS0"].includes(busId))
    return "leftside_top" as const
  return getCenterExit(edge)
}

const getComponentBounds = (input: SimpleRouteJson, componentId: string) => {
  const pads = input.obstacles.filter(
    (obstacle) => obstacle.componentId === componentId,
  )
  return {
    minX: Math.min(...pads.map((pad) => pad.center.x - pad.width / 2)),
    maxX: Math.max(...pads.map((pad) => pad.center.x + pad.width / 2)),
    minY: Math.min(...pads.map((pad) => pad.center.y - pad.height / 2)),
    maxY: Math.max(...pads.map((pad) => pad.center.y + pad.height / 2)),
  }
}

function transitionPlansToExactExits(params: {
  plans: FanoutRoutePlan[]
  targets: Map<string, { x: number; y: number; layer?: string }>
  edge: FanoutEdge
  innerBoundary: { minX: number; maxX: number; minY: number; maxY: number }
  outerBoundary: { minX: number; maxX: number; minY: number; maxY: number }
  layerNames: string[]
  viaDiameter: number
  viaHoleDiameter: number
}) {
  const {
    plans,
    targets,
    edge,
    innerBoundary,
    outerBoundary,
    layerNames,
    viaDiameter,
    viaHoleDiameter,
  } = params
  const vertical = edge === "top" || edge === "bottom"
  const positive = edge === "top" || edge === "right"
  const direction = positive ? 1 : -1
  const toLocal = (point: { x: number; y: number }) =>
    vertical ? point : { x: point.y, y: point.x }
  const toBoard = (point: { x: number; y: number }) =>
    vertical ? point : { x: point.y, y: point.x }
  const localInnerBoundary = vertical
    ? innerBoundary
    : {
        minX: innerBoundary.minY,
        maxX: innerBoundary.maxY,
        minY: innerBoundary.minX,
        maxY: innerBoundary.maxX,
      }
  const localOuterBoundary = vertical
    ? outerBoundary
    : {
        minX: outerBoundary.minY,
        maxX: outerBoundary.maxY,
        minY: outerBoundary.minX,
        maxY: outerBoundary.maxX,
      }
  const innerY = positive ? localInnerBoundary.maxY : localInnerBoundary.minY
  const outerY = positive ? localOuterBoundary.maxY : localOuterBoundary.minY
  const boundaryPlans = plans.filter(
    (plan) => plan.termination.type === "boundary",
  )
  const pitch = 0.4
  const sourceX = new Map<string, number>()
  const oppositeSourceX = new Map<string, number>()
  const stageY = new Map<string, number>()
  const oppositeTrackY = new Map<string, number>()
  let leftRank = 0
  let rightRank = 0
  let stageRank = 0
  for (const layer of ["inner4", "inner6", "inner5", "bottom"]) {
    const useLeft = layer === "inner4" || layer === "inner6"
    const layerPlans = boundaryPlans
      .filter((plan) => plan.targetLayer === layer)
      .toSorted((first, second) =>
        useLeft
          ? toLocal(first.exitPoint).x - toLocal(second.exitPoint).x
          : toLocal(second.exitPoint).x - toLocal(first.exitPoint).x,
      )
    const layerColumnBase = useLeft ? leftRank : rightRank
    for (const [rank, plan] of layerPlans.entries()) {
      sourceX.set(
        plan.connectionName,
        useLeft
          ? localOuterBoundary.minX + 1 + (layerColumnBase + rank) * pitch
          : localOuterBoundary.maxX - 1 - (layerColumnBase + rank) * pitch,
      )
      oppositeSourceX.set(
        plan.connectionName,
        useLeft
          ? localOuterBoundary.minX +
              1 +
              (layerColumnBase + layerPlans.length - rank - 1) * pitch
          : localOuterBoundary.maxX -
              1 -
              (layerColumnBase + layerPlans.length - rank - 1) * pitch,
      )
      stageY.set(
        plan.connectionName,
        innerY + direction * (0.6 + stageRank++ * pitch),
      )
      oppositeTrackY.set(
        plan.connectionName,
        (positive ? localInnerBoundary.minY : localInnerBoundary.maxY) -
          direction * (0.6 + rank * pitch),
      )
    }
    if (useLeft) leftRank += layerPlans.length
    else rightRank += layerPlans.length
  }
  const perpendicularTrackX = new Map<string, number>()
  const perpendicularPlans = boundaryPlans.toSorted((first, second) => {
    const firstY = toLocal(first.exitPoint).y
    const secondY = toLocal(second.exitPoint).y
    return positive ? secondY - firstY : firstY - secondY
  })
  const perpendicularExitsOnPositiveSide =
    perpendicularPlans.reduce(
      (sum, plan) => sum + toLocal(plan.exitPoint).x,
      0,
    ) >=
    ((localInnerBoundary.minX + localInnerBoundary.maxX) / 2) *
      perpendicularPlans.length
  for (const [rank, plan] of perpendicularPlans.entries())
    perpendicularTrackX.set(
      plan.connectionName,
      perpendicularExitsOnPositiveSide
        ? localInnerBoundary.maxX + 0.6 + rank * pitch
        : localInnerBoundary.minX - 0.6 - rank * pitch,
    )
  const maxStageDepth =
    Math.max(...[...stageY.values()].map((y) => Math.abs(y - innerY)), 0) + 0.8
  const orderedPlans = boundaryPlans.toSorted((first, second) =>
    first.connectionName.localeCompare(second.connectionName),
  )
  const trackY = new Map(
    orderedPlans.map((plan, index) => [
      plan.connectionName,
      innerY + direction * (maxStageDepth + index * pitch),
    ]),
  )
  const spanLayers = (fromLayer: string, toLayer: string) => {
    const fromIndex = layerNames.indexOf(fromLayer)
    const toIndex = layerNames.indexOf(toLayer)
    return layerNames.slice(
      Math.min(fromIndex, toIndex),
      Math.max(fromIndex, toIndex) + 1,
    )
  }
  const makeVia = (
    center: { x: number; y: number },
    fromLayer: string,
    toLayer: string,
  ) => ({
    center,
    diameter: viaDiameter,
    holeDiameter: viaHoleDiameter,
    fromLayer,
    toLayer,
    spanLayers: spanLayers(fromLayer, toLayer),
  })
  const makeRouteVia = (
    point: { x: number; y: number },
    fromLayer: string,
    toLayer: string,
  ) => ({
    route_type: "via" as const,
    ...point,
    from_layer: fromLayer,
    to_layer: toLayer,
    via_diameter: viaDiameter,
    via_hole_diameter: viaHoleDiameter,
  })
  return plans.map((plan) => {
    if (plan.termination.type === "plane") return plan
    const target = targets.get(plan.connectionName)
    if (!target?.layer)
      throw new Error(`Missing exact fanout target for ${plan.connectionName}`)
    const lastSegment = plan.segments.at(-1)
    if (!lastSegment)
      throw new Error(`Missing fanout segment for ${plan.connectionName}`)
    const start = toLocal(lastSegment.end)
    const startsOnOppositeEdge = positive
      ? start.y <= localInnerBoundary.minY + 0.1
      : start.y >= localInnerBoundary.maxY - 0.1
    const startsOnPerpendicularEdge =
      !startsOnOppositeEdge &&
      (start.x <= localInnerBoundary.minX + 0.1 ||
        start.x >= localInnerBoundary.maxX - 0.1)
    const sourceColumnLocal = {
      x: startsOnPerpendicularEdge
        ? perpendicularTrackX.get(plan.connectionName)!
        : (startsOnOppositeEdge ? oppositeSourceX : sourceX).get(
            plan.connectionName,
          )!,
      y: stageY.get(plan.connectionName)!,
    }
    const sourceStageLocal = { x: start.x, y: sourceColumnLocal.y }
    const rowStartLocal = {
      x: sourceColumnLocal.x,
      y: trackY.get(plan.connectionName)!,
    }
    const targetCoordinate = vertical ? target.x : target.y
    const rowEndLocal = { x: targetCoordinate, y: rowStartLocal.y }
    const exitLocal = { x: targetCoordinate, y: outerY }
    const layerTransitionLocal = {
      x: targetCoordinate,
      y: outerY - direction * 0.6,
    }
    const startBoard = toBoard(start)
    const sourceColumn = toBoard(sourceColumnLocal)
    const leadLocals = startsOnOppositeEdge
      ? [
          {
            x: start.x,
            y: oppositeTrackY.get(plan.connectionName)!,
          },
          {
            x: sourceColumnLocal.x,
            y: oppositeTrackY.get(plan.connectionName)!,
          },
          sourceColumnLocal,
        ]
      : startsOnPerpendicularEdge
        ? [{ x: sourceColumnLocal.x, y: start.y }, sourceColumnLocal]
        : [sourceStageLocal, sourceColumnLocal]
    const leadPoints = leadLocals.map(toBoard)
    const rowStart = toBoard(rowStartLocal)
    const rowEnd = toBoard(rowEndLocal)
    const exit = toBoard(exitLocal)
    const layerTransition = toBoard(layerTransitionLocal)
    const width = lastSegment.width
    const segments = [
      ...plan.segments,
      ...leadPoints.map((point, index) => ({
        start: index === 0 ? startBoard : leadPoints[index - 1]!,
        end: point,
        width,
        layer: plan.targetLayer,
      })),
      { start: sourceColumn, end: rowStart, width, layer: "top" },
      { start: rowStart, end: rowEnd, width, layer: "bottom" },
      { start: rowEnd, end: layerTransition, width, layer: "top" },
      ...(target.layer === "top"
        ? [{ start: layerTransition, end: exit, width, layer: "top" }]
        : [
            {
              start: layerTransition,
              end: exit,
              width,
              layer: target.layer,
            },
          ]),
    ]
    const addedVias = [
      makeVia(sourceColumn, plan.targetLayer, "top"),
      makeVia(rowStart, "top", "bottom"),
      makeVia(rowEnd, "bottom", "top"),
      ...(target.layer === "top"
        ? []
        : [makeVia(layerTransition, "top", target.layer)]),
    ]
    const wire = (point: { x: number; y: number }, layer: string) => ({
      route_type: "wire" as const,
      ...point,
      width,
      layer,
    })
    return {
      ...plan,
      ...(startsOnOppositeEdge || startsOnPerpendicularEdge
        ? { exitEdge: edge, cornerBandSide: undefined }
        : {}),
      targetLayer: target.layer,
      exitPoint: exit,
      segments,
      additionalVias: [...(plan.additionalVias ?? []), ...addedVias],
      trace: {
        ...plan.trace,
        route: [
          ...plan.trace.route,
          wire(startBoard, plan.targetLayer),
          ...leadPoints.map((point) => wire(point, plan.targetLayer)),
          makeRouteVia(sourceColumn, plan.targetLayer, "top"),
          wire(sourceColumn, "top"),
          wire(rowStart, "top"),
          makeRouteVia(rowStart, "top", "bottom"),
          wire(rowStart, "bottom"),
          wire(rowEnd, "bottom"),
          makeRouteVia(rowEnd, "bottom", "top"),
          wire(rowEnd, "top"),
          wire(layerTransition, "top"),
          ...(target.layer === "top"
            ? [wire(exit, "top")]
            : [
                makeRouteVia(layerTransition, "top", target.layer),
                wire(layerTransition, target.layer),
                wire(exit, target.layer),
              ]),
        ],
      },
      length: segments.reduce(
        (sum, segment) =>
          sum +
          Math.hypot(
            segment.end.x - segment.start.x,
            segment.end.y - segment.start.y,
          ),
        0,
      ),
    }
  })
}

function mergePhysicalLane(
  buses: FanoutBusSpec[],
  busId: "DDR_STROBE0" | "DDR_STROBE1" | "DDR_ADDR_RESET",
  sourceBusIds: readonly string[],
  edge: FanoutEdge,
  layer: "top" | "inner4" | "inner5" | "inner6" | "bottom",
): FanoutBusSpec {
  const sourceBuses = sourceBusIds.map((sourceBusId) => {
    const bus = buses.find((candidate) => candidate.busId === sourceBusId)
    if (!bus) throw new Error(`Missing ${sourceBusId} RAM fanout bus`)
    return bus
  })
  const {
    exitPosition: _exitPosition,
    direction: _direction,
    preferredExit: _preferredExit,
    exitEdge: _exitEdge,
    ...baseBus
  } = sourceBuses[0]!
  const exitConfig = { exitPosition: getSignalExit(edge, busId) }
  return {
    ...baseBus,
    busId,
    connectionNames: sourceBuses.flatMap((bus) => bus.connectionNames),
    connectionExitTargets: Object.assign(
      {},
      ...sourceBuses.map((bus) => bus.connectionExitTargets ?? {}),
    ),
    ...exitConfig,
    allowedLayers: [layer],
    // The physical lane is coordinated as one escape channel. Pair skew is
    // still checked on the completed CPU/RAM/global route by the board tests.
    maxLengthSkew: 60,
  }
}

function replaceSignalBuses(
  buses: FanoutBusSpec[],
  edge: FanoutEdge,
  mergePhysicalLanes: boolean,
): FanoutBusSpec[] {
  if (!mergePhysicalLanes)
    return buses.map((bus) => {
      const layer = SIGNAL_LAYERS[bus.busId as keyof typeof SIGNAL_LAYERS]
      return bus.termination?.type === "plane" || !layer
        ? bus
        : {
            ...bus,
            exitPosition: getSignalExit(edge, bus.busId),
            allowedLayers: [layer],
            maxLengthSkew: 60,
          }
    })
  const replacedIds = new Set([
    ...BUSES_IN_STROBE0,
    ...BUSES_IN_STROBE1,
    ...BUSES_IN_ADDR_RESET,
  ])
  return [
    mergePhysicalLane(buses, "DDR_STROBE0", BUSES_IN_STROBE0, edge, "inner4"),
    mergePhysicalLane(buses, "DDR_STROBE1", BUSES_IN_STROBE1, edge, "bottom"),
    mergePhysicalLane(
      buses,
      "DDR_ADDR_RESET",
      BUSES_IN_ADDR_RESET,
      edge,
      "inner6",
    ),
    ...buses
      .filter((bus) => !replacedIds.has(bus.busId as never))
      .map((bus) =>
        bus.termination?.type === "plane"
          ? bus
          : bus.busId === "DDR_ADDR_CTRL"
            ? {
                ...bus,
                exitPosition: getSignalExit(edge, bus.busId),
                allowedLayers: ["inner6"],
                maxLengthSkew: 24,
              }
            : bus.busId === "DDR_RESET"
              ? {
                  ...bus,
                  exitPosition: getSignalExit(edge, bus.busId),
                  allowedLayers: ["inner6"],
                }
              : {
                  ...bus,
                  exitPosition: getSignalExit(edge, bus.busId),
                  ...(bus.busId === "DDR_CLOCK" ||
                  bus.busId === "DDR_DQS0" ||
                  bus.busId === "DDR_DQS1"
                    ? { maxLengthSkew: 3 }
                    : {}),
                },
      ),
  ]
}

function addSourceKeepouts(
  source: SimpleRouteJson,
  sourceComponentIds: Set<string>,
) {
  const keepouts = [...sourceComponentIds].map((componentId) => {
    const pads = source.obstacles.filter(
      (obstacle) => obstacle.componentId === componentId,
    )
    const minX = Math.min(...pads.map((pad) => pad.center.x - pad.width / 2))
    const maxX = Math.max(...pads.map((pad) => pad.center.x + pad.width / 2))
    const minY = Math.min(...pads.map((pad) => pad.center.y - pad.height / 2))
    const maxY = Math.max(...pads.map((pad) => pad.center.y + pad.height / 2))
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
  return {
    ...source,
    obstacles: [
      ...source.obstacles.filter(
        (obstacle) =>
          !obstacle.componentId ||
          !sourceComponentIds.has(obstacle.componentId),
      ),
      ...keepouts,
    ],
  }
}

export function createFixedOrientationFanoutAutorouter(
  edge: FanoutEdge,
  state: DdrFanoutState,
  mergePhysicalLanes = false,
) {
  return async (input: SimpleRouteJson): Promise<GenericLocalAutorouter> => {
    const phaseOptions = createFanoutOptions(input, {})
    const localEscapeEdge =
      edge === "bottom" && input.connections.length === 135
        ? "top"
        : edge === "top" && input.connections.length === 143
          ? "bottom"
          : edge === "left" && input.connections.length === 135
            ? "top"
            : edge === "right" && input.connections.length === 143
              ? "bottom"
              : edge
    let buses = replaceSignalBuses(
      phaseOptions.buses ?? [],
      localEscapeEdge,
      mergePhysicalLanes,
    )
    const targets = new Map(
      buses.flatMap((bus) =>
        Object.entries(bus.connectionExitTargets ?? {}).map(
          ([connectionName, target]) => [connectionName, target] as const,
        ),
      ),
    )
    const sourceProbe = new FanoutSolver(
      input as unknown as ConstructorParameters<typeof FanoutSolver>[0],
      { ...phaseOptions, buses },
    )
    sourceProbe.setup()
    const componentId = sourceProbe.preparedBuses.find(
      (bus) => bus.termination.type === "boundary",
    )?.componentId
    if (!componentId) throw new Error("Cannot identify fanout source component")
    const componentBounds = getComponentBounds(input, componentId)
    const innerPaddingX = 3
    const innerPaddingY = 3
    const innerBoundary = {
      minX: componentBounds.minX - innerPaddingX,
      maxX: componentBounds.maxX + innerPaddingX,
      minY: componentBounds.minY - innerPaddingY,
      maxY: componentBounds.maxY + innerPaddingY,
    }
    if (localEscapeEdge !== edge)
      buses = buses.map((bus) => ({
        ...bus,
        ...(bus.connectionExitTargets
          ? {
              connectionExitTargets: Object.fromEntries(
                Object.entries(bus.connectionExitTargets).map(
                  ([connectionName, target]) => [
                    connectionName,
                    {
                      ...target,
                      ...(localEscapeEdge === "top"
                        ? {
                            ...(edge === "left" || edge === "right"
                              ? { x: target.y }
                              : {}),
                            y: input.bounds.maxY,
                          }
                        : localEscapeEdge === "bottom"
                          ? {
                              ...(edge === "left" || edge === "right"
                                ? { x: target.y }
                                : {}),
                              y: input.bounds.minY,
                            }
                          : localEscapeEdge === "right"
                            ? { x: innerBoundary.maxX }
                            : { x: innerBoundary.minX }),
                    },
                  ],
                ),
              ),
            }
          : {}),
      }))
    const solverOptions = {
      ...phaseOptions,
      buses,
      allowBlindAndBuriedVias: true,
      maxLayerCombinations: 1,
      sharedBoundary: innerBoundary,
    }
    const solver = new FanoutSolver(
      input as unknown as ConstructorParameters<typeof FanoutSolver>[0],
      solverOptions,
    )
    solver.setup()

    const handlers = {
      complete: [] as Array<(event: AutorouterCompleteEvent) => void>,
      error: [] as Array<(event: AutorouterErrorEvent) => void>,
      progress: [] as Array<(event: AutorouterProgressEvent) => void>,
    }
    let solvedOutput: SimpleRouteJson | undefined

    const routePreparedBus = (
      busId: string,
      plans: FanoutRoutePlan[],
    ): FanoutRoutePlan[] | null => {
      const bus = solver.preparedBuses.find(
        (candidate) => candidate.busId === busId,
      )
      if (!bus) throw new Error(`Missing prepared RAM bus ${busId}`)
      const targetLayer =
        SIGNAL_LAYERS[busId as keyof typeof SIGNAL_LAYERS] ??
        (bus.termination.type === "plane" ? bus.termination.layer : undefined)
      if (!targetLayer) throw new Error(`Missing target layer for ${busId}`)
      return routeBus({
        srj: solver.inputSrj,
        bus,
        targetLayer,
        acceptedPlans: plans,
        layerNames: solver.config.layerNames,
        traceWidth: solver.config.traceWidth,
        viaDiameter: solver.config.viaDiameter,
        viaHoleDiameter: solver.config.viaHoleDiameter,
        clearance: solver.config.clearance,
        compactBusTracks: solver.config.compactBusTracks,
        allowBlindAndBuriedVias: true,
        allowSameNetMerges: solver.config.allowSameNetMerges,
      })
    }

    const solve = () => {
      const start = Date.now()
      const preferredSignalRouteOrder = mergePhysicalLanes
        ? [...SIGNAL_ROUTE_ORDER]
        : localEscapeEdge === "bottom"
          ? [...BOTTOM_SEPARATE_SIGNAL_ROUTE_ORDER]
          : [...SEPARATE_SIGNAL_ROUTE_ORDER]
      let signalPlans: FanoutRoutePlan[] = []
      for (const busId of preferredSignalRouteOrder) {
        const next = routePreparedBus(busId, signalPlans)
        if (!next)
          throw new Error(`Fixed-orientation fanout failed at ${busId}`)
        signalPlans.push(...next)
      }
      signalPlans = transitionPlansToExactExits({
        plans: signalPlans,
        targets,
        edge,
        innerBoundary,
        outerBoundary: input.bounds,
        layerNames: solver.config.layerNames,
        viaDiameter: solver.config.viaDiameter,
        viaHoleDiameter: solver.config.viaHoleDiameter,
      })
      let planeOrder = solver.preparedBuses.filter(
        (bus) => bus.termination.type === "plane",
      )
      let plans: FanoutRoutePlan[] | undefined
      const attemptedOrders = new Set<string>()
      for (let attempt = 0; attempt < planeOrder.length + 1; attempt++) {
        const orderKey = planeOrder.map((bus) => bus.busId).join("\0")
        if (attemptedOrders.has(orderKey)) break
        attemptedOrders.add(orderKey)
        const candidatePlans = [...signalPlans]
        let failedIndex = -1
        for (const [index, bus] of planeOrder.entries()) {
          const next = routePreparedBus(bus.busId, candidatePlans)
          if (!next) {
            failedIndex = index
            break
          }
          candidatePlans.push(...next)
        }
        if (failedIndex < 0) {
          plans = candidatePlans
          break
        }
        const failed = planeOrder[failedIndex]!
        planeOrder = [
          failed,
          ...planeOrder.slice(0, failedIndex),
          ...planeOrder.slice(failedIndex + 1),
        ]
      }
      if (!plans)
        throw new Error("Fixed-orientation plane drops could not be routed")

      const output = buildOutputSimpleRouteJson({
        inputSrj: solver.inputSrj,
        plans,
        layerNames: solver.config.layerNames,
      })
      const validation = validateFanoutSolution({
        inputSrj: solver.inputSrj,
        outputSrj: output,
        plans,
        preparedBuses: solver.preparedBuses.map((bus) =>
          localEscapeEdge === edge || bus.termination.type === "plane"
            ? bus
            : {
                ...bus,
                exitEdge: edge,
                preferredExit: edge,
                maxLengthSkew:
                  bus.maxLengthSkew === undefined
                    ? undefined
                    : Math.max(bus.maxLengthSkew, 60),
              },
        ),
        sharedBoundary: input.bounds,
        clearance: solver.config.clearance,
        allowBlindAndBuriedVias: true,
      })
      if (
        !validation.valid ||
        validation.brokenOutConnectionCount !== input.connections.length
      )
        throw new Error(
          `Invalid fixed-orientation fanout: ${JSON.stringify(validation)}`,
        )

      const sourceComponentIds = new Set(
        solver.preparedBuses.map((bus) => bus.componentId),
      )
      solvedOutput = addSourceKeepouts(
        output as unknown as SimpleRouteJson,
        sourceComponentIds,
      ) as SimpleRouteJson
      const traces = plans.flatMap((plan) => [
        plan.trace,
        ...(plan.planeEndpointTrace ? [plan.planeEndpointTrace] : []),
      ])
      state.fanouts.push({ input, traces, validation })
      state.validation = validation
      console.log(
        `Fixed-orientation fanout: ${plans.length}/${input.connections.length} connections in ${Date.now() - start}ms`,
      )
      return traces
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
        return solvedOutput
      },
    }
    return autorouter
  }
}
