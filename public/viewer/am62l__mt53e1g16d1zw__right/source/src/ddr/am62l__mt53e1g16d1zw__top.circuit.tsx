import { topDdrWindingSolver } from "./top-ddr-winding-solver"
// Top reproduces the core progressive-fanout topology with package placement
// and bus directions rotated 90 degrees. Both fanouts are solved from this TSX;
// core coordinates the actual exits before the global DDR connections are joined.
import { Fragment } from "react"
import { createTopDdrGlobalAutorouter } from "./top-ddr-global-autorouter"
import {
  createDdrFanoutAutorouter,
  createDdrFanoutState,
  type DdrFanoutState,
} from "./latest-fanout-autorouter"
import {
  DDR_SIGNAL_CONNECTIONS,
  Am62l32,
  Mt53e1g16d1zw,
  AM62L_POWER_BALLS,
  LPDDR4_POWER_BALLS,
  LPDDR4_VDD1_ASSIGNMENTS,
  AM62L_DIRECT_RAIL_NET_NAMES,
  AM62L_DDR_DECOUPLING_CAPACITORS,
  AM62L_DDR_MAX_DECOUPLING_DISTANCE,
} from "./am62l-lpddr4"

const GROUND_PLANE_LAYER = "inner1"
const LPDDR4_POWER_PLANE_LAYER = "inner2"
const LPDDR4_VDD1_PLANE_LAYER = "inner3"
const LPDDR4_POWER_NET = "VDD_LPDDR4"
const LPDDR4_VDD1_NET = "SOC_DVDD1V8"
const SOC_PCB_Y = -9.5
const POWER_FANOUT_SIGNAL_LAYERS = [
  "top",
  "inner4",
  "inner5",
  "inner6",
  "bottom",
] as const

const createPlaneDrops = (
  componentName: "U1" | "U2",
  fanoutPhaseIndex: 0 | 1,
  netName: "GND" | typeof LPDDR4_POWER_NET | typeof LPDDR4_VDD1_NET,
  layer:
    | typeof GROUND_PLANE_LAYER
    | typeof LPDDR4_POWER_PLANE_LAYER
    | typeof LPDDR4_VDD1_PLANE_LAYER,
  ballAssignments: readonly {
    ballName: string
    pinNumber: number
    pinSignal: string
  }[],
) =>
  ballAssignments.map(({ ballName, pinNumber, pinSignal }) => ({
    ballName,
    componentName,
    fanoutPhaseIndex,
    fromLayer: "top" as const,
    layer,
    netName,
    pinNumber,
    pinSignal,
    traceName: `${componentName}_${pinSignal}_${ballName}_DROP`,
  }))

const SOC_PLANE_DROPS = [
  ...createPlaneDrops(
    "U1",
    0,
    "GND",
    GROUND_PLANE_LAYER,
    AM62L_POWER_BALLS.filter(({ pinSignal }) => pinSignal === "VSS"),
  ),
  ...createPlaneDrops(
    "U1",
    0,
    LPDDR4_POWER_NET,
    LPDDR4_POWER_PLANE_LAYER,
    AM62L_POWER_BALLS.filter(({ pinSignal }) => pinSignal === "VDDS_DDR"),
  ),
]
const DRAM_PLANE_DROPS = [
  ...createPlaneDrops(
    "U2",
    1,
    "GND",
    GROUND_PLANE_LAYER,
    LPDDR4_POWER_BALLS.filter(({ pinSignal }) => pinSignal === "VSS"),
  ),
  ...createPlaneDrops(
    "U2",
    1,
    LPDDR4_POWER_NET,
    LPDDR4_POWER_PLANE_LAYER,
    LPDDR4_POWER_BALLS.filter(
      ({ pinSignal }) => pinSignal === "VDDQ" || pinSignal === "VDD2",
    ),
  ),
  ...createPlaneDrops(
    "U2",
    1,
    LPDDR4_VDD1_NET,
    LPDDR4_VDD1_PLANE_LAYER,
    LPDDR4_VDD1_ASSIGNMENTS,
  ),
]
const traceNames = (
  busName: (typeof DDR_SIGNAL_CONNECTIONS)[number]["busName"],
) =>
  DDR_SIGNAL_CONNECTIONS.filter(
    (connection) => connection.busName === busName,
  ).map((connection) => connection.traceName)
const BYTE0_MAX_FANOUT_SKEW = 8
const BYTE1_MAX_FANOUT_SKEW = 14.5
const ADDR_CTRL_MAX_FANOUT_SKEW = 15
const CLOCK_MAX_FANOUT_SKEW = 0.25
const DQS0_MAX_FANOUT_SKEW = 0.25
const DQS1_MAX_FANOUT_SKEW = 0.25
const FANOUT_BUSES = [
  {
    name: "DDR_BYTE0",
    connections: traceNames("DDR_BYTE0"),
    preferredLayers: ["top", "inner4"],
    maxLengthSkew: BYTE0_MAX_FANOUT_SKEW,
  },
  {
    name: "DDR_BYTE1",
    connections: traceNames("DDR_BYTE1"),
    preferredLayers: ["inner5", "bottom"],
    maxLengthSkew: BYTE1_MAX_FANOUT_SKEW,
  },
  {
    name: "DDR_ADDR_CTRL",
    connections: traceNames("DDR_ADDR_CTRL"),
    preferredLayers: ["inner6"],
    maxLengthSkew: ADDR_CTRL_MAX_FANOUT_SKEW,
  },
  {
    name: "DDR_CLOCK",
    connections: traceNames("DDR_CLOCK"),
    preferredLayers: ["inner5"],
    maxLengthSkew: CLOCK_MAX_FANOUT_SKEW,
  },
  {
    name: "DDR_DQS0",
    connections: traceNames("DDR_DQS0"),
    preferredLayers: ["inner5"],
    maxLengthSkew: DQS0_MAX_FANOUT_SKEW,
  },
  {
    name: "DDR_DQS1",
    connections: traceNames("DDR_DQS1"),
    preferredLayers: ["inner5"],
    maxLengthSkew: DQS1_MAX_FANOUT_SKEW,
  },
  {
    name: "DDR_RESET",
    connections: traceNames("DDR_RESET"),
    preferredLayers: ["inner6"],
    maxLengthSkew: undefined,
  },
  {
    name: "DDR_DMI0",
    connections: traceNames("DDR_DMI0"),
    preferredLayers: ["inner5"],
    maxLengthSkew: undefined,
  },
  {
    name: "DDR_DMI1",
    connections: traceNames("DDR_DMI1"),
    preferredLayers: ["inner5"],
    maxLengthSkew: undefined,
  },
] as const

// Board-space exits: CPU goes up, RAM goes down.
const socBusFanoutDirections = {
  DDR_BYTE0: "topside_left",
  DDR_BYTE1: "topside_right",
  DDR_ADDR_CTRL: "topside_center",
  DDR_CLOCK: "topside_left",
  DDR_DQS0: "topside_left",
  DDR_DQS1: "topside_center",
  DDR_RESET: "topside_center",
  DDR_DMI0: "topside_left",
  DDR_DMI1: "topside_right",
} as const
const dramBusFanoutDirections = {
  DDR_BYTE0: "bottomside_center",
  DDR_BYTE1: "bottomside_center",
  DDR_ADDR_CTRL: "bottomside_center",
  DDR_CLOCK: "bottomside_left",
  DDR_DQS0: "bottomside_left",
  DDR_DQS1: "bottomside_center",
  DDR_RESET: "bottomside_left",
  DDR_DMI0: "bottomside_left",
  DDR_DMI1: "bottomside_center",
} as const

export default function Am62lLpddr4Top({
  routingState = createDdrFanoutState(),
}: {
  routingState?: DdrFanoutState
} = {}) {
  return (
    <board
      name="AM62L_LPDDR4_TOP"
      width="32mm"
      height="54mm"
      layers={8}
      defaultTraceWidth="0.08128mm"
      minTraceWidth="0.08128mm"
      minTraceToPadEdgeClearance="0.05mm"
      minViaEdgeToPadEdgeClearance="0.08128mm"
      minViaHoleEdgeToViaHoleEdgeClearance="0.1016mm"
      minViaHoleDiameter="0.15mm"
      minViaPadDiameter="0.24mm"
      pcbStyle={{ viaHoleDiameter: "0.15mm", viaPadDiameter: "0.24mm" }}
      allowBlindAndBuriedVias={false}
      isViaInPadAllowed={false}
      autorouter="default"
      schematicDisabled
    >
      {AM62L_DIRECT_RAIL_NET_NAMES.map((name) => (
        <Fragment key={name}>
          <net name={name} />
        </Fragment>
      ))}
      <autoroutingphase
        autorouter={{ algorithmFn: createTopDdrGlobalAutorouter(routingState) }}
      />
      <copperpour layer={GROUND_PLANE_LAYER} connectsTo="net.GND" />
      <copperpour
        layer={LPDDR4_POWER_PLANE_LAYER}
        connectsTo={`net.${LPDDR4_POWER_NET}`}
      />
      <copperpour
        layer={LPDDR4_VDD1_PLANE_LAYER}
        connectsTo={`net.${LPDDR4_VDD1_NET}`}
      />
      <breakout
        name="SOC_FANOUT"
        pcbX={0}
        pcbY={SOC_PCB_Y}
        padding="3mm"
        pcbGap="0.2mm"
        autorouter={{
          preset: "fanout",
          implicitBreakoutPointSolverFn: topDdrWindingSolver,
          algorithmFn: createDdrFanoutAutorouter(
            socBusFanoutDirections,
            {
              useHorizontalReferenceFrame: true,
              referenceFramePrecision: 12,
              maxLayerCombinations: 1,
            },
            routingState,
          ),
        }}
        fanoutRoutingLayers={[...POWER_FANOUT_SIGNAL_LAYERS]}
        busFanoutDirections={socBusFanoutDirections}
      >
        <Am62l32 name="U1" pcbRotation={90} noSchematicRepresentation />
        {SOC_PLANE_DROPS.map((drop) => (
          <trace
            key={drop.traceName}
            name={drop.traceName}
            from={`.U1 > .${drop.ballName}`}
            to={`net.${drop.netName}`}
          />
        ))}
      </breakout>
      <breakout
        name="DRAM_FANOUT"
        pcbX={-1.81916}
        pcbY={9.616917}
        padding="3mm"
        pcbGap="0.2mm"
        autorouter={{
          preset: "fanout",
          implicitBreakoutPointSolverFn: topDdrWindingSolver,
          algorithmFn: createDdrFanoutAutorouter(
            dramBusFanoutDirections,
            { useHorizontalReferenceFrame: true, maxLayerCombinations: 1 },
            routingState,
          ),
        }}
        fanoutRoutingLayers={[...POWER_FANOUT_SIGNAL_LAYERS]}
        busFanoutDirections={dramBusFanoutDirections}
      >
        <Mt53e1g16d1zw name="U2" pcbRotation={180} noSchematicRepresentation />
        {DRAM_PLANE_DROPS.map((drop) => (
          <trace
            key={drop.traceName}
            name={drop.traceName}
            from={`.U2 > .${drop.ballName}`}
            to={`net.${drop.netName}`}
          />
        ))}
      </breakout>
      {AM62L_DDR_DECOUPLING_CAPACITORS.map((capacitor) => (
        <Fragment key={capacitor.name}>
          <capacitor
            name={capacitor.name}
            capacitance={capacitor.capacitance}
            footprint="cap0201_nosilkscreen"
            layer="bottom"
            maxDecouplingTraceLength={`${AM62L_DDR_MAX_DECOUPLING_DISTANCE}mm`}
            pcbX={-capacitor.pcbY}
            pcbY={SOC_PCB_Y + capacitor.pcbX}
            pcbRotation={90 + capacitor.pcbRotation}
          />
          <trace
            name={`${capacitor.name}_VDD_DROP`}
            from={`.${capacitor.name} > .pin1`}
            to={`net.${LPDDR4_POWER_NET}`}
          />
          <trace
            name={`${capacitor.name}_GND_DROP`}
            from={`.${capacitor.name} > .pin2`}
            to="net.GND"
          />
        </Fragment>
      ))}
      {FANOUT_BUSES.map(
        ({ name, connections, preferredLayers, maxLengthSkew }) => (
          <Fragment key={name}>
            <bus
              name={name}
              connections={connections}
              preferredLayers={[...preferredLayers]}
              maxLengthSkew={maxLengthSkew}
            />
          </Fragment>
        ),
      )}
      <differentialpair
        name="DDR_CLOCK_PAIR"
        positiveConnection="CK_t"
        negativeConnection="CK_c"
        maxLengthSkew={CLOCK_MAX_FANOUT_SKEW}
      />
      <differentialpair
        name="DDR_DQS0_PAIR"
        positiveConnection="DQS0_t"
        negativeConnection="DQS0_c"
        maxLengthSkew={DQS0_MAX_FANOUT_SKEW}
      />
      <differentialpair
        name="DDR_DQS1_PAIR"
        positiveConnection="DQS1_t"
        negativeConnection="DQS1_c"
        maxLengthSkew={DQS1_MAX_FANOUT_SKEW}
      />
      {DDR_SIGNAL_CONNECTIONS.map(({ traceName, socSignal, memorySignal }) => (
        <trace
          key={traceName}
          name={traceName}
          from={`U1.${socSignal}`}
          to={`U2.${memorySignal}`}
        />
      ))}
      <pcbnotetext
        pcbX={0}
        pcbY={-24}
        fontSize={0.7}
        text="AM62L · LPDDR4 · Top · Coordinated fanouts"
      />
    </board>
  )
}
