export const mspm0g5117Pins = {
  swdio: 12, // PA19 / SWDIO
  swclk: 13, // PA20 / SWCLK
  vusb: 29, // VUSB33
  usbDm: 30, // PA26 / USB_DM
  usbDp: 31, // PA27 / USB_DP
  vcore: 32,
  reset: 38,
  vdd: 40,
  vss: 41,
  rosc: 42, // PA2 / ROSC
  sensorInterrupt: 47, // PB0
  sensorReset: 48, // PB1
  i2cScl: 50, // PB2 / UC1_SCL_RX
  i2cSda: 51, // PB3 / UC1_SDA_TX
  backlightPwm: 50, // PB2 / TIMA0_C3
  displayTe: 51, // PB3
  displayBusy: 51, // PB3
  displayReset: 52, // PB4
  displayDc: 53, // PB5
  displayCs: 58, // PB6 / UC3_CS0_CTS
  spiMiso: 59, // PB7 / UC3_POCI_RTS
  spiMosi: 60, // PB8 / UC3_PICO_TX
  spiClock: 61, // PB9 / UC3_SCK_RX
} as const;

export const mspm0g5117PinLabels = {
  pin1: "PB13",
  pin2: "PB14",
  pin3: "PB15",
  pin4: "PB16",
  pin5: "PA12",
  pin6: "PA13",
  pin7: "PA14",
  pin8: "PA15",
  pin9: "PA16",
  pin10: "PA17",
  pin11: "PA18",
  pin12: ["PA19", "SWDIO"],
  pin13: ["PA20", "SWCLK"],
  pin14: "PB17",
  pin15: "PB18",
  pin16: "PB19",
  pin17: "PA21",
  pin18: "PA22",
  pin19: "PB20",
  pin20: "PB21",
  pin21: "PB22",
  pin22: "PB23",
  pin23: "PB24",
  pin24: ["PA23", "VREF+"],
  pin25: "PA24",
  pin26: "PA25",
  pin27: "PB25",
  pin28: "PB26",
  pin29: "VUSB33",
  pin30: ["PA26", "USB_DM"],
  pin31: ["PA27", "USB_DP"],
  pin32: "VCORE",
  pin33: "PA0",
  pin34: "PA1",
  pin35: "PA28",
  pin36: "PA29",
  pin37: "PA30",
  pin38: "NRST",
  pin39: "PA31",
  pin40: "VDD",
  pin41: "VSS",
  pin42: ["PA2", "ROSC"],
  pin43: "PA3",
  pin44: "PA4",
  pin45: "PA5",
  pin46: "PA6",
  pin47: "PB0",
  pin48: "PB1",
  pin49: "PA7",
  pin50: ["PB2", "UC1_SCL_RX", "TIMA0_C3"],
  pin51: ["PB3", "UC1_SDA_TX"],
  pin52: "PB4",
  pin53: "PB5",
  pin54: "PA8",
  pin55: "PA9",
  pin56: "PA10",
  pin57: "PA11",
  pin58: ["PB6", "UC3_CS0_CTS"],
  pin59: ["PB7", "UC3_POCI_RTS"],
  pin60: ["PB8", "UC3_PICO_TX"],
  pin61: ["PB9", "UC3_SCK_RX"],
  pin62: "PB10",
  pin63: "PB11",
  pin64: "PB12",
} as const;

export const MSPM0G5117SPMR = (props: any) => (
  <chip
    manufacturerPartNumber="MSPM0G5117SPMR"
    datasheetUrl="https://www.ti.com/lit/ds/symlink/mspm0g5117.pdf"
    footprint="lqfp64_w10_h10_p0.5mm"
    cadModel={{ glbUrl: "./src/models/mspm0g3507spmr.glb" }}
    pinLabels={mspm0g5117PinLabels}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VDD", "VSS", "VCORE", "VUSB33", "NRST"],
      },
      rightSide: {
        direction: "top-to-bottom",
        pins: [
          "USB_DP",
          "USB_DM",
          "ROSC",
          "SWDIO",
          "SWCLK",
          "PB2",
          "PB3",
          "PB6",
          "PB7",
          "PB8",
          "PB9",
        ],
      },
    }}
    schPinStyle={{
      VSS: { marginTop: 0.3 },
      VCORE: { marginTop: 0.3 },
      VUSB33: { marginTop: 0.3 },
      NRST: { marginTop: 0.3 },
    }}
    schHeight={2.4}
    {...props}
  />
);
