// Adapted from tscircuit/core tests/fixtures/create-am62l-lpddr4-fanout.tsx
// at 25595a9988b542334f1b9a7d1a2c083b8796f633 (progressive-fanout reference).
import type { ChipProps } from "@tscircuit/props"
import { Fragment } from "react"

type DdrBusName =
  | "DDR_BYTE0"
  | "DDR_BYTE1"
  | "DDR_ADDR_CTRL"
  | "DDR_CLOCK"
  | "DDR_DQS0"
  | "DDR_DQS1"
  | "DDR_RESET"
  | "DDR_DMI0"
  | "DDR_DMI1"

interface DdrConnection {
  busName: DdrBusName
  memoryBall: string
  memoryPinNumber: number
  memorySignal: string
  socBall: string
  socPinNumber: number
  socSignal: string
  traceName: string
}

const DDR_PIN_ASSIGNMENTS = [
  [0, 94, "F4", 12, "B2"],
  [1, 93, "F3", 22, "C2"],
  [2, 91, "F1", 42, "E2"],
  [3, 76, "E1", 52, "F2"],
  [4, 105, "G4", 54, "F4"],
  [5, 123, "H4", 44, "E4"],
  [6, 121, "H2", 24, "C4"],
  [7, 122, "H3", 14, "B4"],
  [8, 275, "V4", 19, "B11"],
  [9, 238, "T3", 29, "C11"],
  [10, 236, "T1", 49, "E11"],
  [11, 255, "U1", 59, "F11"],
  [12, 257, "U4", 57, "F9"],
  [13, 276, "V5", 47, "E9"],
  [14, 256, "U2", 27, "C9"],
  [15, 284, "W1", 17, "B9"],
] as const

const DDR_CONNECTIONS: readonly DdrConnection[] = DDR_PIN_ASSIGNMENTS.map(
  ([bit, socPinNumber, socBall, memoryPinNumber, memoryBall]) => ({
    busName: bit < 8 ? "DDR_BYTE0" : "DDR_BYTE1",
    memoryBall,
    memoryPinNumber,
    memorySignal: `DQ${bit}`,
    socBall,
    socPinNumber,
    socSignal: `DDR0_DQ${bit}`,
    traceName: `DQ${bit}`,
  }),
)

const DDR_ADDR_CTRL_PIN_ASSIGNMENTS = [
  ["CA0", "DDR0_A0", 164, "L5", 72, "H2"],
  ["CA1", "DDR0_A1", 125, "H6", 82, "J2"],
  ["CA2", "DDR0_A2", 165, "L6", 77, "H9"],
  ["CA3", "DDR0_A3", 150, "K2", 78, "H10"],
  ["CA4", "DDR0_A4", 139, "J1", 79, "H11"],
  ["CA5", "DDR0_A5", 124, "H5", 89, "J11"],
  ["CS", "DDR0_CS0_n", 162, "L3", 74, "H4"],
  ["CKE", "DDR0_CKE0", 149, "K1", 84, "J4"],
] as const

const DDR_ADDR_CTRL_CONNECTIONS: readonly DdrConnection[] =
  DDR_ADDR_CTRL_PIN_ASSIGNMENTS.map(
    ([
      memorySignal,
      socSignal,
      socPinNumber,
      socBall,
      memoryPinNumber,
      memoryBall,
    ]) => ({
      busName: "DDR_ADDR_CTRL",
      memoryBall,
      memoryPinNumber,
      memorySignal,
      socBall,
      socPinNumber,
      socSignal,
      traceName: memorySignal,
    }),
  )

const DDR_CLOCK_PIN_ASSIGNMENTS = [
  ["CK_t", "DDR0_CK0", 215, "P1", 86, "J8"],
  ["CK_c", "DDR0_CK0_n", 216, "P2", 87, "J9"],
] as const

const DDR_CLOCK_CONNECTIONS: readonly DdrConnection[] =
  DDR_CLOCK_PIN_ASSIGNMENTS.map(
    ([
      memorySignal,
      socSignal,
      socPinNumber,
      socBall,
      memoryPinNumber,
      memoryBall,
    ]) => ({
      busName: "DDR_CLOCK",
      memoryBall,
      memoryPinNumber,
      memorySignal,
      socBall,
      socPinNumber,
      socSignal,
      traceName: memorySignal,
    }),
  )

const DDR_DQS0_PIN_ASSIGNMENTS = [
  ["DQS0_t", "DDR0_DQS0", 103, "G1", 33, "D3"],
  ["DQS0_c", "DDR0_DQS0_n", 104, "G2", 43, "E3"],
] as const

const DDR_DQS0_CONNECTIONS: readonly DdrConnection[] =
  DDR_DQS0_PIN_ASSIGNMENTS.map(
    ([
      memorySignal,
      socSignal,
      socPinNumber,
      socBall,
      memoryPinNumber,
      memoryBall,
    ]) => ({
      busName: "DDR_DQS0",
      memoryBall,
      memoryPinNumber,
      memorySignal,
      socBall,
      socPinNumber,
      socSignal,
      traceName: memorySignal,
    }),
  )

const DDR_DQS1_PIN_ASSIGNMENTS = [
  ["DQS1_t", "DDR0_DQS1", 272, "V1", 38, "D10"],
  ["DQS1_c", "DDR0_DQS1_n", 273, "V2", 48, "E10"],
] as const

const DDR_DQS1_CONNECTIONS: readonly DdrConnection[] =
  DDR_DQS1_PIN_ASSIGNMENTS.map(
    ([
      memorySignal,
      socSignal,
      socPinNumber,
      socBall,
      memoryPinNumber,
      memoryBall,
    ]) => ({
      busName: "DDR_DQS1",
      memoryBall,
      memoryPinNumber,
      memorySignal,
      socBall,
      socPinNumber,
      socSignal,
      traceName: memorySignal,
    }),
  )

const DDR_RESET_CONNECTION = {
  busName: "DDR_RESET",
  memoryBall: "T11",
  memoryPinNumber: 139,
  memorySignal: "RESET_n",
  socBall: "J2",
  socPinNumber: 140,
  socSignal: "DDR0_RESET0_n",
  traceName: "RESET_n",
} as const satisfies DdrConnection

const DDR_DMI0_CONNECTION = {
  busName: "DDR_DMI0",
  memoryBall: "C3",
  memoryPinNumber: 23,
  memorySignal: "DMI0",
  socBall: "F2",
  socPinNumber: 92,
  socSignal: "DDR0_DM0",
  traceName: "DMI0",
} as const satisfies DdrConnection

const DDR_DMI1_CONNECTION = {
  busName: "DDR_DMI1",
  memoryBall: "C10",
  memoryPinNumber: 28,
  memorySignal: "DMI1",
  socBall: "W2",
  socPinNumber: 285,
  socSignal: "DDR0_DM1",
  traceName: "DMI1",
} as const satisfies DdrConnection

export const DDR_SIGNAL_CONNECTIONS = [
  ...DDR_CONNECTIONS,
  ...DDR_ADDR_CTRL_CONNECTIONS,
  ...DDR_CLOCK_CONNECTIONS,
  ...DDR_DQS0_CONNECTIONS,
  ...DDR_DQS1_CONNECTIONS,
  DDR_RESET_CONNECTION,
  DDR_DMI0_CONNECTION,
  DDR_DMI1_CONNECTION,
] as const

// The real 373-ball FCCSP footprint is a 0.5 mm grid with depopulated rows.
// Keeping the row masks here makes the regression fixture independent of the
// generated registry package while preserving the package escape geometry.
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

const AM62L_VDD_CORE_BALLS = [
  "J9",
  "J11",
  "J13",
  "J15",
  "K10",
  "K14",
  "L15",
  "M14",
  "N15",
  "P10",
  "P12",
  "P14",
  "R9",
  "R11",
  "M10",
] as const
const AM62L_VDDS_DDR_BALLS = ["L8", "M7", "M8", "N8", "P8"] as const
const AM62L_VDDA_1V8_BALLS = ["G14", "T12", "R16", "N17", "L11", "K12"] as const
const AM62L_SOC_DVDD3V3_BALLS = ["U12", "L17", "J16", "H10", "G10"] as const
const AM62L_SOC_DVDD1V8_BALLS = ["H8", "H16", "M17", "P16", "T14"] as const
const AM62L_VDDA_CORE_BALLS = ["U11", "H12", "G13"] as const
const AM62L_VPP_BALLS = ["N18"] as const
const AM62L_VDD_MMC1_SD_BALLS = ["U16"] as const
const AM62L_VDDSHV_SD_IO_BALLS = ["T10"] as const
const AM62L_SOC_VDD_RTC_BALLS = ["T17"] as const
const AM62L_SOC_VDDS_RTC_1V8_BALLS = ["T18"] as const

const AM62L_SPECIAL_CAP_BALLS = [
  {
    ballName: "J8",
    pinSignal: "CAP_VDDS_MMC0",
    capacitance: "1uF",
    evmReference: "C339",
  },
  {
    ballName: "U9",
    pinSignal: "CAP_VDDS_MMC1",
    capacitance: "1uF",
    evmReference: "C294",
  },
  {
    ballName: "M16",
    pinSignal: "CAP_VDDS_MMC2",
    capacitance: "1uF",
    evmReference: "C310",
  },
  {
    ballName: "K16",
    pinSignal: "CAP_VDDS_GPMC",
    capacitance: "1uF",
    evmReference: "C323",
  },
  {
    ballName: "G11",
    pinSignal: "CAP_VDDS_GENERAL1",
    capacitance: "1uF",
    evmReference: "C338",
  },
  {
    ballName: "T16",
    pinSignal: "CAP_VDDSHV_MMC",
    capacitance: "3.3uF",
    evmReference: "C286",
  },
] as const

const AM62L_DDR_HIGH_SPEED_CAPACITANCE = "1uF"
export const AM62L_DDR_MAX_DECOUPLING_DISTANCE = 3.81

// SPRAD06C requires five high-speed VDDS_DDR capacitors totaling at least
// 1.4 uF, with at least three under the processor and every capacitor within
// 150 mil (3.81 mm) of a power/ground ball. The TMDS62LEVM reference design
// uses five high-priority 1 uF parts plus three medium-priority 0.1 uF parts
// under the BGA. Its separate 22 uF bulk capacitor is at the PMIC output and
// is intentionally outside this processor-fanout fixture.
export const AM62L_DDR_DECOUPLING_CAPACITORS = [
  {
    capacitance: AM62L_DDR_HIGH_SPEED_CAPACITANCE,
    name: "C_SOC_DDR_HS_L8",
    priority: "high",
    targetBall: "L8",
    pcbX: -0.625,
    pcbY: 0.625,
    pcbRotation: 180,
    vddViaOffset: { x: -0.829, y: 0.311 },
    groundViaOffset: { x: -0.33, y: 0.45 },
  },
  {
    capacitance: AM62L_DDR_HIGH_SPEED_CAPACITANCE,
    name: "C_SOC_DDR_HS_M7",
    priority: "high",
    targetBall: "M7",
    pcbX: -3.125,
    pcbY: -1.75,
    pcbRotation: 180,
    vddViaOffset: { x: 0.239, y: -0.338 },
    groundViaOffset: { x: -0.421, y: -0.338 },
  },
  {
    capacitance: AM62L_DDR_HIGH_SPEED_CAPACITANCE,
    name: "C_SOC_DDR_HS_M8",
    priority: "high",
    targetBall: "M8",
    pcbX: -1,
    pcbY: -0.125,
    pcbRotation: 180,
    vddViaOffset: { x: 0.78, y: 0 },
    groundViaOffset: { x: -0.78, y: 0 },
  },
  {
    capacitance: AM62L_DDR_HIGH_SPEED_CAPACITANCE,
    name: "C_SOC_DDR_HS_N8",
    priority: "high",
    targetBall: "N8",
    pcbX: -0.75,
    pcbY: -1.175,
    pcbRotation: 180,
    vddViaOffset: { x: 0.239, y: 0.338 },
    groundViaOffset: { x: -0.421, y: -0.338 },
  },
  {
    capacitance: AM62L_DDR_HIGH_SPEED_CAPACITANCE,
    name: "C_SOC_DDR_HS_P8",
    priority: "high",
    targetBall: "P8",
    pcbX: -1.75,
    pcbY: -2.25,
    pcbRotation: 90,
    vddViaOffset: { x: 0.446, y: -0.435 },
    groundViaOffset: { x: -0.98, y: 0 },
  },
  {
    capacitance: "0.1uF",
    name: "C_SOC_DDR_MED1",
    priority: "medium",
    targetBall: "P8",
    pcbX: -0.625,
    pcbY: -2,
    pcbRotation: 180,
    vddViaOffset: { x: 0.765, y: 0.116 },
    groundViaOffset: { x: -0.555, y: -0.39 },
  },
  {
    capacitance: "0.1uF",
    name: "C_SOC_DDR_MED2",
    priority: "medium",
    targetBall: "P8",
    pcbX: -0.75,
    pcbY: -3.125,
    pcbRotation: 90,
    vddViaOffset: { x: 0.33, y: -0.45 },
    groundViaOffset: { x: -0.105, y: 0.39 },
  },
  {
    capacitance: "0.1uF",
    name: "C_SOC_DDR_MED3",
    priority: "medium",
    targetBall: "P8",
    pcbX: 0.75,
    pcbY: -1.25,
    pcbRotation: 180,
    vddViaOffset: { x: 0.239, y: -0.338 },
    groundViaOffset: { x: -0.239, y: 0.338 },
  },
] as const

type Am62lDecouplingPlacement = "under" | "perimeter"

interface UnplacedAm62lDecouplingCapacitor {
  capacitance: string
  evmReference: string
  footprint: "cap0201_nosilkscreen" | "cap0402_nosilkscreen"
  name: string
  placement: Am62lDecouplingPlacement
  priority: "high" | "medium" | "low" | "bulk" | "required"
  railNetName: string
  targetBall: string
}

const createEvmRailCapacitors = ({
  ballNames,
  capacitors,
  railName,
}: {
  ballNames: readonly string[]
  capacitors: readonly {
    capacitance: string
    evmReference: string
    placement: Am62lDecouplingPlacement
    priority: UnplacedAm62lDecouplingCapacitor["priority"]
  }[]
  railName: string
}): UnplacedAm62lDecouplingCapacitor[] =>
  capacitors.map((capacitor, capacitorIndex) => ({
    ...capacitor,
    footprint:
      capacitor.capacitance === "10uF" ||
      capacitor.capacitance === "4.7uF" ||
      capacitor.capacitance === "2.2uF"
        ? "cap0402_nosilkscreen"
        : "cap0201_nosilkscreen",
    name: `C_SOC_${railName}_${capacitor.evmReference}`,
    railNetName: railName,
    targetBall: ballNames[capacitorIndex % ballNames.length]!,
  }))

const underCapacitors = (
  capacitance: string,
  priority: UnplacedAm62lDecouplingCapacitor["priority"],
  evmReferences: readonly string[],
) =>
  evmReferences.map((evmReference) => ({
    capacitance,
    evmReference,
    placement: "under" as const,
    priority,
  }))

const perimeterCapacitors = (
  capacitance: string,
  evmReferences: readonly string[],
) =>
  evmReferences.map((evmReference) => ({
    capacitance,
    evmReference,
    placement: "perimeter" as const,
    priority: "bulk" as const,
  }))

// The inventory matches TMDS62LEVM schematic sheets 18-19. These are the 60
// fitted processor capacitors not already represented by the eight VDDS_DDR
// capacitors above. Required/high/medium parts remain under or near the BGA;
// low-priority C98 uses a perimeter site to preserve clearance. C102 is DNI.
const AM62L_UNPLACED_DIRECT_DECOUPLING_CAPACITORS = [
  ...createEvmRailCapacitors({
    railName: "VDD_CORE",
    ballNames: AM62L_VDD_CORE_BALLS,
    capacitors: [
      ...underCapacitors("1uF", "high", [
        "U19",
        "U43",
        "U40",
        "U38",
        "U41",
        "U24",
        "U20",
      ]),
      ...underCapacitors("1uF", "medium", [
        "C324",
        "C312",
        "C376",
        "C316",
        "C322",
      ]),
      ...underCapacitors("0.1uF", "medium", ["C304", "C306", "C317", "C332"]),
      ...perimeterCapacitors("10uF", ["C108", "C107"]),
      ...perimeterCapacitors("2.2uF", ["C377"]),
      ...perimeterCapacitors("4.7uF", ["C268"]),
    ],
  }),
  ...createEvmRailCapacitors({
    railName: "VDDA_CORE",
    ballNames: AM62L_VDDA_CORE_BALLS,
    capacitors: [
      ...underCapacitors("0.1uF", "medium", ["C291", "C335", "C337"]),
      ...perimeterCapacitors("4.7uF", ["C275"]),
    ],
  }),
  ...createEvmRailCapacitors({
    railName: "VDDA_1V8",
    ballNames: AM62L_VDDA_1V8_BALLS,
    capacitors: [
      ...underCapacitors("0.1uF", "high", ["C318"]),
      ...underCapacitors("1uF", "medium", [
        "C298",
        "C391",
        "C397",
        "C348",
        "C109",
      ]),
      ...underCapacitors("0.01uF", "medium", ["C297"]),
      ...perimeterCapacitors("10uF", ["C111"]),
      ...perimeterCapacitors("1uF", ["C311"]),
    ],
  }),
  ...createEvmRailCapacitors({
    railName: "SOC_DVDD1V8",
    ballNames: AM62L_SOC_DVDD1V8_BALLS,
    capacitors: [
      ...underCapacitors("1uF", "high", ["C341", "C320", "C340", "C295"]),
      ...underCapacitors("1uF", "low", ["C103"]),
      ...perimeterCapacitors("10uF", ["C95"]),
      ...perimeterCapacitors("1uF", ["C314"]),
    ],
  }),
  ...createEvmRailCapacitors({
    railName: "SOC_DVDD3V3",
    ballNames: AM62L_SOC_DVDD3V3_BALLS,
    capacitors: [
      ...underCapacitors("1uF", "high", ["C394", "C395", "C290"]),
      ...underCapacitors("1uF", "medium", ["C402", "C349"]),
      ...perimeterCapacitors("10uF", ["C408"]),
      ...perimeterCapacitors("1uF", ["C334"]),
    ],
  }),
  ...createEvmRailCapacitors({
    railName: "VPP_1V8",
    ballNames: AM62L_VPP_BALLS,
    capacitors: [
      {
        capacitance: "1uF",
        evmReference: "C98",
        placement: "perimeter",
        priority: "low",
      },
      ...perimeterCapacitors("1uF", ["C99"]),
      ...perimeterCapacitors("0.1uF", ["C104"]),
    ],
  }),
  ...createEvmRailCapacitors({
    railName: "VDD_MMC1_SD",
    ballNames: AM62L_VDD_MMC1_SD_BALLS,
    capacitors: underCapacitors("0.1uF", "low", ["C289"]),
  }),
  ...createEvmRailCapacitors({
    railName: "VDDSHV_SD_IO",
    ballNames: AM62L_VDDSHV_SD_IO_BALLS,
    capacitors: underCapacitors("0.1uF", "low", ["C301"]),
  }),
  ...createEvmRailCapacitors({
    railName: "SOC_VDD_RTC",
    ballNames: AM62L_SOC_VDD_RTC_BALLS,
    capacitors: underCapacitors("1uF", "low", ["C300"]),
  }),
  ...createEvmRailCapacitors({
    railName: "SOC_VDDS_RTC_1V8",
    ballNames: AM62L_SOC_VDDS_RTC_1V8_BALLS,
    capacitors: underCapacitors("1uF", "low", ["C292"]),
  }),
  ...AM62L_SPECIAL_CAP_BALLS.map(
    ({ ballName, capacitance, evmReference, pinSignal }) => ({
      capacitance,
      evmReference,
      footprint: "cap0201_nosilkscreen" as const,
      name: `C_SOC_${pinSignal}_${evmReference}`,
      placement: "under" as const,
      priority: "required" as const,
      railNetName: pinSignal,
      targetBall: ballName,
    }),
  ),
] as const satisfies readonly UnplacedAm62lDecouplingCapacitor[]

// These deterministic sites were selected against the completed DDR fanout.
// Each entry has one short bottom-layer leg to a local power-net handoff via
// and one to GND. Multiple entry orientations preserve the board's configured
// DRC clearances while keeping every site within 3.81 mm of its rail's BGA
// balls. The six CAP_* rails each have a single, exact target ball.
const AM62L_UNDER_DECOUPLING_PLACEMENTS = [
  {
    railNetName: "CAP_VDDS_MMC0",
    pcbX: -3.5,
    pcbY: 4.7,
    pcbRotation: 0,
    groundViaOffset: { x: -0.8, y: 0 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 2.3,
    pcbY: -0.2,
    pcbRotation: 0,
    groundViaOffset: { x: -0.8, y: 0.2 },
    powerViaOffset: { x: 0.8, y: 0.2 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 1.2,
    pcbY: -4.7,
    pcbRotation: 180,
    groundViaOffset: { x: -0.15, y: -0.45 },
    powerViaOffset: { x: 0.15, y: -0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 1.1,
    pcbY: 0.2,
    pcbRotation: 180,
    groundViaOffset: { x: -0.15, y: 0.45 },
    powerViaOffset: { x: 0.15, y: -0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 4.5,
    pcbY: 2.5,
    pcbRotation: 90,
    groundViaOffset: { x: -0.8, y: -0.2 },
    powerViaOffset: { x: 0.8, y: 0.2 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 2.1,
    pcbY: 3.7,
    pcbRotation: 0,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 3.8,
    pcbY: -1.8,
    pcbRotation: 0,
    groundViaOffset: { x: -0.8, y: 0.2 },
    powerViaOffset: { x: 0.8, y: 0.2 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 3.1,
    pcbY: 4.2,
    pcbRotation: 180,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 0,
    pcbY: -4.5,
    pcbRotation: 0,
    groundViaOffset: { x: -0.8, y: -0.2 },
    powerViaOffset: { x: 0.8, y: -0.2 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 3.3,
    pcbY: 3.1,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 1.1,
    pcbY: -2.3,
    pcbRotation: 0,
    groundViaOffset: { x: -0.51, y: 0.45 },
    powerViaOffset: { x: 0.51, y: 0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 2.2,
    pcbY: -1.9,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 3.8,
    pcbY: 3.1,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 3.2,
    pcbY: -0.8,
    pcbRotation: 0,
    groundViaOffset: { x: -0.8, y: -0.2 },
    powerViaOffset: { x: 0.8, y: -0.2 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: -2.6,
    pcbY: 4.2,
    pcbRotation: 0,
    groundViaOffset: { x: -0.15, y: -0.45 },
    powerViaOffset: { x: 0.2, y: 0.45 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: 2.6,
    pcbY: -4.3,
    pcbRotation: 0,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "VDD_CORE",
    pcbX: -4.2,
    pcbY: 3.9,
    pcbRotation: 0,
    groundViaOffset: { x: -0.15, y: 0.45 },
    powerViaOffset: { x: 0.2, y: -0.45 },
  },
  {
    railNetName: "CAP_VDDS_GENERAL1",
    pcbX: 0.4,
    pcbY: 6.2,
    pcbRotation: 180,
    groundViaOffset: { x: -0.51, y: -0.45 },
    powerViaOffset: { x: 0.51, y: -0.45 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: 5,
    pcbY: -2.5,
    pcbRotation: 90,
    groundViaOffset: { x: -0.15, y: 0.45 },
    powerViaOffset: { x: 0.15, y: 0.45 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: 5.4,
    pcbY: 1.3,
    pcbRotation: 90,
    groundViaOffset: { x: -0.51, y: -0.45 },
    powerViaOffset: { x: 0.51, y: -0.45 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: -1.4,
    pcbY: -4.7,
    pcbRotation: 180,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: 4.4,
    pcbY: 4.1,
    pcbRotation: 180,
    groundViaOffset: { x: -0.15, y: 0.45 },
    powerViaOffset: { x: 0.15, y: 0.45 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: -0.3,
    pcbY: -5.6,
    pcbRotation: 90,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: 0,
    pcbY: 1.7,
    pcbRotation: 0,
    groundViaOffset: { x: -0.8, y: 0 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "VDDA_1V8",
    pcbX: 1.9,
    pcbY: 6.2,
    pcbRotation: 180,
    groundViaOffset: { x: -0.51, y: -0.45 },
    powerViaOffset: { x: 0.51, y: -0.45 },
  },
  {
    railNetName: "VDDSHV_SD_IO",
    pcbX: -3.2,
    pcbY: -5.1,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "SOC_DVDD1V8",
    pcbX: 5.5,
    pcbY: 3.5,
    pcbRotation: 180,
    groundViaOffset: { x: -0.8, y: -0.2 },
    powerViaOffset: { x: 0.8, y: 0.2 },
  },
  {
    railNetName: "SOC_DVDD1V8",
    pcbX: 1.7,
    pcbY: -5.6,
    pcbRotation: 90,
    groundViaOffset: { x: -0.8, y: 0 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "SOC_DVDD1V8",
    pcbX: 5.6,
    pcbY: 2.3,
    pcbRotation: 180,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "SOC_DVDD1V8",
    pcbX: 5.6,
    pcbY: 2.8,
    pcbRotation: 180,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "SOC_DVDD1V8",
    pcbX: 1.2,
    pcbY: -5.6,
    pcbRotation: 90,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "SOC_DVDD3V3",
    pcbX: -1.4,
    pcbY: 5.1,
    pcbRotation: 180,
    groundViaOffset: { x: -0.15, y: 0.45 },
    powerViaOffset: { x: 0.15, y: 0.45 },
  },
  {
    railNetName: "SOC_DVDD3V3",
    pcbX: -1.8,
    pcbY: -5.6,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "SOC_DVDD3V3",
    pcbX: -0.9,
    pcbY: 6.2,
    pcbRotation: 180,
    groundViaOffset: { x: -0.15, y: -0.45 },
    powerViaOffset: { x: 0.15, y: -0.45 },
  },
  {
    railNetName: "SOC_DVDD3V3",
    pcbX: -2.3,
    pcbY: 6,
    pcbRotation: 180,
    groundViaOffset: { x: -0.51, y: -0.45 },
    powerViaOffset: { x: 0.51, y: -0.45 },
  },
  {
    railNetName: "SOC_DVDD3V3",
    pcbX: 6.2,
    pcbY: 0.9,
    pcbRotation: 90,
    groundViaOffset: { x: -0.8, y: 0 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "VDDA_CORE",
    pcbX: 0.2,
    pcbY: -6.2,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "VDDA_CORE",
    pcbX: -1.3,
    pcbY: -6.2,
    pcbRotation: 90,
    groundViaOffset: { x: -0.15, y: -0.45 },
    powerViaOffset: { x: 0.15, y: -0.45 },
  },
  {
    railNetName: "VDDA_CORE",
    pcbX: -0.6,
    pcbY: 4.2,
    pcbRotation: 180,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "CAP_VDDS_MMC2",
    pcbX: 3.2,
    pcbY: -1.3,
    pcbRotation: 0,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.8, y: 0 },
  },
  {
    railNetName: "SOC_VDDS_RTC_1V8",
    pcbX: 6.1,
    pcbY: -4,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: 0.45 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "SOC_VDD_RTC",
    pcbX: 3.7,
    pcbY: -5.6,
    pcbRotation: 90,
    groundViaOffset: { x: -0.8, y: 0 },
    powerViaOffset: { x: 0.35, y: 0.45 },
  },
  {
    railNetName: "CAP_VDDSHV_MMC",
    pcbX: 2.7,
    pcbY: -5.6,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "CAP_VDDS_GPMC",
    pcbX: 2.8,
    pcbY: -2.2,
    pcbRotation: 270,
    groundViaOffset: { x: -0.51, y: -0.45 },
    powerViaOffset: { x: 0.51, y: 0.45 },
  },
  {
    railNetName: "CAP_VDDS_MMC1",
    pcbX: -2.3,
    pcbY: -6.1,
    pcbRotation: 270,
    groundViaOffset: { x: -0.35, y: -0.45 },
    powerViaOffset: { x: 0.35, y: -0.45 },
  },
  {
    railNetName: "VDD_MMC1_SD",
    pcbX: 4.6,
    pcbY: -4.8,
    pcbRotation: 0,
    groundViaOffset: { x: -0.15, y: 0.45 },
    powerViaOffset: { x: 0.15, y: -0.45 },
  },
] as const

const AM62L_PERIMETER_CAP_SLOTS = [
  { pcbX: -8, pcbY: -5.4, pcbRotation: 0 },
  { pcbX: -8, pcbY: -1.8, pcbRotation: 0 },
  { pcbX: -8, pcbY: 1.8, pcbRotation: 0 },
  { pcbX: -8, pcbY: 5.4, pcbRotation: 0 },
  { pcbX: -5.2, pcbY: 8, pcbRotation: 270 },
  { pcbX: -2.6, pcbY: 8, pcbRotation: 270 },
  { pcbX: 0, pcbY: 8, pcbRotation: 270 },
  { pcbX: 2.6, pcbY: 8, pcbRotation: 270 },
  { pcbX: 5.2, pcbY: 8, pcbRotation: 270 },
  { pcbX: -3.9, pcbY: -8, pcbRotation: 90 },
  { pcbX: -1.3, pcbY: -8, pcbRotation: 90 },
  { pcbX: 1.3, pcbY: -8, pcbRotation: 90 },
  { pcbX: 3.9, pcbY: -8, pcbRotation: 90 },
  { pcbX: -8, pcbY: 0, pcbRotation: 0 },
] as const

const getPerimeterViaOffsets = (
  footprint: UnplacedAm62lDecouplingCapacitor["footprint"],
) =>
  footprint === "cap0402_nosilkscreen"
    ? {
        groundViaOffset: { x: -0.51, y: 0.57 },
        powerViaOffset: { x: 0.51, y: 0.57 },
      }
    : {
        groundViaOffset: { x: -0.33, y: 0.45 },
        powerViaOffset: { x: 0.33, y: 0.45 },
      }

interface PlacedAm62lDecouplingCapacitor extends UnplacedAm62lDecouplingCapacitor {
  groundViaOffset: { x: number; y: number }
  maxDecouplingTraceLength: number
  pcbRotation: number
  pcbX: number
  pcbY: number
  powerViaOffset: { x: number; y: number }
}

export const AM62L_DIRECT_DECOUPLING_CAPACITORS: PlacedAm62lDecouplingCapacitor[] =
  AM62L_UNPLACED_DIRECT_DECOUPLING_CAPACITORS.map((capacitor, index, all) => {
    const earlierCapacitors = all.slice(0, index)
    const placement =
      capacitor.placement === "under"
        ? AM62L_UNDER_DECOUPLING_PLACEMENTS.filter(
            (candidate) => candidate.railNetName === capacitor.railNetName,
          )[
            earlierCapacitors.filter(
              (candidate) =>
                candidate.placement === "under" &&
                candidate.railNetName === capacitor.railNetName,
            ).length
          ]
        : AM62L_PERIMETER_CAP_SLOTS[
            earlierCapacitors.filter(
              (candidate) => candidate.placement === "perimeter",
            ).length
          ]
    if (!placement) {
      throw new Error(`Missing decoupling placement for ${capacitor.name}`)
    }
    const viaOffsets =
      capacitor.placement === "under"
        ? {
            groundViaOffset: (
              placement as (typeof AM62L_UNDER_DECOUPLING_PLACEMENTS)[number]
            ).groundViaOffset,
            powerViaOffset: (
              placement as (typeof AM62L_UNDER_DECOUPLING_PLACEMENTS)[number]
            ).powerViaOffset,
          }
        : getPerimeterViaOffsets(capacitor.footprint)
    return {
      ...capacitor,
      ...placement,
      ...viaOffsets,
      maxDecouplingTraceLength:
        capacitor.placement === "under"
          ? AM62L_DDR_MAX_DECOUPLING_DISTANCE
          : 15,
    }
  })

const AM62L_ALL_DECOUPLING_CAPACITORS = [
  ...AM62L_DDR_DECOUPLING_CAPACITORS.map((capacitor) => ({
    ...capacitor,
    footprint: "cap0201_nosilkscreen" as const,
    maxDecouplingTraceLength: AM62L_DDR_MAX_DECOUPLING_DISTANCE,
    placement: "under" as const,
    railNetName: "VDD_LPDDR4",
  })),
  ...AM62L_DIRECT_DECOUPLING_CAPACITORS,
] as const

const parseBallList = (ballNames: string): readonly string[] =>
  ballNames.trim().split(/\s+/)

const AM62L_VSS_BALLS = parseBallList(`
  A1 A2 A4 A10 A13 A16 A19 A22 A23 B1 B5 B17 B20 B23 C12 C18 D1
  E2 E6 E8 E9 E10 E14 E15 F5 F6 F18 G7 G8 G9 G12 G15 G16 G17
  H1 H7 H14 H17 K8 K9 K15 L7 L9 L13 L16 L18 M1 M12 N7 N9 N11
  N13 N16 P9 P15 R1 R8 R13 R15 T2 T7 T8 T19 U7 U8 U10 U13 U14
  U15 U17 U20 V3 V18 V19 W9 W10 W12 W14 W15 W16 W18 Y1 Y20 Y21
  AA4 AA20 AB1 AB7 AB21 AB23 AC1 AC2 AC11 AC14 AC19 AC22 AC23
`)

const getRequiredPinNumber = (
  pinNumberByBall: ReadonlyMap<string, number>,
  ballName: string,
  packageName: string,
): number => {
  const pinNumber = pinNumberByBall.get(ballName)
  if (pinNumber === undefined) {
    throw new Error(`${packageName} does not contain ball ${ballName}`)
  }
  return pinNumber
}

const createAm62lPowerBallAssignments = (
  railNetName: string,
  pinSignal: string,
  ballNames: readonly string[],
) =>
  ballNames.map((ballName) => ({
    ballName,
    pinNumber: getRequiredPinNumber(
      AM62L_PIN_NUMBER_BY_BALL,
      ballName,
      "AM62L",
    ),
    pinSignal,
    railNetName,
  }))

export const AM62L_POWER_BALLS = [
  ...createAm62lPowerBallAssignments("GND", "VSS", AM62L_VSS_BALLS),
  ...createAm62lPowerBallAssignments(
    "VDD_CORE",
    "VDD_CORE",
    AM62L_VDD_CORE_BALLS.slice(0, -1),
  ),
  ...createAm62lPowerBallAssignments("VDD_CORE", "VDDA_DDR_PLL0", ["M10"]),
  ...createAm62lPowerBallAssignments(
    "VDD_LPDDR4",
    "VDDS_DDR",
    AM62L_VDDS_DDR_BALLS,
  ),
  ...createAm62lPowerBallAssignments("VDDA_1V8", "VDDA_1P8_DSI", ["G14"]),
  ...createAm62lPowerBallAssignments("VDDA_1V8", "VDDA_1P8_USB", ["T12"]),
  ...createAm62lPowerBallAssignments("VDDA_1V8", "VDDS_OSC0", ["R16"]),
  ...createAm62lPowerBallAssignments("VDDA_1V8", "VDDA_ADC", ["N17"]),
  ...createAm62lPowerBallAssignments("VDDA_1V8", "VDDA_PLL0", ["L11"]),
  ...createAm62lPowerBallAssignments("VDDA_1V8", "VDDA_PLL1", ["K12"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD3V3", "VDDA_3P3_USB", ["U12"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD3V3", "VDDSHV0", ["J16", "L17"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD3V3", "VDDSHV1", ["G10", "H10"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD1V8", "VDDSHV2", ["H8"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD1V8", "VDDSHV4", ["M17"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD1V8", "VDDS0", ["T14"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD1V8", "VDDS1", ["H16"]),
  ...createAm62lPowerBallAssignments("SOC_DVDD1V8", "VDDS_WKUP", ["P16"]),
  ...createAm62lPowerBallAssignments("VDDA_CORE", "VDDA_CORE_USB", ["U11"]),
  ...createAm62lPowerBallAssignments("VDDA_CORE", "VDDA_CORE_DSI_CLK", ["H12"]),
  ...createAm62lPowerBallAssignments("VDDA_CORE", "VDDA_CORE_DSI", ["G13"]),
  ...createAm62lPowerBallAssignments("VPP_1V8", "VPP", AM62L_VPP_BALLS),
  ...createAm62lPowerBallAssignments(
    "VDD_MMC1_SD",
    "VDDA_3P3_SDIO",
    AM62L_VDD_MMC1_SD_BALLS,
  ),
  ...createAm62lPowerBallAssignments(
    "VDDSHV_SD_IO",
    "VDDSHV3",
    AM62L_VDDSHV_SD_IO_BALLS,
  ),
  ...createAm62lPowerBallAssignments(
    "SOC_VDD_RTC",
    "VDD_RTC",
    AM62L_SOC_VDD_RTC_BALLS,
  ),
  ...createAm62lPowerBallAssignments(
    "SOC_VDDS_RTC_1V8",
    "VDDS_RTC",
    AM62L_SOC_VDDS_RTC_1V8_BALLS,
  ),
  ...AM62L_SPECIAL_CAP_BALLS.flatMap(({ ballName, pinSignal }) =>
    createAm62lPowerBallAssignments(pinSignal, pinSignal, [ballName]),
  ),
]

export const AM62L_DIRECT_POWER_BALLS = AM62L_POWER_BALLS.filter(
  ({ railNetName }) => railNetName !== "GND" && railNetName !== "VDD_LPDDR4",
)
export const AM62L_DIRECT_RAIL_NET_NAMES = [
  ...new Set(AM62L_DIRECT_POWER_BALLS.map(({ railNetName }) => railNetName)),
]

const AM62L_PIN_LABELS = {
  ...Object.fromEntries(
    AM62L_POWER_BALLS.map(({ ballName, pinNumber, pinSignal }) => [
      `pin${pinNumber}`,
      [ballName, pinSignal],
    ]),
  ),
  ...Object.fromEntries(
    [
      ...DDR_ADDR_CTRL_CONNECTIONS,
      ...DDR_CLOCK_CONNECTIONS,
      ...DDR_DQS0_CONNECTIONS,
      ...DDR_DQS1_CONNECTIONS,
      DDR_RESET_CONNECTION,
      DDR_DMI0_CONNECTION,
      DDR_DMI1_CONNECTION,
    ].map(({ socBall, socPinNumber, socSignal }) => [
      `pin${socPinNumber}`,
      [socBall, socSignal],
    ]),
  ),
  pin76: ["E1", "DDR0_DQ3"],
  pin91: ["F1", "DDR0_DQ2"],
  pin93: ["F3", "DDR0_DQ1"],
  pin94: ["F4", "DDR0_DQ0"],
  pin105: ["G4", "DDR0_DQ4"],
  pin121: ["H2", "DDR0_DQ6"],
  pin122: ["H3", "DDR0_DQ7"],
  pin123: ["H4", "DDR0_DQ5"],
  pin236: ["T1", "DDR0_DQ10"],
  pin238: ["T3", "DDR0_DQ9"],
  pin255: ["U1", "DDR0_DQ11"],
  pin256: ["U2", "DDR0_DQ14"],
  pin257: ["U4", "DDR0_DQ12"],
  pin275: ["V4", "DDR0_DQ8"],
  pin276: ["V5", "DDR0_DQ13"],
  pin284: ["W1", "DDR0_DQ15"],
} as const

const AM62L_DECOUPLING_CAPACITOR_BY_TARGET_BALL = (() => {
  const capacitorsByTargetBall = new Map<
    string,
    (typeof AM62L_ALL_DECOUPLING_CAPACITORS)[number]
  >()
  for (const capacitor of AM62L_ALL_DECOUPLING_CAPACITORS) {
    if (!capacitorsByTargetBall.has(capacitor.targetBall)) {
      capacitorsByTargetBall.set(capacitor.targetBall, capacitor)
    }
  }
  return capacitorsByTargetBall
})()
const AM62L_SPECIAL_CAP_BALL_NAME_SET = new Set<string>(
  AM62L_SPECIAL_CAP_BALLS.map(({ ballName }) => ballName),
)
export const AM62L_PIN_ATTRIBUTES = Object.fromEntries(
  AM62L_POWER_BALLS.filter(({ pinSignal }) => pinSignal !== "VSS").map(
    ({ ballName }) => {
      const capacitor = AM62L_DECOUPLING_CAPACITOR_BY_TARGET_BALL.get(ballName)
      if (!capacitor) {
        throw new Error(`Missing AM62L decoupling capacitor for ${ballName}`)
      }
      return [
        ballName,
        {
          requiresPower: !AM62L_SPECIAL_CAP_BALL_NAME_SET.has(ballName),
          shouldHaveDecouplingCapacitor: true,
          recommendedDecouplingCapacitorCapacitance: capacitor.capacitance,
        },
      ]
    },
  ),
) as NonNullable<ChipProps<typeof AM62L_PIN_LABELS>["pinAttributes"]>

export const Am62l32 = (props: ChipProps<typeof AM62L_PIN_LABELS>) => (
  <chip
    {...props}
    pinLabels={AM62L_PIN_LABELS}
    manufacturerPartNumber="AM62L32BOGHAANBR"
    footprint={
      <footprint>
        {AM62L_PAD_POSITIONS.map(({ ballName, pinNumber, x, y }) => (
          <Fragment key={`am62l-pad-${pinNumber}`}>
            <smtpad
              portHints={[`pin${pinNumber}`, ballName]}
              pcbX={x}
              pcbY={y}
              radius="0.127mm"
              shape="circle"
            />
          </Fragment>
        ))}
        <silkscreenpath
          route={[
            { x: -5.95, y: -5.95 },
            { x: 5.95, y: -5.95 },
            { x: 5.95, y: 5.95 },
            { x: -5.95, y: 5.95 },
            { x: -5.95, y: -5.95 },
          ]}
        />
        <silkscreencircle pcbX={-5.55} pcbY={5.55} radius="0.18mm" />
      </footprint>
    }
  />
)

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
const LPDDR4_PIN_NUMBER_BY_BALL = new Map(
  LPDDR4_BALL_NAMES.map((ballName, index) => [ballName, index + 1]),
)

const LPDDR4_VDDQ_BALLS = parseBallList(`
  B3 B5 B8 B10 D1 D5 D8 D12 F3 F10 U3 U10 W1 W5 W8 W12
  AA3 AA5 AA8 AA10
`)
const LPDDR4_VDD2_BALLS = parseBallList(`
  A4 A9 F5 F8 H1 H5 H8 H12 K1 K3 K10 K12 N1 N3 N10 N12
  R1 R5 R8 R12 U5 U8 AB4 AB9
`)
const LPDDR4_VSS_BALLS = parseBallList(`
  A3 A10 C1 C5 C8 C12 D2 D4 D9 D11 E1 E5 E8 E12 G1 G3 G5 G8 G10 G12
  J1 J3 J10 J12 K2 K4 K9 K11 N2 N4 N9 N11 P1 P3 P10 P12 T1 T3 T5 T8
  T10 T12 V1 V5 V8 V12 W2 W4 W9 W11 Y1 Y5 Y8 Y12 AB3 AB5 AB8 AB10
`)
const LPDDR4_VDD1_BALLS = parseBallList("F1 F12 G4 G9 T4 T9 U1 U12")

const createLpddr4BallAssignments = <
  const BallName extends string,
  const PinSignal extends string,
>(
  ballNames: readonly BallName[],
  pinSignal: PinSignal,
) =>
  ballNames.map((ballName) => ({
    ballName,
    pinNumber: getRequiredPinNumber(
      LPDDR4_PIN_NUMBER_BY_BALL,
      ballName,
      "MT53E1G16D1ZW",
    ),
    pinSignal,
  }))

export const LPDDR4_POWER_BALLS = [
  ...createLpddr4BallAssignments(LPDDR4_VSS_BALLS, "VSS"),
  ...createLpddr4BallAssignments(LPDDR4_VDDQ_BALLS, "VDDQ"),
  ...createLpddr4BallAssignments(LPDDR4_VDD2_BALLS, "VDD2"),
]
export const LPDDR4_VDD1_ASSIGNMENTS = createLpddr4BallAssignments(
  LPDDR4_VDD1_BALLS,
  "VDD1",
)

const LPDDR4_PIN_LABELS = {
  ...Object.fromEntries(
    [...LPDDR4_POWER_BALLS, ...LPDDR4_VDD1_ASSIGNMENTS].map(
      ({ ballName, pinNumber, pinSignal }) => [
        `pin${pinNumber}`,
        [ballName, pinSignal],
      ],
    ),
  ),
  ...Object.fromEntries(
    [
      ...DDR_ADDR_CTRL_CONNECTIONS,
      ...DDR_CLOCK_CONNECTIONS,
      ...DDR_DQS0_CONNECTIONS,
      ...DDR_DQS1_CONNECTIONS,
      DDR_RESET_CONNECTION,
      DDR_DMI0_CONNECTION,
      DDR_DMI1_CONNECTION,
    ].map(({ memoryBall, memoryPinNumber, memorySignal }) => [
      `pin${memoryPinNumber}`,
      [memoryBall, memorySignal],
    ]),
  ),
  pin12: ["B2", "DQ0"],
  pin14: ["B4", "DQ7"],
  pin17: ["B9", "DQ15"],
  pin19: ["B11", "DQ8"],
  pin22: ["C2", "DQ1"],
  pin24: ["C4", "DQ6"],
  pin27: ["C9", "DQ14"],
  pin29: ["C11", "DQ9"],
  pin42: ["E2", "DQ2"],
  pin44: ["E4", "DQ5"],
  pin47: ["E9", "DQ13"],
  pin49: ["E11", "DQ10"],
  pin52: ["F2", "DQ3"],
  pin54: ["F4", "DQ4"],
  pin57: ["F9", "DQ12"],
  pin59: ["F11", "DQ11"],
} as const

const LPDDR4_BALL_X = [-4.4, -3.6, -2.8, -2, -1.2, 1.2, 2, 2.8, 3.6, 4.4]
const LPDDR4_BALL_Y = [
  6.825, 6.175, 5.525, 4.875, 4.225, 3.575, 2.925, 2.275, 1.625, 0.975, -0.975,
  -1.625, -2.275, -2.925, -3.575, -4.225, -4.875, -5.525, -6.175, -6.825,
]
const LPDDR4_BALL_POSITIONS = LPDDR4_BALL_Y.flatMap((y) =>
  LPDDR4_BALL_X.map((x) => ({ x, y })),
)

export const Mt53e1g16d1zw = (props: ChipProps<typeof LPDDR4_PIN_LABELS>) => (
  <chip
    {...props}
    pinLabels={LPDDR4_PIN_LABELS}
    manufacturerPartNumber="MT53E1G16D1ZW"
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
