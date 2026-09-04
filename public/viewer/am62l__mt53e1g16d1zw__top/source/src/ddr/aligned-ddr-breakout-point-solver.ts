import type {
  ImplicitBreakoutPointSolverFn,
  ImplicitBreakoutPointSolverInput,
} from "@tscircuit/props"

const SIGNAL_LAYER_BY_BUS_ID: Record<string, string> = {
  DDR_BYTE0: "inner4",
  DDR_DMI0: "inner4",
  DDR_BYTE1: "bottom",
  DDR_DMI1: "bottom",
  DDR_ADDR_CTRL: "inner6",
  DDR_RESET: "inner6",
  DDR_CLOCK: "inner5",
  DDR_DQS0: "inner5",
  DDR_DQS1: "inner5",
}

const LAYER_ORDER = ["inner4", "bottom", "inner6", "inner5"] as const

const flattenConnectionIds = (
  input: ImplicitBreakoutPointSolverInput,
): string[] =>
  input.connections.flatMap((connection) =>
    "type" in connection
      ? connection.connections.map((member) => member.connectionId)
      : [connection.connectionId],
  )

/**
 * Places each paired DDR connection at the same board-space coordinate and
 * layer on both facing breakout edges. The package footprints remain in their
 * authored orientation; each local fanout solver routes from its actual balls
 * to these coordinated exits.
 */
export const alignedDdrBreakoutPointSolver: ImplicitBreakoutPointSolverFn = (
  input,
) => {
  const connectionIds = flattenConnectionIds(input)
  const layerByConnectionId = new Map<string, string>()
  for (const bus of input.buses) {
    const layer = SIGNAL_LAYER_BY_BUS_ID[bus.busId]
    if (!layer) continue
    for (const connectionId of bus.connectionIds)
      layerByConnectionId.set(connectionId, layer)
  }
  for (const connectionId of connectionIds)
    if (!layerByConnectionId.has(connectionId))
      throw new Error(`Missing DDR fanout layer for ${connectionId}`)

  const vertical = input.regions.every(
    (region) => region.edge === "top" || region.edge === "bottom",
  )
  const horizontal = input.regions.every(
    (region) => region.edge === "left" || region.edge === "right",
  )
  if (!vertical && !horizontal)
    throw new Error("DDR breakout regions must have parallel facing edges")

  const commonMin = Math.max(
    ...input.regions.map((region) =>
      vertical ? region.bounds.minX : region.bounds.minY,
    ),
  )
  const commonMax = Math.min(
    ...input.regions.map((region) =>
      vertical ? region.bounds.maxX : region.bounds.maxY,
    ),
  )
  if (!(commonMin < commonMax))
    throw new Error("DDR breakout edges do not share a routing span")

  const requestedSpacing = Math.max(input.boundaryPointSpacing, 0.325)
  const orderedConnectionIds = LAYER_ORDER.flatMap((layer) =>
    connectionIds
      .filter((connectionId) => layerByConnectionId.get(connectionId) === layer)
      .toSorted(),
  )
  const availableSpan = commonMax - commonMin
  const spacing = Math.min(
    requestedSpacing,
    orderedConnectionIds.length > 1
      ? availableSpan / (orderedConnectionIds.length - 1)
      : requestedSpacing,
  )
  const start =
    (commonMin + commonMax) / 2 -
    ((orderedConnectionIds.length - 1) * spacing) / 2
  const coordinateByConnectionId = new Map(
    orderedConnectionIds.map((connectionId, index) => [
      connectionId,
      start + index * spacing,
    ]),
  )

  const breakoutPoints = input.regions.flatMap((region) =>
    connectionIds.map((connectionId) => {
      const coordinate = coordinateByConnectionId.get(connectionId)!
      const fixedCoordinate =
        region.edge === "top"
          ? region.bounds.maxY
          : region.edge === "bottom"
            ? region.bounds.minY
            : region.edge === "right"
              ? region.bounds.maxX
              : region.bounds.minX
      return {
        regionId: region.regionId,
        connectionId,
        layer: layerByConnectionId.get(connectionId)!,
        x: vertical ? coordinate : fixedCoordinate,
        y: vertical ? fixedCoordinate : coordinate,
      }
    }),
  )
  return {
    breakoutPoints,
  }
}
