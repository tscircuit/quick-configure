// Ported from dataset-fanout31-am62l's 02-top-center sample at
// 8c73befb36b125c84651c07454a9b940b3c6500a. This dataset defines a routing
// problem. The solved CPU configuration (placement, layers, and dense-plane
// hints) follows fanout-solver's repro04 at 70a2fe5, using version 0.0.52.
// Like its passing regression, length matching is disabled for this fanout.
// RAM and board-level routing remain explicit no-ops.
import type {
  GenericLocalAutorouter,
  AutorouterCompleteEvent,
  SimpleRouteJson,
} from "@tscircuit/core"
import {
  createDdrFanoutAutorouter,
  createDdrFanoutState,
  type DdrFanoutState,
} from "./latest-fanout-autorouter"
import { Fragment } from "react"
import {
  AM62L_POWER_BALLS,
  DDR_SIGNAL_CONNECTIONS,
  AM62L_DDR_DECOUPLING_CAPACITORS,
} from "./am62l-lpddr4"

const FANOUT_ROUTING_LAYERS = [
  "top",
  "inner4",
  "inner5",
  "inner6",
  "bottom",
] as const
const signalBusExitPositions = {
  DDR_BYTE0: "topside_left",
  DDR_BYTE1: "topside_right",
  DDR_ADDR_CTRL: "topside_center",
  DDR_CLOCK: "topside_left",
  DDR_DQS0: "topside_left",
  DDR_DQS1: "topside_right",
  DDR_RESET: "topside_center",
  DDR_DMI0: "topside_left",
  DDR_DMI1: "topside_right",
} as const
const dramBusExitPositions = {
  DDR_BYTE0: "bottomside_left",
  DDR_BYTE1: "bottomside_center",
  DDR_ADDR_CTRL: "bottomside_center",
  DDR_CLOCK: "bottomside_left",
  DDR_DQS0: "bottomside_left",
  DDR_DQS1: "bottomside_center",
  DDR_RESET: "bottomside_center",
  DDR_DMI0: "bottomside_left",
  DDR_DMI1: "bottomside_center",
} as const
const planeDrops = AM62L_POWER_BALLS.filter(
  (ball) => ball.pinSignal === "VSS" || ball.pinSignal === "VDDS_DDR",
).map((ball) => ({
  pinNumber: ball.pinNumber,
  netName: ball.railNetName,
  traceName: `U1_${ball.pinSignal}_${ball.ballName}_DROP`,
}))

// Copied from the AM62L32BOGHAANBR fixture used by
// tscircuit/core/tests/repros/repro-am62l-lpddr4-progressive-fanout.test.tsx.
// The package is a 0.5 mm, 23-by-23 FCCSP grid with depopulated positions.
const AM62L_ROW_NAMES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "R",
  "T",
  "U",
  "V",
  "W",
  "Y",
  "AA",
  "AB",
  "AC",
] as const

const AM62L_ROW_MASKS = [
  "11111111111111111111111",
  "11111111111111111111111",
  "11010101001110010101011",
  "11110111001010011101111",
  "11000101111111110100011",
  "11111100000000000111111",
  "11010011111111111001011",
  "11111111010101011111111",
  "11000001101010110000011",
  "11000001110101110000011",
  "11111111101010111111111",
  "11101011010101011010111",
  "11111111101010111111111",
  "11000001110101110000011",
  "11000001101010110000011",
  "11111111010101011111111",
  "11010011111111111001011",
  "11111100000000000111111",
  "11000101111111110100011",
  "11110111001010011101111",
  "11010101001110010101011",
  "11111111111111111111111",
  "11111111111111111111111",
] as const

const AM62L_PAD_POSITIONS = (() => {
  let pinNumber = 0
  return AM62L_ROW_MASKS.flatMap((rowMask, rowIndex) =>
    [...rowMask].flatMap((isPopulated, columnIndex) => {
      if (isPopulated !== "1") return []
      pinNumber += 1
      return [
        {
          ballName: `${AM62L_ROW_NAMES[rowIndex]}${columnIndex + 1}`,
          pinNumber,
          x: -5.5 + columnIndex * 0.5,
          y: 5.5 - rowIndex * 0.5,
        },
      ]
    }),
  )
})()

function Am62l() {
  return (
    <chip
      name="U1"
      manufacturerPartNumber="AM62L32BOGHAANBR"
      pcbX={0}
      pcbY={0}
      footprint={
        <footprint>
          {AM62L_PAD_POSITIONS.map(({ ballName, pinNumber, x, y }) => (
            <Fragment key={`am62l-pad-${pinNumber}`}>
              <smtpad
                portHints={[`pin${pinNumber}`, ballName]}
                pcbX={x}
                pcbY={y}
                radius="0.127mm"
                solderMaskMargin="0.0254mm"
                shape="circle"
              />
            </Fragment>
          ))}
          <silkscreenpath
            route={[
              { x: -5.95, y: 5.95 },
              { x: 5.95, y: 5.95 },
              { x: 5.95, y: -5.95 },
              { x: -5.95, y: -5.95 },
              { x: -5.95, y: 5.95 },
            ]}
          />
          <silkscreenpath
            route={[
              { x: -6.3, y: 5.5 },
              { x: -6.3201, y: 5.575 },
              { x: -6.375, y: 5.6299 },
              { x: -6.45, y: 5.65 },
              { x: -6.525, y: 5.6299 },
              { x: -6.5799, y: 5.575 },
              { x: -6.6, y: 5.5 },
              { x: -6.5799, y: 5.425 },
              { x: -6.525, y: 5.3701 },
              { x: -6.45, y: 5.35 },
              { x: -6.375, y: 5.3701 },
              { x: -6.3201, y: 5.425 },
              { x: -6.3, y: 5.5 },
            ]}
          />
          <silkscreentext
            text="{NAME}"
            pcbX="0mm"
            pcbY="6.8mm"
            anchorAlignment="center"
            fontSize="1mm"
          />
          <courtyardoutline
            outline={[
              { x: -6.2, y: 6.2 },
              { x: 6.2, y: 6.2 },
              { x: 6.2, y: -6.2 },
              { x: -6.2, y: -6.2 },
              { x: -6.2, y: 6.2 },
            ]}
          />
        </footprint>
      }
    />
  )
}

const LPDDR4_BALL_ROWS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "N",
  "P",
  "R",
  "T",
  "U",
  "V",
  "W",
  "Y",
  "AA",
  "AB",
] as const

const LPDDR4_BALL_COLUMNS = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12] as const

const LPDDR4_BALL_NAMES = LPDDR4_BALL_ROWS.flatMap((rowName) =>
  LPDDR4_BALL_COLUMNS.map((columnNumber) => `${rowName}${columnNumber}`),
)

const LPDDR4_BALL_X = [-4.4, -3.6, -2.8, -2, -1.2, 1.2, 2, 2.8, 3.6, 4.4]
const LPDDR4_BALL_Y = [
  6.825, 6.175, 5.525, 4.875, 4.225, 3.575, 2.925, 2.275, 1.625, 0.975, -0.975,
  -1.625, -2.275, -2.925, -3.575, -4.225, -4.875, -5.525, -6.175, -6.825,
]

const LPDDR4_BALL_POSITIONS = LPDDR4_BALL_Y.flatMap((y) =>
  LPDDR4_BALL_X.map((x) => ({ x, y })),
)

/** MT53E1G16D1ZW package geometry copied from the core AM62L repro. */
function Lpddr4({
  pcbX,
  pcbY,
  pcbRotation,
}: {
  pcbX: number
  pcbY: number
  pcbRotation: number
}) {
  return (
    <chip
      name="U2"
      pcbX={pcbX}
      pcbY={pcbY}
      pcbRotation={pcbRotation}
      manufacturerPartNumber="MT53E1G16D1ZW"
      noSchematicRepresentation
      footprint={
        <footprint>
          {LPDDR4_BALL_POSITIONS.map(({ x, y }, index) => (
            <Fragment key={`lpddr4-ball-${index + 1}`}>
              <smtpad
                portHints={[`pin${index + 1}`, LPDDR4_BALL_NAMES[index]!]}
                pcbX={x}
                pcbY={y}
                radius="0.16mm"
                shape="circle"
              />
            </Fragment>
          ))}
          <silkscreenpath
            route={[
              { x: -5, y: -7.25 },
              { x: 5, y: -7.25 },
              { x: 5, y: 7.25 },
              { x: -5, y: 7.25 },
              { x: -5, y: -7.25 },
            ]}
          />
          <silkscreencircle pcbX={-4.65} pcbY={6.9} radius="0.18mm" />
        </footprint>
      }
    />
  )
}

const traceNamesFor = (
  busName: (typeof DDR_SIGNAL_CONNECTIONS)[number]["busName"],
) =>
  DDR_SIGNAL_CONNECTIONS.filter(
    (connection) => connection.busName === busName,
  ).map((connection) => connection.traceName)

const AM62L_SIGNAL_BUSES = [
  {
    name: "DDR_BYTE0",
    connections: traceNamesFor("DDR_BYTE0"),
    preferredLayers: ["top", "inner4"],
    maxLengthSkew: 8,
    baseBand: -1,
  },
  {
    name: "DDR_BYTE1",
    connections: traceNamesFor("DDR_BYTE1"),
    preferredLayers: ["inner5", "bottom"],
    maxLengthSkew: 14.5,
    baseBand: 1,
  },
  {
    name: "DDR_ADDR_CTRL",
    connections: traceNamesFor("DDR_ADDR_CTRL"),
    preferredLayers: ["inner6"],
    maxLengthSkew: 15,
    baseBand: 0,
  },
  {
    name: "DDR_CLOCK",
    connections: traceNamesFor("DDR_CLOCK"),
    preferredLayers: ["inner5"],
    maxLengthSkew: 0.25,
    baseBand: -1,
  },
  {
    name: "DDR_DQS0",
    connections: traceNamesFor("DDR_DQS0"),
    preferredLayers: ["bottom"],
    maxLengthSkew: 0.25,
    baseBand: -1,
  },
  {
    name: "DDR_DQS1",
    connections: traceNamesFor("DDR_DQS1"),
    preferredLayers: ["bottom"],
    maxLengthSkew: 0.25,
    baseBand: 1,
  },
  {
    name: "DDR_RESET",
    connections: traceNamesFor("DDR_RESET"),
    preferredLayers: ["inner6"],
    baseBand: 0,
  },
  {
    name: "DDR_DMI0",
    connections: traceNamesFor("DDR_DMI0"),
    preferredLayers: ["bottom"],
    baseBand: -1,
  },
  {
    name: "DDR_DMI1",
    connections: traceNamesFor("DDR_DMI1"),
    preferredLayers: ["inner5"],
    baseBand: 1,
  },
] as const

const AM62L_DIFFERENTIAL_PAIRS = [
  {
    name: "DDR_CLOCK_PAIR",
    positiveConnection: "CK_t",
    negativeConnection: "CK_c",
    lengthTolerance: 0.25,
  },
  {
    name: "DDR_DQS0_PAIR",
    positiveConnection: "DQS0_t",
    negativeConnection: "DQS0_c",
    lengthTolerance: 0.25,
  },
  {
    name: "DDR_DQS1_PAIR",
    positiveConnection: "DQS1_t",
    negativeConnection: "DQS1_c",
    lengthTolerance: 0.25,
  },
] as const

// The source dataset routes only the CPU fanout. Keep its global and RAM
// phases unrouted until their independent fanout configuration is solved.
const referenceOnlyAutorouter = async (
  input: SimpleRouteJson,
): Promise<GenericLocalAutorouter> => {
  let complete: ((event: AutorouterCompleteEvent) => void) | undefined
  const router: GenericLocalAutorouter = {
    input,
    isRouting: false,
    start() {
      queueMicrotask(() => complete?.({ type: "complete", traces: [] }))
    },
    stop() {},
    on(event, callback) {
      if (event === "complete") complete = callback as typeof complete
    },
    solveSync() {
      return []
    },
  }
  return router
}

export default function Am62lLpddr4Top({
  routingState = createDdrFanoutState(),
}: {
  routingState?: DdrFanoutState
} = {}) {
  return (
    <board
      name="AM62L_LPDDR4_TOP"
      schematicDisabled
      width="32mm"
      height="54mm"
      layers={8}
      defaultTraceWidth="0.08128mm"
      minTraceWidth="0.08128mm"
      minTraceToPadEdgeClearance="0.05mm"
      minViaEdgeToPadEdgeClearance="0.08128mm"
      minViaHoleEdgeToViaHoleEdgeClearance="0.1016mm"
      minViaHoleDiameter="0.1mm"
      minViaPadDiameter="0.24mm"
      pcbStyle={{ viaHoleDiameter: "0.1mm", viaPadDiameter: "0.24mm" }}
      allowBlindAndBuriedVias={false}
      isViaInPadAllowed={false}
      autorouter="default"
    >
      <autoroutingphase
        name="FANOUT_METADATA"
        phaseIndex={999}
        connection="__fanout_metadata_only__"
        autorouter="fanout"
      />
      <autoroutingphase autorouter={{ algorithmFn: referenceOnlyAutorouter }} />
      <net name="GND" />
      <net name="VDD_LPDDR4" />
      <copperpour layer="inner1" connectsTo="net.GND" />
      <copperpour layer="inner2" connectsTo="net.VDD_LPDDR4" />

      <breakout
        name="SOC_FANOUT"
        pcbY={-11}
        padding="3mm"
        autorouter={{
          algorithmFn: createDdrFanoutAutorouter(
            signalBusExitPositions,
            {
              matchLengths: false,
              densePlaneReservationBusIds: [
                "A1",
                "A2",
                "A4",
                "A10",
                "A13",
                "A16",
                "A19",
                "A22",
                "E6",
                "F5",
                "F6",
                "G8",
                "H1",
                "H7",
                "K8",
                "L9",
                "R1",
                "T2",
                "V3",
              ]
                .map((ball) => `U1_VSS_${ball}_DROP`)
                .concat("U1_VDDS_DDR_M7_DROP"),
              denseUnrestrictedPlaneRoutingBusIds: [
                "U7",
                "R8",
                "P9",
                "N9",
                "N11",
              ].map((ball) => `U1_VSS_${ball}_DROP`),
            },
            routingState,
          ),
        }}
        fanoutPourNetMap={{ inner1: "GND", inner2: "VDD_LPDDR4" }}
        fanoutRoutingLayers={[...FANOUT_ROUTING_LAYERS]}
        busFanoutDirections={signalBusExitPositions}
      >
        <Am62l />
        {planeDrops.map((drop) => (
          <Fragment key={drop.traceName}>
            <trace
              name={drop.traceName}
              from={`.U1 > .pin${drop.pinNumber}`}
              to={`net.${drop.netName}`}
            />
          </Fragment>
        ))}
      </breakout>

      <breakout
        name="DRAM_FANOUT"
        pcbX={0}
        pcbY={11.5}
        padding="3mm"
        autorouter={{ algorithmFn: referenceOnlyAutorouter }}
        fanoutRoutingLayers={[...FANOUT_ROUTING_LAYERS]}
        busFanoutDirections={dramBusExitPositions}
      >
        <Lpddr4 pcbX={0} pcbY={0} pcbRotation={90} />
      </breakout>

      {AM62L_DDR_DECOUPLING_CAPACITORS.map((capacitor) => (
        <capacitor
          key={capacitor.name}
          name={capacitor.name}
          capacitance={capacitor.capacitance}
          footprint="cap0201_nosilkscreen"
          layer="bottom"
          pcbX={capacitor.pcbX}
          pcbY={-11 + capacitor.pcbY}
          pcbRotation={capacitor.pcbRotation}
        />
      ))}
      {AM62L_SIGNAL_BUSES.map((bus) => (
        <Fragment key={bus.name}>
          <bus
            name={bus.name}
            connections={[...bus.connections]}
            preferredLayers={[...bus.preferredLayers]}
            maxLengthSkew={
              "maxLengthSkew" in bus ? bus.maxLengthSkew : undefined
            }
          />
        </Fragment>
      ))}
      {AM62L_DIFFERENTIAL_PAIRS.map((pair) => (
        <Fragment key={pair.name}>
          <differentialpair
            name={pair.name}
            positiveConnection={pair.positiveConnection}
            negativeConnection={pair.negativeConnection}
            maxLengthSkew={pair.lengthTolerance}
          />
        </Fragment>
      ))}
      {DDR_SIGNAL_CONNECTIONS.map((connection) => (
        <Fragment key={connection.traceName}>
          <trace
            name={connection.traceName}
            from={`.U1 > .pin${connection.socPinNumber}`}
            to={`.U2 > .pin${connection.memoryPinNumber}`}
          />
        </Fragment>
      ))}
      <pcbnotetext
        pcbX={0}
        pcbY={-23}
        fontSize={0.7}
        text="AM62L · CPU fanout · RAM routing and length matching pending"
      />
    </board>
  )
}
