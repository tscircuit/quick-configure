// Ported from dataset-fanout31-am62l's 02-top-center sample at
// 8c73befb36b125c84651c07454a9b940b3c6500a. This dataset defines a routing
// problem, not a completed PCB. Preserve its pin geometry and bus directions.
import type {
  AutorouterCompleteEvent,
  AutorouterErrorEvent,
  AutorouterProgressEvent,
  GenericLocalAutorouter,
  SimpleRouteJson,
  SimplifiedPcbTrace,
} from "@tscircuit/core"
import { Fragment } from "react"
import { AM62L_POWER_BALLS, DDR_SIGNAL_CONNECTIONS } from "./am62l-lpddr4"

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
  DDR_BYTE1: "bottomside_right",
  DDR_ADDR_CTRL: "bottomside_center",
  DDR_CLOCK: "bottomside_left",
  DDR_DQS0: "bottomside_left",
  DDR_DQS1: "bottomside_right",
  DDR_RESET: "bottomside_center",
  DDR_DMI0: "bottomside_left",
  DDR_DMI1: "bottomside_right",
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

const AM62L_PIN_NUMBER_BY_BALL = new Map(
  AM62L_PAD_POSITIONS.map(({ ballName, pinNumber }) => [ballName, pinNumber]),
)

function getAm62lPinNumber(ballName: string): number {
  const pinNumber = AM62L_PIN_NUMBER_BY_BALL.get(ballName)
  if (pinNumber === undefined) {
    throw new Error(`AM62L fixture does not contain ball ${ballName}`)
  }
  return pinNumber
}

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
    preferredLayers: ["inner5"],
    maxLengthSkew: 0.25,
    baseBand: -1,
  },
  {
    name: "DDR_DQS1",
    connections: traceNamesFor("DDR_DQS1"),
    preferredLayers: ["inner5"],
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
    preferredLayers: ["inner5"],
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

function createImmediateAutorouter(
  input: SimpleRouteJson,
): GenericLocalAutorouter {
  const eventHandlers = {
    complete: [] as Array<(event: AutorouterCompleteEvent) => void>,
    error: [] as Array<(event: AutorouterErrorEvent) => void>,
    progress: [] as Array<(event: AutorouterProgressEvent) => void>,
  }

  return {
    input,
    isRouting: false,
    start() {
      if (this.isRouting) return
      this.isRouting = true
      queueMicrotask(() => {
        this.isRouting = false
        for (const handler of eventHandlers.complete) {
          handler({ type: "complete", traces: [] })
        }
      })
    },
    stop() {
      this.isRouting = false
    },
    on(event, callback) {
      eventHandlers[event].push(callback as never)
    },
    solveSync(): SimplifiedPcbTrace[] {
      return []
    },
  }
}

const createBoardNoopAlgorithm = async (
  input: SimpleRouteJson,
): Promise<GenericLocalAutorouter> => createImmediateAutorouter(input)

// The shipped preview is explicitly unrouted. Pass routingDisabled: false
// to attempt the dataset's CPU fanout; its RAM routing is disabled upstream.
export default function Am62lLpddr4Top({ routingDisabled = true } = {}) {
  return (
    <board
      name="AM62L_LPDDR4_TOP"
      routingDisabled={routingDisabled}
      schematicDisabled
      width="52mm"
      height="52mm"
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
      <net name="GND" />
      <net name="VDD_LPDDR4" />
      <autoroutingphase
        autorouter={{ algorithmFn: createBoardNoopAlgorithm }}
      />
      <copperpour layer="inner1" connectsTo="net.GND" />
      <copperpour layer="inner2" connectsTo="net.VDD_LPDDR4" />

      <breakout
        name="SOC_FANOUT"
        padding="3mm"
        autorouter="fanout"
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
        pcbY={17}
        padding="3mm"
        routingDisabled
        fanoutRoutingLayers={[...FANOUT_ROUTING_LAYERS]}
        busFanoutDirections={dramBusExitPositions}
      >
        <Lpddr4 pcbX={0} pcbY={0} pcbRotation={90} />
      </breakout>

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
        pcbY={-11.5}
        fontSize={0.7}
        text={
          routingDisabled
            ? "AM62L · RAM above · Unrouted reference"
            : "AM62L · RAM above"
        }
      />
    </board>
  )
}
