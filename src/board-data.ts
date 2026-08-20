export type ConnectorId = "usb-c" | "usb-micro" | "jst-sh"

export type McuId =
  | "ch552t"
  | "msp430g2553"
  | "msp430fr2433"
  | "msp430fr2355"
  | "msp430fr5994"
  | "msp430f5529"

export interface McuDefinition {
  id: McuId
  displayName: string
  familyNote: string
  manufacturerPartNumber: string
  footprint: string
  pinCount: number
  pinLabels: Record<string, string>
  adcPin: number
  uartTxPin: number
  uartRxPin: number
  resetPin: number
  vccPins: number[]
  gndPins: number[]
  nativeUsb?: {
    dpPin: number
    dmPin: number
  }
  supplierPartNumbers?: { jlcpcb: string[] }
}

const makePinLabels = (
  pinCount: number,
  overrides: Record<number, string>,
): Record<string, string> =>
  Object.fromEntries(
    Array.from({ length: pinCount }, (_, index) => {
      const pin = index + 1
      return [`pin${pin}`, overrides[pin] ?? `GPIO_${pin}`]
    }),
  )

export const connectors: Record<ConnectorId, { displayName: string; note: string }> = {
  "usb-c": {
    displayName: "USB-C",
    note: "USB 2.0 device, reversible connector, 5.1 kΩ CC pull-downs",
  },
  "usb-micro": {
    displayName: "USB Micro-B",
    note: "USB 2.0 device with compact legacy connector",
  },
  "jst-sh": {
    displayName: "JST-SH 4-pin",
    note: "3.3 V, ground, UART TX and UART RX",
  },
}

export const mcus: Record<McuId, McuDefinition> = {
  ch552t: {
    id: "ch552t",
    displayName: "WCH CH552T",
    familyNote: "Native USB, 10-bit ADC",
    manufacturerPartNumber: "CH552T",
    footprint: "kicad:Package_SO/TSSOP-20_4.4x6.5mm_P0.65mm",
    pinCount: 20,
    pinLabels: makePinLabels(20, {
      1: "P3_2_AIN3",
      2: "P1_4_AIN1_CC1",
      3: "P1_5_AIN2_CC2",
      5: "P1_7_LED",
      6: "RST",
      8: "P1_1_AIN0",
      9: "P3_1_TXD",
      10: "P3_0_RXD",
      14: "USB_DP",
      15: "USB_DM",
      18: "GND",
      19: "VCC",
      20: "V33",
    }),
    adcPin: 8,
    uartTxPin: 9,
    uartRxPin: 10,
    resetPin: 6,
    vccPins: [19],
    gndPins: [18],
    nativeUsb: { dpPin: 14, dmPin: 15 },
    supplierPartNumbers: { jlcpcb: ["C111367"] },
  },
  msp430g2553: {
    id: "msp430g2553",
    displayName: "TI MSP430G2553",
    familyNote: "Value Line, 10-bit ADC",
    manufacturerPartNumber: "MSP430G2553IPW20R",
    footprint: "kicad:Package_SO/TSSOP-20_4.4x6.5mm_P0.65mm",
    pinCount: 20,
    pinLabels: makePinLabels(20, {
      1: "DVCC",
      2: "P1_0_A0",
      3: "P1_1_UART_RX_A1",
      4: "P1_2_UART_TX_A2",
      16: "RST_SBWTDIO",
      17: "TEST_SBWTCK",
      20: "DVSS",
    }),
    adcPin: 2,
    uartTxPin: 4,
    uartRxPin: 3,
    resetPin: 16,
    vccPins: [1],
    gndPins: [20],
    supplierPartNumbers: { jlcpcb: ["C53923"] },
  },
  msp430fr2433: {
    id: "msp430fr2433",
    displayName: "TI MSP430FR2433",
    familyNote: "Compact FRAM sensing, 10-bit ADC",
    manufacturerPartNumber: "MSP430FR2433IRGER",
    footprint:
      "kicad:Package_DFN_QFN/VQFN-24-1EP_4x4mm_P0.5mm_EP2.45x2.45mm",
    pinCount: 25,
    pinLabels: makePinLabels(25, {
      1: "RST_SBWTDIO",
      2: "TEST_SBWTCK",
      3: "P2_6_UART_TX",
      4: "P2_5_UART_RX",
      10: "P1_0_A0",
      17: "DVSS",
      18: "DVCC",
      25: "EXPOSED_PAD_GND",
    }),
    adcPin: 10,
    uartTxPin: 3,
    uartRxPin: 4,
    resetPin: 1,
    vccPins: [18],
    gndPins: [17],
    supplierPartNumbers: { jlcpcb: ["C191026"] },
  },
  msp430fr2355: {
    id: "msp430fr2355",
    displayName: "TI MSP430FR2355",
    familyNote: "Smart Analog Combo, 12-bit ADC",
    manufacturerPartNumber: "MSP430FR2355TPT",
    footprint: "kicad:Package_QFP/LQFP-48_7x7mm_P0.5mm",
    pinCount: 48,
    pinLabels: makePinLabels(48, {
      3: "P1_0_A0",
      5: "RST_SBWTDIO",
      6: "DVCC",
      7: "DVSS",
      31: "P1_7_UART_TX_A7",
      32: "P1_6_UART_RX_A6",
    }),
    adcPin: 3,
    uartTxPin: 31,
    uartRxPin: 32,
    resetPin: 5,
    vccPins: [6],
    gndPins: [7],
  },
  msp430fr5994: {
    id: "msp430fr5994",
    displayName: "TI MSP430FR5994",
    familyNote: "256 KB FRAM + LEA, 12-bit ADC",
    manufacturerPartNumber: "MSP430FR5994IRGZR",
    footprint:
      "kicad:Package_DFN_QFN/QFN-48-1EP_7x7mm_P0.5mm_EP5.15x5.15mm",
    pinCount: 49,
    pinLabels: makePinLabels(49, {
      1: "P1_0_A0",
      23: "RST_SBWTDIO",
      24: "P2_0_UART_TX",
      25: "P2_1_UART_RX",
      36: "DVSS1",
      37: "DVCC1",
      40: "AVSS3",
      44: "AVSS2",
      47: "AVSS1",
      48: "AVCC1",
      49: "EXPOSED_PAD_GND",
    }),
    adcPin: 1,
    uartTxPin: 24,
    uartRxPin: 25,
    resetPin: 23,
    vccPins: [37, 48],
    gndPins: [36, 40, 44, 47, 49],
  },
  msp430f5529: {
    id: "msp430f5529",
    displayName: "TI MSP430F5529",
    familyNote: "Native USB, 12-bit ADC",
    manufacturerPartNumber: "MSP430F5529IPNR",
    footprint: "kicad:Package_QFP/LQFP-80_12x12mm_P0.5mm",
    pinCount: 80,
    pinLabels: makePinLabels(80, {
      21: "AVCC1",
      22: "DVCC2",
      23: "DVSS2",
      27: "AVSS1",
      36: "DVSS1",
      37: "DVCC1",
      39: "VCORE",
      40: "P3_4_UART_RX",
      41: "P3_3_UART_TX",
      61: "RST_SBWTDIO",
      65: "P6_0_A0",
      73: "AVSS2",
      74: "V18",
      75: "VUSB",
      76: "VBUS",
      77: "USB_DM",
      78: "PUR",
      79: "USB_DP",
      80: "VSSU",
    }),
    adcPin: 65,
    uartTxPin: 41,
    uartRxPin: 40,
    resetPin: 61,
    vccPins: [21, 22, 37],
    gndPins: [23, 27, 36, 73, 80],
    nativeUsb: { dpPin: 79, dmPin: 77 },
    supplierPartNumbers: { jlcpcb: ["C80938"] },
  },
}
