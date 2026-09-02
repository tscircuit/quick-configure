import { MSPM0G3507SPMR, TLV75533PDBVR } from "@tsci/tscircuit.ti";
import { Fragment } from "react";
import { AHT20 } from "../imports/AHT20";
import { BNO055 } from "../imports/BNO055";
import { CH340N } from "../imports/CH340N";
import { LIS3DHTR } from "../imports/LIS3DHTR";
import { LSM6DSOXTR } from "../imports/LSM6DSOXTR";
import { MCP9808T_E_MS } from "../imports/MCP9808T_E_MS";
import { SHT41_AD1B_R2 } from "../imports/SHT41_AD1B_R2";
import { SHT45_AD1B_R2 } from "../imports/SHT45_AD1B_R2";
import { VEML7700_TR } from "../imports/VEML7700_TR";
import { VL53L4CDV0DH_1 } from "../imports/VL53L4CDV0DH_1";
import { MSPM0G5117SPMR, mspm0UsbLqfp64Pins } from "./MSPM0G5117SPMR";
import { MSPM0G5187SPMR } from "./MSPM0G5187SPMR";
import { mspm0Sensors, type Mspm0SensorId } from "./mspm0-sensor-data";
import { SmdUsbC } from "./SmdUsbC";

export interface Mspm0SensorBoardProps {
  sensor: Mspm0SensorId;
  controller?: "mspm0g3507" | "mspm0g5117" | "mspm0g5187";
}

const interfaceSection = { schSectionName: "Interface" } as const;
const controlSection = { schSectionName: "Control" } as const;
const sensorSection = { schSectionName: "Sensor" } as const;

const usbEsdPins = {
  pin1: "DP_PORT",
  pin2: "GND",
  pin3: "DM_PORT",
  pin4: "DM_DEVICE",
  pin5: "VBUS",
  pin6: "DP_DEVICE",
} as const;

const mspm0g3507Pins = {
  swdio: 12,
  swclk: 13,
  vcore: 32,
  reset: 38,
  vdd: 40,
  vss: 41,
  rosc: 42,
  sensorInterrupt: 47, // PB0
  sensorReset: 48, // PB1
  i2cScl: 50, // PB2 / I2C1_SCL
  i2cSda: 51, // PB3 / I2C1_SDA
  uartTx: 56, // PA10 / UART0_TX
  uartRx: 57, // PA11 / UART0_RX
} as const;

const p = (component: string, pin: number) => `.${component} > .pin${pin}`;
const port = (component: string, pinName: string) =>
  `.${component} > .${pinName}`;

// Pack the USB, controller, and sensor zones together while preserving every
// footprint's physical dimensions and local pad geometry.
function compactMspm0X(x: number) {
  if (x <= -40) return x + 11;
  if (x < -28) return x + 12;
  if (x < -15) return x + 6;
  if (x > 12) return x - 8;
  return x;
}

function compactMspm0Y(y: number) {
  if (Math.abs(y) <= 14) return y;
  return Math.sign(y) * (14 + (Math.abs(y) - 14) * 0.25);
}

const bno085PinLabels = {
  pin1: "DNC1",
  pin2: "GND",
  pin3: "VDD",
  pin4: "BOOT_N",
  pin5: "PS1",
  pin6: "PS0_WAKE",
  pin7: "DNC2",
  pin8: "DNC3",
  pin9: "CAP",
  pin10: "CLKSEL0",
  pin11: "RESET_N",
  pin12: "DNC4",
  pin13: "DNC5",
  pin14: "INT_N",
  pin15: "SENSOR_HUB_SCL",
  pin16: "SENSOR_HUB_SDA",
  pin17: "SA0_MOSI",
  pin18: "CS_N",
  pin19: "SCL_SCLK_RX",
  pin20: "SDA_MISO_TX",
  pin21: "DNC6",
  pin22: "DNC7",
  pin23: "DNC8",
  pin24: "DNC9",
  pin25: "GNDIO",
  pin26: "CLKSEL1_XOUT32",
  pin27: "XIN32",
  pin28: "VDDIO",
} as const;

const bno085PinAttributes = {
  pin1: { doNotConnect: true },
  pin2: { requiresGround: true },
  pin3: { requiresPower: true },
  pin7: { doNotConnect: true },
  pin8: { doNotConnect: true },
  pin12: { doNotConnect: true },
  pin13: { doNotConnect: true },
  pin21: { doNotConnect: true },
  pin22: { doNotConnect: true },
  pin23: { doNotConnect: true },
  pin24: { doNotConnect: true },
  pin25: { requiresGround: true },
  pin28: { requiresPower: true },
} as const;

// BNO08x LGA-28 land pattern, 5.2 mm x 3.8 mm.
const bno085Pads = [
  { pin: 1, x: -2.25, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 2, x: -2.3125, y: 0.75, width: 0.575, height: 0.25 },
  { pin: 3, x: -2.3125, y: 0.25, width: 0.575, height: 0.25 },
  { pin: 4, x: -2.3125, y: -0.25, width: 0.575, height: 0.25 },
  { pin: 5, x: -2.3125, y: -0.75, width: 0.575, height: 0.25 },
  { pin: 6, x: -2.25, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 7, x: -1.75, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 8, x: -1.25, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 9, x: -0.75, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 10, x: -0.25, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 11, x: 0.25, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 12, x: 0.75, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 13, x: 1.25, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 14, x: 1.75, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 15, x: 2.25, y: -1.5625, width: 0.25, height: 0.675 },
  { pin: 16, x: 2.3125, y: -0.75, width: 0.575, height: 0.25 },
  { pin: 17, x: 2.3125, y: -0.25, width: 0.575, height: 0.25 },
  { pin: 18, x: 2.3125, y: 0.25, width: 0.575, height: 0.25 },
  { pin: 19, x: 2.3125, y: 0.75, width: 0.575, height: 0.25 },
  { pin: 20, x: 2.25, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 21, x: 1.75, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 22, x: 1.25, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 23, x: 0.75, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 24, x: 0.25, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 25, x: -0.25, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 26, x: -0.75, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 27, x: -1.25, y: 1.5625, width: 0.25, height: 0.675 },
  { pin: 28, x: -1.75, y: 1.5625, width: 0.25, height: 0.675 },
] as const;

const SmtPad = (props: any) => <smtpad {...props} />;
const VerticalCapacitor = (props: any) => (
  <capacitor schOrientation="vertical" {...props} />
);

const BNO085 = (props: any) => (
  <chip
    manufacturerPartNumber="BNO085"
    pinLabels={bno085PinLabels}
    pinAttributes={bno085PinAttributes}
    footprint={
      <footprint>
        {bno085Pads.map((pad) => (
          <Fragment key={pad.pin}>
            <SmtPad
              portHints={[`pin${pad.pin}`]}
              pcbX={compactMspm0X(pad.x)}
              pcbY={compactMspm0Y(pad.y)}
              width={pad.width}
              height={pad.height}
              shape="rect"
            />
          </Fragment>
        ))}
        <silkscreenpath
          route={[
            { x: -2.7, y: 2 },
            { x: 2.7, y: 2 },
            { x: 2.7, y: -2 },
            { x: -2.7, y: -2 },
            { x: -2.7, y: 2 },
          ]}
        />
        <silkscreencircle
          pcbX={compactMspm0X(-3.15)}
          pcbY={compactMspm0Y(1.5)}
          radius={0.25}
        />
        <courtyardrect
          pcbX={compactMspm0X(0)}
          pcbY={compactMspm0Y(0)}
          width={5.8}
          height={4.4}
        />
      </footprint>
    }
    // BNO055 and BNO085 share the same 5.2 x 3.8 mm LGA body envelope.
    // This mechanically accurate package model is a visual fallback for BNO085.
    cadModel={{
      objUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C93216.obj?uuid=52c0611456944fcd8f3e784a5fb52235",
      stepUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C93216.step?uuid=52c0611456944fcd8f3e784a5fb52235",
      pcbRotationOffset: 90,
      modelOriginPosition: { x: 0, y: 0, z: 0 },
    }}
    {...props}
  />
);

const SensorCrystal = ({ name, pcbX, schX }: any) => (
  <crystal
    {...sensorSection}
    name={name}
    manufacturerPartNumber="FC-135 32.7680KA-A3"
    frequency="32.768kHz"
    loadCapacitance="12.5pF"
    pinVariant="two_pin"
    footprint={
      <footprint>
        <smtpad
          portHints={["pin1"]}
          pcbX={compactMspm0X(-1.1)}
          pcbY={compactMspm0Y(0)}
          width="1.4mm"
          height="1.2mm"
          shape="rect"
        />
        <smtpad
          portHints={["pin2"]}
          pcbX={compactMspm0X(1.1)}
          pcbY={compactMspm0Y(0)}
          width="1.4mm"
          height="1.2mm"
          shape="rect"
        />
        <silkscreenpath
          route={[
            { x: -1.6, y: -0.75 },
            { x: 1.6, y: -0.75 },
            { x: 1.6, y: 0.75 },
            { x: -1.6, y: 0.75 },
            { x: -1.6, y: -0.75 },
          ]}
        />
        <courtyardoutline
          outline={[
            { x: -2.05, y: -1 },
            { x: 2.05, y: -1 },
            { x: 2.05, y: 1 },
            { x: -2.05, y: 1 },
            { x: -2.05, y: -1 },
          ]}
        />
      </footprint>
    }
    pcbX={pcbX}
    pcbY={compactMspm0Y(6)}
    pcbRotation={0}
    schX={schX}
    schY={-5}
  />
);

const Bno085Circuit = () => (
  <>
    <BNO085
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(25)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={9.22}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_CAP"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(29)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={12}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDDIO"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(33)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={15}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_XIN"
      capacitance="22pF"
      footprint="0402"
      pcbX={compactMspm0X(35)}
      pcbY={compactMspm0Y(10)}
      pcbRotation={90}
      schX={15}
      schY={-8}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_XOUT"
      capacitance="22pF"
      footprint="0402"
      pcbX={compactMspm0X(41)}
      pcbY={compactMspm0Y(10)}
      pcbRotation={90}
      schX={19}
      schY={-8}
    />
    <SensorCrystal name="Y_SENSOR" pcbX={compactMspm0X(37.5)} schX={16.5} />
    <resistor
      {...sensorSection}
      name="R_SENSOR_RESET"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(20)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={24}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_BOOT"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(26)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={28}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_CS"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(32)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={32}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(38)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={36}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_HUB_SCL"
      resistance="2.2k"
      footprint="0402"
      pcbX={compactMspm0X(37)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={20.13}
      schY={7}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_HUB_SDA"
      resistance="2.2k"
      footprint="0402"
      pcbX={compactMspm0X(41)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={24.87}
      schY={7}
    />

    <trace from={port("U_SENSOR", "VDD")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "VDDIO")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "GND")} to="net.GND" />
    <trace from={port("U_SENSOR", "GNDIO")} to="net.GND" />
    <trace from={port("U_SENSOR", "SDA_MISO_TX")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL_SCLK_RX")} to="net.SENSOR_SCL" />
    <trace from={port("U_SENSOR", "INT_N")} to="net.SENSOR_INT" />
    <trace from={port("U_SENSOR", "RESET_N")} to="net.SENSOR_RESET" />
    <trace from={port("U_SENSOR", "BOOT_N")} to="net.SENSOR_BOOT" />
    <trace from={port("U_SENSOR", "CS_N")} to="net.SENSOR_CS" />
    <trace from={port("U_SENSOR", "SA0_MOSI")} to="net.SENSOR_ADDR0" />
    <trace from={port("U_SENSOR", "PS0_WAKE")} to="net.GND" />
    <trace from={port("U_SENSOR", "PS1")} to="net.GND" />
    <trace from={port("U_SENSOR", "CLKSEL0")} to="net.GND" />
    <trace from={port("U_SENSOR", "CAP")} to=".C_SENSOR_CAP > .pin1" />
    <trace from=".C_SENSOR_CAP > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDDIO > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDDIO > .pin2" to="net.GND" />
    <trace
      from={port("U_SENSOR", "SENSOR_HUB_SCL")}
      to=".R_SENSOR_HUB_SCL > .pin1"
    />
    <trace from=".R_SENSOR_HUB_SCL > .pin2" to="net.VCC_3V3" />
    <trace
      from={port("U_SENSOR", "SENSOR_HUB_SDA")}
      to=".R_SENSOR_HUB_SDA > .pin1"
    />
    <trace from=".R_SENSOR_HUB_SDA > .pin2" to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "XIN32")} to="net.SENSOR_XIN" />
    <trace from={port("U_SENSOR", "CLKSEL1_XOUT32")} to="net.SENSOR_XOUT" />
    <trace from=".Y_SENSOR > .pin1" to="net.SENSOR_XIN" />
    <trace from=".Y_SENSOR > .pin2" to="net.SENSOR_XOUT" />
    <trace from=".C_SENSOR_XIN > .pin1" to="net.SENSOR_XIN" />
    <trace from=".C_SENSOR_XIN > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_XOUT > .pin1" to="net.SENSOR_XOUT" />
    <trace from=".C_SENSOR_XOUT > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_RESET > .pin1" to="net.SENSOR_RESET" />
    <trace from=".R_SENSOR_RESET > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_BOOT > .pin1" to="net.SENSOR_BOOT" />
    <trace from=".R_SENSOR_BOOT > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_CS > .pin1" to="net.SENSOR_CS" />
    <trace from=".R_SENSOR_CS > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_ADDR > .pin1" to="net.SENSOR_ADDR0" />
    <trace from=".R_SENSOR_ADDR > .pin2" to="net.GND" />
  </>
);

const Mcp9808Circuit = () => (
  <>
    <MCP9808T_E_MS
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={10}
      schY={6}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ALERT"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={9.79}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR0"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={13.21}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR1"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(34)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={16}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR2"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(37)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={19}
      schY={-5}
    />
    <trace from={port("U_SENSOR", "VDD")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "GND")} to="net.GND" />
    <trace from={port("U_SENSOR", "SDA")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.SENSOR_SCL" />
    <trace from={port("U_SENSOR", "Alert")} to="net.SENSOR_INT" />
    <trace from={port("U_SENSOR", "A0")} to="net.SENSOR_ADDR0" />
    <trace from={port("U_SENSOR", "A1")} to="net.SENSOR_ADDR1" />
    <trace from={port("U_SENSOR", "A2")} to="net.SENSOR_ADDR2" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_ALERT > .pin1" to="net.SENSOR_INT" />
    <trace from=".R_SENSOR_ALERT > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_ADDR0 > .pin1" to="net.SENSOR_ADDR0" />
    <trace from=".R_SENSOR_ADDR0 > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_ADDR1 > .pin1" to="net.SENSOR_ADDR1" />
    <trace from=".R_SENSOR_ADDR1 > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_ADDR2 > .pin1" to="net.SENSOR_ADDR2" />
    <trace from=".R_SENSOR_ADDR2 > .pin2" to="net.GND" />
  </>
);

const Bno055Circuit = () => (
  <>
    <BNO055
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    {/* Isolate the two fine-pitch supply escapes before they join the shared 3.3 V plane. */}
    <resistor
      {...sensorSection}
      name="R_SENSOR_VDD_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(26)}
      pcbY={compactMspm0Y(3.25)}
      pcbRotation={0}
      schX={5}
      schY={5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_VDDIO_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(30.25)}
      pcbY={compactMspm0Y(7.2)}
      pcbRotation={90}
      schX={18.49}
      schY={7}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_GND5_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(31.75)}
      pcbY={compactMspm0Y(7.2)}
      pcbRotation={90}
      schX={22.51}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(25)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={9.22}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_CAP"
      capacitance="1uF"
      footprint="0402"
      pcbX={compactMspm0X(29)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={12}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDDIO"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(33)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={15}
      schY={7}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_XIN"
      capacitance="22pF"
      footprint="0402"
      pcbX={compactMspm0X(35)}
      pcbY={compactMspm0Y(10)}
      pcbRotation={90}
      schX={15}
      schY={-8}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_XOUT"
      capacitance="22pF"
      footprint="0402"
      pcbX={compactMspm0X(41)}
      pcbY={compactMspm0Y(10)}
      pcbRotation={90}
      schX={19}
      schY={-8}
    />
    <SensorCrystal name="Y_SENSOR" pcbX={compactMspm0X(37.5)} schX={16.5} />
    <resistor
      {...sensorSection}
      name="R_SENSOR_RESET"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(22)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={24}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_BOOT"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(28)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={28}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR"
      resistance="4.7k"
      footprint="0402"
      pcbX={compactMspm0X(34)}
      pcbY={compactMspm0Y(13)}
      pcbRotation={0}
      schX={32}
      schY={-5}
    />
    <trace from={port("U_SENSOR", "VDD")} to="net.BNO055_VDD_LOCAL" />
    <trace from=".R_SENSOR_VDD_LINK > .pin2" to="net.BNO055_VDD_LOCAL" />
    <trace from=".R_SENSOR_VDD_LINK > .pin1" to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "VDDIO")} to="net.BNO055_VDDIO_LOCAL" />
    <trace from=".R_SENSOR_VDDIO_LINK > .pin1" to="net.BNO055_VDDIO_LOCAL" />
    <trace from=".R_SENSOR_VDDIO_LINK > .pin2" to="net.VCC_3V3" />
    {["GND1", "GND_I2C"].map((pinName) => (
      <trace key={pinName} from={port("U_SENSOR", pinName)} to="net.GND" />
    ))}
    <trace from={port("U_SENSOR", "GND5")} to="net.BNO055_GND5_LOCAL" />
    <trace from=".R_SENSOR_GND5_LINK > .pin1" to="net.BNO055_GND5_LOCAL" />
    <trace from=".R_SENSOR_GND5_LINK > .pin2" to="net.GND" />
    <trace from={port("U_SENSOR", "SDA")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.SENSOR_SCL" />
    <trace from={port("U_SENSOR", "INT")} to="net.SENSOR_INT" />
    <trace from={port("U_SENSOR", "RESET_N")} to="net.SENSOR_RESET" />
    <trace from={port("U_SENSOR", "BOOT_N")} to="net.SENSOR_BOOT" />
    <trace from={port("U_SENSOR", "I2C_ADDR")} to="net.SENSOR_ADDR0" />
    <trace from={port("U_SENSOR", "PS0")} to="net.GND" />
    <trace from={port("U_SENSOR", "PS1")} to="net.GND" />
    <trace from={port("U_SENSOR", "CAP")} to=".C_SENSOR_CAP > .pin1" />
    <trace from=".C_SENSOR_CAP > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDDIO > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDDIO > .pin2" to="net.GND" />
    <trace from={port("U_SENSOR", "XIN32")} to="net.SENSOR_XIN" />
    <trace from={port("U_SENSOR", "XOUT32")} to="net.SENSOR_XOUT" />
    <trace from=".Y_SENSOR > .pin1" to="net.SENSOR_XIN" />
    <trace from=".Y_SENSOR > .pin2" to="net.SENSOR_XOUT" />
    <trace from=".C_SENSOR_XIN > .pin1" to="net.SENSOR_XIN" />
    <trace from=".C_SENSOR_XIN > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_XOUT > .pin1" to="net.SENSOR_XOUT" />
    <trace from=".C_SENSOR_XOUT > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_RESET > .pin1" to="net.SENSOR_RESET" />
    <trace from=".R_SENSOR_RESET > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_BOOT > .pin1" to="net.SENSOR_BOOT" />
    <trace from=".R_SENSOR_BOOT > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_ADDR > .pin1" to="net.SENSOR_ADDR0" />
    <trace from=".R_SENSOR_ADDR > .pin2" to="net.GND" />
  </>
);

const Sht4xCircuit = ({ sensor }: { sensor: "sht41" | "sht45" }) => {
  const Sensor = sensor === "sht41" ? SHT41_AD1B_R2 : SHT45_AD1B_R2;
  return (
    <>
      <Sensor
        {...sensorSection}
        name="U_SENSOR"
        pcbX={compactMspm0X(31)}
        pcbY={compactMspm0Y(2)}
        pcbRotation={0}
        schX={13}
        schY={1}
      />
      <keepout
        shape="rect"
        width="1.7mm"
        height="1.7mm"
        pcbX={compactMspm0X(31)}
        pcbY={compactMspm0Y(2)}
        layers={["top", "bottom"]}
        excludeRefs={[".U_SENSOR"]}
      />
      <resistor
        {...sensorSection}
        name="R_SENSOR_SDA_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(27)}
        pcbY={compactMspm0Y(3.5)}
        pcbRotation={0}
        schX={20}
        schY={3}
      />
      <resistor
        {...sensorSection}
        name="R_SENSOR_SCL_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(27)}
        pcbY={compactMspm0Y(0.5)}
        pcbRotation={0}
        schX={20}
        schY={-1}
      />
      <resistor
        {...sensorSection}
        name="R_SENSOR_VDD_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(35)}
        pcbY={compactMspm0Y(0.5)}
        pcbRotation={0}
        schX={5}
        schY={6}
      />
      <resistor
        {...sensorSection}
        name="R_SENSOR_GND_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(35)}
        pcbY={compactMspm0Y(3.5)}
        pcbRotation={0}
        schX={5}
        schY={-4}
      />
      <VerticalCapacitor
        {...sensorSection}
        name="C_SENSOR_VDD"
        capacitance="100nF"
        footprint="0402"
        pcbX={compactMspm0X(27)}
        pcbY={compactMspm0Y(-3)}
        pcbRotation={0}
        schX={10}
        schY={6}
      />
      <trace from={port("U_SENSOR", "VDD")} to="net.SHT_VDD_LOCAL" />
      <trace from=".R_SENSOR_VDD_LINK > .pin1" to="net.SHT_VDD_LOCAL" />
      <trace from=".R_SENSOR_VDD_LINK > .pin2" to="net.VCC_3V3" />
      <trace from={port("U_SENSOR", "VSS")} to="net.SHT_GND_LOCAL" />
      <trace from=".R_SENSOR_GND_LINK > .pin1" to="net.SHT_GND_LOCAL" />
      <trace from=".R_SENSOR_GND_LINK > .pin2" to="net.GND" />
      <trace from={port("U_SENSOR", "SDA")} to="net.SHT_SDA_LOCAL" />
      <trace from=".R_SENSOR_SDA_LINK > .pin2" to="net.SHT_SDA_LOCAL" />
      <trace from=".R_SENSOR_SDA_LINK > .pin1" to="net.SENSOR_SDA" />
      <trace from={port("U_SENSOR", "SCL")} to="net.SHT_SCL_LOCAL" />
      <trace from=".R_SENSOR_SCL_LINK > .pin2" to="net.SHT_SCL_LOCAL" />
      <trace from=".R_SENSOR_SCL_LINK > .pin1" to="net.SENSOR_SCL" />
      <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
      <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    </>
  );
};

const Lis3dhCircuit = () => (
  <>
    <LIS3DHTR
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={10}
      schY={6}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_BULK"
      capacitance="10uF"
      footprint="0805"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={13}
      schY={6}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_CS"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={10}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR"
      resistance="2.2k"
      footprint="0402"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={13}
      schY={-5}
    />
    <trace from={port("U_SENSOR", "VDD")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "VDD_IO")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "GND1")} to="net.GND" />
    <trace from={port("U_SENSOR", "GND2")} to="net.GND" />
    <trace from={port("U_SENSOR", "GND3")} to="net.GND" />
    <trace from={port("U_SENSOR", "SDA")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.SENSOR_SCL" />
    <trace from={port("U_SENSOR", "INT1")} to="net.SENSOR_INT" />
    <trace from={port("U_SENSOR", "CS")} to="net.SENSOR_CS" />
    <trace from={port("U_SENSOR", "SA0")} to="net.SENSOR_ADDR0" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_BULK > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_BULK > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_CS > .pin1" to="net.SENSOR_CS" />
    <trace from=".R_SENSOR_CS > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_ADDR > .pin1" to="net.SENSOR_ADDR0" />
    <trace from=".R_SENSOR_ADDR > .pin2" to="net.GND" />
  </>
);

const Lsm6dsoxCircuit = () => (
  <>
    <LSM6DSOXTR
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={10}
      schY={6}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_BULK"
      capacitance="1uF"
      footprint="0603"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={13}
      schY={6}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDDIO"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(35)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={16}
      schY={6}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_CS"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={9.79}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_ADDR"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={-90}
      schX={13.21}
      schY={-5}
    />
    <trace from={port("U_SENSOR", "VDD")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "VDDIO")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "GND1")} to="net.GND" />
    <trace from={port("U_SENSOR", "GND2")} to="net.GND" />
    <trace from={port("U_SENSOR", "SDX")} to="net.GND" />
    <trace from={port("U_SENSOR", "SCX")} to="net.GND" />
    <trace from={port("U_SENSOR", "SDA")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.SENSOR_SCL" />
    <trace from={port("U_SENSOR", "INT1")} to="net.SENSOR_INT" />
    <trace from={port("U_SENSOR", "CS")} to="net.SENSOR_CS" />
    <trace from={port("U_SENSOR", "SA0")} to="net.SENSOR_ADDR0" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_BULK > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_BULK > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDDIO > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDDIO > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_CS > .pin1" to="net.SENSOR_CS" />
    <trace from=".R_SENSOR_CS > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_ADDR > .pin1" to="net.SENSOR_ADDR0" />
    <trace from=".R_SENSOR_ADDR > .pin2" to="net.GND" />
  </>
);

const Aht20Circuit = () => (
  <>
    <AHT20
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <keepout
      shape="rect"
      width="3.2mm"
      height="3.2mm"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      layers={["bottom"]}
      excludeRefs={[".U_SENSOR"]}
    />
    {/* Local links give each tightly spaced DFN pad a short outward escape before joining shared board nets. */}
    <resistor
      {...sensorSection}
      name="R_SENSOR_VDD_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(35)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={8}
      schY={6}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_GND_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={8}
      schY={-4}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_SDA_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(5)}
      pcbRotation={0}
      schX={17}
      schY={3}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_SCL_LINK"
      resistance="0"
      footprint="0402"
      pcbX={compactMspm0X(35)}
      pcbY={compactMspm0Y(5)}
      pcbRotation={0}
      schX={17}
      schY={-1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(8)}
      pcbRotation={180}
      schX={11}
      schY={6}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_BULK"
      capacitance="10uF"
      footprint="0805"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(12)}
      pcbRotation={180}
      schX={14}
      schY={6}
    />
    <trace from={port("U_SENSOR", "VDD")} to="net.AHT_VDD_LOCAL" />
    <trace from=".R_SENSOR_VDD_LINK > .pin1" to="net.AHT_VDD_LOCAL" />
    <trace from=".R_SENSOR_VDD_LINK > .pin2" to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "GND")} to="net.AHT_GND_LOCAL" />
    <trace from=".R_SENSOR_GND_LINK > .pin2" to="net.AHT_GND_LOCAL" />
    <trace from=".R_SENSOR_GND_LINK > .pin1" to="net.GND" />
    <trace from={port("U_SENSOR", "SDA")} to="net.AHT_SDA_LOCAL" />
    <trace from=".R_SENSOR_SDA_LINK > .pin2" to="net.AHT_SDA_LOCAL" />
    <trace from=".R_SENSOR_SDA_LINK > .pin1" to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.AHT_SCL_LOCAL" />
    <trace from=".R_SENSOR_SCL_LINK > .pin1" to="net.AHT_SCL_LOCAL" />
    <trace from=".R_SENSOR_SCL_LINK > .pin2" to="net.SENSOR_SCL" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_BULK > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_BULK > .pin2" to="net.GND" />
  </>
);

const Vl53l4cdCircuit = () => (
  <>
    <VL53L4CDV0DH_1
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={10}
      schY={6}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_BULK"
      capacitance="4.7uF"
      footprint="0805"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={13}
      schY={6}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_RESET"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={10}
      schY={-5}
    />
    <resistor
      {...sensorSection}
      name="R_SENSOR_INT"
      resistance="10k"
      footprint="0402"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(7)}
      pcbRotation={0}
      schX={13}
      schY={-5}
    />
    <trace from={port("U_SENSOR", "AVDDVCSEL")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "AVDD")} to="net.VCC_3V3" />
    {["AVSSVCSEL", "GND", "GND2", "GND3", "GND4"].map((pinName) => (
      <trace key={pinName} from={port("U_SENSOR", pinName)} to="net.GND" />
    ))}
    <trace from={port("U_SENSOR", "SDA")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.SENSOR_SCL" />
    <trace from={port("U_SENSOR", "GPIO1")} to="net.SENSOR_INT" />
    <trace from={port("U_SENSOR", "XSHUT")} to="net.SENSOR_RESET" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_BULK > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_BULK > .pin2" to="net.GND" />
    <trace from=".R_SENSOR_RESET > .pin1" to="net.SENSOR_RESET" />
    <trace from=".R_SENSOR_RESET > .pin2" to="net.VCC_3V3" />
    <trace from=".R_SENSOR_INT > .pin1" to="net.SENSOR_INT" />
    <trace from=".R_SENSOR_INT > .pin2" to="net.VCC_3V3" />
  </>
);

const Veml7700Circuit = () => (
  <>
    <VEML7700_TR
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactMspm0X(31)}
      pcbY={compactMspm0Y(2)}
      pcbRotation={0}
      schX={13}
      schY={1}
    />
    <VerticalCapacitor
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactMspm0X(27)}
      pcbY={compactMspm0Y(-3)}
      pcbRotation={0}
      schX={10}
      schY={6}
    />
    <trace from={port("U_SENSOR", "VDD")} to="net.VCC_3V3" />
    <trace from={port("U_SENSOR", "GND")} to="net.GND" />
    <trace from={port("U_SENSOR", "SDA")} to="net.SENSOR_SDA" />
    <trace from={port("U_SENSOR", "SCL")} to="net.SENSOR_SCL" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
  </>
);

const SensorCircuit = ({ sensor }: Mspm0SensorBoardProps) => {
  switch (sensor) {
    case "bno085":
      return <Bno085Circuit />;
    case "mcp9808":
      return <Mcp9808Circuit />;
    case "bno055":
      return <Bno055Circuit />;
    case "sht45":
      return <Sht4xCircuit sensor="sht45" />;
    case "sht41":
      return <Sht4xCircuit sensor="sht41" />;
    case "lis3dh":
      return <Lis3dhCircuit />;
    case "lsm6dsox":
      return <Lsm6dsoxCircuit />;
    case "aht20":
      return <Aht20Circuit />;
    case "vl53l4cd":
      return <Vl53l4cdCircuit />;
    case "veml7700":
      return <Veml7700Circuit />;
  }
};

export const Mspm0SensorBoard = ({
  sensor: sensorId,
  controller = "mspm0g3507",
}: Mspm0SensorBoardProps) => {
  const sensor = mspm0Sensors[sensorId];
  const isNativeUsbMspm0 = controller !== "mspm0g3507";
  const isMspm0g5187 = controller === "mspm0g5187";
  const controllerName = isMspm0g5187
    ? "MSPM0G5187"
    : isNativeUsbMspm0
      ? "MSPM0G5117"
      : "MSPM0G3507";
  const controllerMpn = `${controllerName}SPMR`;
  const NativeUsbMspm0 = isMspm0g5187 ? MSPM0G5187SPMR : MSPM0G5117SPMR;
  const mspm0Pins = isNativeUsbMspm0 ? mspm0UsbLqfp64Pins : mspm0g3507Pins;
  const sensorNeedsCopperKeepout =
    sensorId === "sht41" || sensorId === "sht45" || sensorId === "aht20";
  const boardWidth = 68;
  const boardHeight = 40;
  const bottomPourOutline = sensorNeedsCopperKeepout
    ? [
        { x: -(boardWidth / 2 - 0.3), y: -(boardHeight / 2 - 0.3) },
        { x: boardWidth / 2 - 0.3, y: -(boardHeight / 2 - 0.3) },
        { x: boardWidth / 2 - 0.3, y: 0 },
        { x: compactMspm0X(28.8), y: 0 },
        { x: compactMspm0X(28.8), y: 4 },
        { x: boardWidth / 2 - 0.3, y: 4 },
        { x: boardWidth / 2 - 0.3, y: boardHeight / 2 - 0.3 },
        { x: -(boardWidth / 2 - 0.3), y: boardHeight / 2 - 0.3 },
      ]
    : undefined;

  return (
    <board
      name={`usb-c_${controller}_${sensorId}`}
      width={boardWidth}
      height={boardHeight}
      layers={2}
      solderMaskColor="red"
      schSheetName="Main"
    >
      <schematicsheet
        name="Main"
        displayName={`USB-C + ${controllerName} + ${sensor.sensorPartNumber}`}
        sheetIndex={0}
      />
      <schematicsection
        name="Interface"
        displayName="USB-C, ESD & 3.3 V Power"
      />
      <schematicsection
        name="Control"
        displayName={
          isNativeUsbMspm0
            ? `${controllerName} Native USB Controller`
            : "MSPM0G3507 + CH340N USB-UART"
        }
      />
      <schematicsection
        name="Sensor"
        displayName={`${sensor.sensorPartNumber} I²C Sensor`}
      />

      <SmdUsbC
        {...interfaceSection}
        name="J_USB"
        pcbX={compactMspm0X(-41)}
        pcbY={compactMspm0Y(0)}
        pcbRotation={-90}
        schX={-17}
        schY={5}
      />
      <chip
        {...interfaceSection}
        name="U_ESD"
        manufacturerPartNumber="USBLC6-2SC6"
        supplierPartNumbers={{ jlcpcb: ["C7519"] }}
        footprint="sot23_6"
        pinLabels={usbEsdPins}
        pcbX={isNativeUsbMspm0 ? compactMspm0X(-32) : -22}
        pcbY={compactMspm0Y(1)}
        pcbRotation={0}
        schX={-12}
        schY={5.2}
      />
      <TLV75533PDBVR
        {...interfaceSection}
        name="U_LDO"
        pcbX={compactMspm0X(-34)}
        pcbY={compactMspm0Y(-9)}
        pcbRotation={90}
        schX={-12}
        schY={-4}
        schWidth={1.675}
        schHeight={2.1}
      />
      <resistor
        {...interfaceSection}
        name="R_CC1"
        resistance="5.1k"
        footprint="0402"
        pcbX={compactMspm0X(-36)}
        pcbY={compactMspm0Y(11)}
        pcbRotation={0}
        schX={-15}
        schY={9}
      />
      <resistor
        {...interfaceSection}
        name="R_CC2"
        resistance="5.1k"
        footprint="0402"
        pcbX={compactMspm0X(-32)}
        pcbY={compactMspm0Y(11)}
        pcbRotation={0}
        schX={-12}
        schY={9}
      />
      {/* Fan both adjacent connector VBUS pairs inboard before joining the 5 V rail. */}
      <resistor
        {...interfaceSection}
        name="R_USB_VBUS_TOP_LINK"
        resistance="0"
        footprint="0603"
        pcbX={compactMspm0X(-36.5)}
        pcbY={compactMspm0Y(isNativeUsbMspm0 ? 4.5 : 5)}
        pcbRotation={0}
        schX={-18}
        schY={1}
      />
      <resistor
        {...interfaceSection}
        name="R_USB_VBUS_BOTTOM_LINK"
        resistance="0"
        footprint="0603"
        pcbX={compactMspm0X(-36.5)}
        pcbY={compactMspm0Y(isNativeUsbMspm0 ? -2.6 : -5)}
        pcbRotation={0}
        schX={-14}
        schY={1}
      />
      <VerticalCapacitor
        {...interfaceSection}
        name="C_LDO_IN"
        capacitance="1uF"
        footprint="0603"
        pcbX={compactMspm0X(-38)}
        pcbY={compactMspm0Y(-12)}
        pcbRotation={0}
        schX={-14}
        schY={-7}
      />
      <VerticalCapacitor
        {...interfaceSection}
        name="C_LDO_OUT"
        capacitance="1uF"
        footprint="0603"
        pcbX={isNativeUsbMspm0 ? compactMspm0X(-34) : -18.5}
        pcbY={isNativeUsbMspm0 ? compactMspm0Y(-13.5) : -12.5}
        pcbRotation={isNativeUsbMspm0 ? 90 : 0}
        schX={-10.24}
        schY={-7}
      />
      <VerticalCapacitor
        {...interfaceSection}
        name="C_3V3_BULK"
        capacitance="10uF"
        footprint="0805"
        pcbX={isNativeUsbMspm0 ? compactMspm0X(-21) : -14.5}
        pcbY={isNativeUsbMspm0 ? compactMspm0Y(-12) : -12.5}
        pcbRotation={isNativeUsbMspm0 ? 180 : 0}
        schX={-7}
        schY={-7}
      />

      {!isNativeUsbMspm0 && (
        <CH340N
          {...controlSection}
          name="U_USB_UART"
          pcbX={-14}
          pcbY={compactMspm0Y(3)}
          pcbRotation={0}
          schX={-7}
          schY={3}
        />
      )}
      <resistor
        {...controlSection}
        name="R_USB_DP_LINK"
        resistance="0"
        footprint="0402"
        pcbX={isNativeUsbMspm0 ? compactMspm0X(-28.5) : -18.5}
        pcbY={isNativeUsbMspm0 ? compactMspm0Y(2) : 2.5}
        pcbRotation={0}
        schX={-10.83}
        schY={1}
      />
      <resistor
        {...controlSection}
        name="R_USB_DM_LINK"
        resistance="0"
        footprint="0402"
        pcbX={isNativeUsbMspm0 ? compactMspm0X(-28.5) : -18.5}
        pcbY={compactMspm0Y(0)}
        pcbRotation={0}
        schX={-6.93}
        schY={1}
      />
      {!isNativeUsbMspm0 && (
        <>
          <VerticalCapacitor
            {...controlSection}
            name="C_USB_UART_VCC"
            capacitance="100nF"
            footprint="0402"
            pcbX={-12.5}
            pcbY={8.5}
            pcbRotation={0}
            schX={-8}
            schY={7}
          />
          <VerticalCapacitor
            {...controlSection}
            name="C_USB_UART_V33"
            capacitance="100nF"
            footprint="0402"
            pcbX={-16}
            pcbY={8.5}
            pcbRotation={0}
            schX={-5}
            schY={7}
          />
        </>
      )}

      {isNativeUsbMspm0 ? (
        <NativeUsbMspm0
          {...controlSection}
          name="U_MAIN"
          pcbX={compactMspm0X(-4)}
          pcbY={compactMspm0Y(1)}
          pcbRotation={0}
          schX={1}
          schY={1}
          schHeight={2.4}
        />
      ) : (
        <MSPM0G3507SPMR
          {...controlSection}
          name="U_MAIN"
          supplierPartNumbers={{ jlcpcb: ["C22389960"] }}
          footprint="lqfp64_w10_h10_p0.5mm"
          cadModel={{ glbUrl: "./src/models/mspm0g3507spmr.glb" }}
          pcbX={compactMspm0X(-4)}
          pcbY={compactMspm0Y(1)}
          pcbRotation={0}
          schX={1}
          schY={1}
          schHeight={3.5}
        />
      )}
      {isNativeUsbMspm0 && (
        <VerticalCapacitor
          {...controlSection}
          name="C_MCU_VUSB"
          capacitance="100nF"
          footprint="0402"
          pcbX={compactMspm0X(-5)}
          pcbY={compactMspm0Y(-8)}
          pcbRotation={0}
          schX={-4}
          schY={7}
        />
      )}
      <VerticalCapacitor
        {...controlSection}
        name="C_MCU_VDD"
        capacitance="100nF"
        footprint="0402"
        pcbX={compactMspm0X(4)}
        pcbY={compactMspm0Y(0.5)}
        pcbRotation={0}
        schX={-1}
        schY={7}
      />
      <VerticalCapacitor
        {...controlSection}
        name="C_MCU_BULK"
        capacitance="10uF"
        footprint="0805"
        pcbX={compactMspm0X(7)}
        pcbY={compactMspm0Y(0.5)}
        pcbRotation={0}
        schX={2}
        schY={7}
      />
      <VerticalCapacitor
        {...controlSection}
        name="C_MCU_VCORE"
        capacitance="470nF"
        footprint="0603"
        pcbX={compactMspm0X(0)}
        pcbY={compactMspm0Y(-7)}
        pcbRotation={0}
        schX={5.33}
        schY={7}
      />
      <resistor
        {...controlSection}
        name="R_MCU_ROSC"
        manufacturerPartNumber="PTFR0402B100KP9"
        supplierPartNumbers={{ jlcpcb: ["C478863"] }}
        resistance="100k"
        tolerance="0.1%"
        footprint="0402"
        pcbX={compactMspm0X(4)}
        pcbY={compactMspm0Y(3)}
        pcbRotation={0}
        schX={7.79}
        schY={7}
      />
      <resistor
        {...controlSection}
        name="R_MCU_RESET"
        resistance="47k"
        footprint="0402"
        pcbX={compactMspm0X(4)}
        pcbY={compactMspm0Y(-1.5)}
        pcbRotation={0}
        schX={2}
        schY={9}
      />
      <VerticalCapacitor
        {...controlSection}
        name="C_MCU_RESET"
        capacitance="10nF"
        footprint="0402"
        pcbX={compactMspm0X(7)}
        pcbY={compactMspm0Y(-1.5)}
        pcbRotation={0}
        schX={4.68}
        schY={9}
      />
      <resistor
        {...controlSection}
        name="R_SWD_GND_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(2)}
        pcbY={compactMspm0Y(-20)}
        pcbRotation={0}
        schX={6}
        schY={-9}
      />

      <resistor
        {...sensorSection}
        name="R_I2C_SDA"
        resistance="4.7k"
        footprint="0402"
        pcbX={compactMspm0X(14)}
        pcbY={compactMspm0Y(9)}
        pcbRotation={isNativeUsbMspm0 ? 180 : 0}
        schX={8}
        schY={9}
      />
      <resistor
        {...sensorSection}
        name="R_I2C_SCL"
        resistance="4.7k"
        footprint="0402"
        pcbX={compactMspm0X(18)}
        pcbY={compactMspm0Y(9)}
        pcbRotation={isNativeUsbMspm0 ? 180 : 0}
        schX={11}
        schY={9}
      />
      {/* Series links fan adjacent MCU I2C pads outward before they join the shared bus. */}
      <resistor
        {...sensorSection}
        name="R_MCU_I2C_SDA_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(-2)}
        pcbY={compactMspm0Y(9)}
        pcbRotation={90}
        schX={22}
        schY={10}
      />
      <resistor
        {...sensorSection}
        name="R_MCU_I2C_SCL_LINK"
        resistance="0"
        footprint="0402"
        pcbX={compactMspm0X(0)}
        pcbY={compactMspm0Y(9)}
        pcbRotation={90}
        schX={25}
        schY={10}
      />
      <SensorCircuit sensor={sensorId} />

      <pinheader
        {...controlSection}
        name="J_SWD"
        pinCount={10}
        pitch="1.27mm"
        doubleRow
        holeDiameter="0.65mm"
        platedDiameter="1mm"
        gender="unpopulated"
        doNotPlace
        pinLabels={[
          "VTREF",
          "SWDIO",
          "GND1",
          "SWCLK",
          "GND2",
          "SWO_NC",
          "KEY_NC",
          "TDI_NC",
          "GND_DETECT",
          "RESET",
        ]}
        pcbPinLabels={{
          pin1: "3V3",
          pin2: "DIO",
          pin3: "G",
          pin4: "CLK",
          pin5: "G",
          pin6: "-",
          pin7: "KEY",
          pin8: "-",
          pin9: "G",
          pin10: "RST",
        }}
        showSilkscreenPinLabels
        pcbX={compactMspm0X(-4)}
        pcbY={compactMspm0Y(-20)}
        pcbOrientation="horizontal"
        schX={1}
        schY={-9}
        schWidth={1.15}
      />
      <pinheader
        {...sensorSection}
        name="J_SENSOR_IO"
        pinCount={8}
        pitch="2.54mm"
        gender="unpopulated"
        doNotPlace
        pinLabels={[
          "VCC",
          "GND",
          "SDA",
          "SCL",
          "INT",
          "RESET",
          "ADDR0",
          "ADDR1",
        ]}
        pcbPinLabels={{
          pin1: "3V3",
          pin2: "G",
          pin3: "SDA",
          pin4: "SCL",
          pin5: "INT",
          pin6: "RST",
          pin7: "A0",
          pin8: "A1",
        }}
        showSilkscreenPinLabels
        pcbX={compactMspm0X(25)}
        pcbY={compactMspm0Y(-20)}
        pcbOrientation="horizontal"
        schX={13}
        schY={-9}
        schWidth={0.675}
      />

      <testpoint
        {...controlSection}
        name="TP_RESET"
        footprintVariant="pad"
        padDiameter="1.5mm"
        pcbX={compactMspm0X(-10)}
        pcbY={compactMspm0Y(-12)}
        schX={4}
        schY={-7}
      />

      <hole
        name="H1"
        diameter="2.4mm"
        pcbX={compactMspm0X(-43)}
        pcbY={compactMspm0Y(27)}
      />
      <hole
        name="H2"
        diameter="2.4mm"
        pcbX={compactMspm0X(40)}
        pcbY={compactMspm0Y(27)}
      />
      <hole
        name="H3"
        diameter="2.4mm"
        pcbX={compactMspm0X(-43)}
        pcbY={compactMspm0Y(-27)}
      />
      <hole
        name="H4"
        diameter="2.4mm"
        pcbX={compactMspm0X(40)}
        pcbY={compactMspm0Y(-27)}
      />

      {[3, 4].map((pin) => (
        <trace
          key={`usb-vbus-top-${pin}`}
          from={p("J_USB", pin)}
          to="net.USB_VBUS_TOP_LOCAL"
          thickness="0.5mm"
        />
      ))}
      <trace
        from=".R_USB_VBUS_TOP_LINK > .pin1"
        to="net.USB_VBUS_TOP_LOCAL"
        thickness="0.5mm"
      />
      <trace
        from=".R_USB_VBUS_TOP_LINK > .pin2"
        to="net.VBUS5"
        thickness="0.5mm"
      />
      {[13, 14].map((pin) => (
        <trace
          key={`usb-vbus-bottom-${pin}`}
          from={p("J_USB", pin)}
          to="net.USB_VBUS_BOTTOM_LOCAL"
          thickness="0.5mm"
        />
      ))}
      <trace
        from=".R_USB_VBUS_BOTTOM_LINK > .pin1"
        to="net.USB_VBUS_BOTTOM_LOCAL"
        thickness="0.5mm"
      />
      <trace
        from=".R_USB_VBUS_BOTTOM_LINK > .pin2"
        to="net.VBUS5"
        thickness="0.5mm"
      />
      {[1, 2, 15, 16, 17, 18, 19, 20].map((pin) => (
        <trace
          key={`usb-gnd-${pin}`}
          from={p("J_USB", pin)}
          to="net.GND"
          thickness="0.5mm"
        />
      ))}
      <trace from={p("J_USB", 6)} to="net.USB_CC1" />
      <trace from=".R_CC1 > .pin1" to="net.USB_CC1" />
      <trace from=".R_CC1 > .pin2" to="net.GND" />
      <trace from={p("J_USB", 12)} to="net.USB_CC2" />
      <trace from=".R_CC2 > .pin1" to="net.USB_CC2" />
      <trace from=".R_CC2 > .pin2" to="net.GND" />
      {/*
        The reversible connector's D+/D- pads are interleaved. Route each
        same-signal tie on the bottom layer so neither tie crosses the other
        signal's top-side pad escape.
      */}
      <trace
        name="usb-dp-port-tie"
        from={p("J_USB", 8)}
        to={p("J_USB", 10)}
        thickness="0.15mm"
        maxViaCount={2}
        pcbPathRelativeTo={p("J_USB", 8)}
        pcbPath={[
          { x: -0.249936, y: 4.4 },
          {
            x: -0.249936,
            y: 4.4,
            via: true,
            fromLayer: "top",
            toLayer: "bottom",
          },
          { x: -0.249936, y: 4.4 },
          { x: 0.750062, y: 4.4 },
          {
            x: 0.750062,
            y: 4.4,
            via: true,
            fromLayer: "bottom",
            toLayer: "top",
          },
          { x: 0.750062, y: 4.4 },
        ]}
      />
      <trace
        name="usb-dm-port-tie"
        from={p("J_USB", 7)}
        to={p("J_USB", 9)}
        thickness="0.15mm"
        maxViaCount={2}
        pcbPathRelativeTo={p("J_USB", 7)}
        pcbPath={[
          { x: -0.750062, y: 3.45 },
          {
            x: -0.750062,
            y: 3.45,
            via: true,
            fromLayer: "top",
            toLayer: "bottom",
          },
          { x: -0.750062, y: 3.45 },
          { x: 0.249936, y: 3.45 },
          {
            x: 0.249936,
            y: 3.45,
            via: true,
            fromLayer: "bottom",
            toLayer: "top",
          },
          { x: 0.249936, y: 3.45 },
        ]}
      />
      <trace
        name="usb-dp-port"
        from={p("J_USB", 10)}
        to={p("U_ESD", 1)}
        thickness="0.25mm"
        maxViaCount={1}
      />
      <trace
        name="usb-dm-port"
        from={p("J_USB", 9)}
        to={p("U_ESD", 3)}
        thickness="0.25mm"
        maxViaCount={1}
      />
      {/* Equal 1.71 mm top-layer fan-outs join the ESD array to the data links. */}
      <trace
        name="usb-dp-device"
        from={p("U_ESD", 6)}
        to=".R_USB_DP_LINK > .pin1"
        thickness="0.25mm"
        maxViaCount={0}
        pcbStraightLine
      />
      <trace
        name="usb-dm-device"
        from={p("U_ESD", 4)}
        to=".R_USB_DM_LINK > .pin1"
        thickness="0.25mm"
        maxViaCount={0}
        pcbStraightLine
      />
      {isNativeUsbMspm0 ? (
        <>
          <trace
            name="usb-dp-mcu"
            from=".R_USB_DP_LINK > .pin2"
            to={p("U_MAIN", mspm0UsbLqfp64Pins.usbDp)}
            thickness="0.25mm"
          />
          <trace
            name="usb-dm-mcu"
            from=".R_USB_DM_LINK > .pin2"
            to={p("U_MAIN", mspm0UsbLqfp64Pins.usbDm)}
            thickness="0.25mm"
          />
        </>
      ) : (
        <>
          {/* The CH340N changes the pair from vertical to horizontal pad ordering. */}
          <trace
            name="usb-dp-uart"
            from=".R_USB_DP_LINK > .pin2"
            to={port("U_USB_UART", "UD_POS")}
            thickness="0.25mm"
            maxViaCount={0}
            pcbPathRelativeTo=".R_USB_DP_LINK > .pin2"
            pcbPath={[
              { x: 1.15, y: 0 },
              { x: 1.15, y: 0.87 },
              { x: 2, y: 0.87 },
              { x: 2, y: -0.45 },
            ]}
          />
          <trace
            name="usb-dm-uart"
            from=".R_USB_DM_LINK > .pin2"
            to={port("U_USB_UART", "UD_NEG")}
            thickness="0.25mm"
            maxViaCount={0}
            pcbPathRelativeTo=".R_USB_DM_LINK > .pin2"
            pcbPath={[
              { x: 2.05, y: -1.15 },
              { x: 3.865, y: -1.15 },
            ]}
          />
        </>
      )}
      <trace from={p("U_ESD", 5)} to="net.VBUS5" />
      {/* Place the ESD return directly into the bottom ground plane beside pin 2. */}
      <via
        name="V_ESD_GND_RETURN"
        pcbX={compactMspm0X(-34.2)}
        pcbY={compactMspm0Y(1)}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter="0.2mm"
        outerDiameter="0.5mm"
        connectsTo="net.GND"
      />
      <trace
        name="esd-ground-stub"
        from={p("U_ESD", 2)}
        to=".V_ESD_GND_RETURN > .pin1"
        thickness="0.4mm"
        maxViaCount={0}
        pcbStraightLine
      />

      <trace from={port("U_LDO", "IN")} to="net.VBUS5" thickness="0.4mm" />
      <trace from={port("U_LDO", "EN")} to="net.VBUS5" />
      <trace from={port("U_LDO", "GND")} to="net.GND" />
      <trace from={port("U_LDO", "OUT")} to="net.VCC_3V3" thickness="0.4mm" />
      <trace from=".C_LDO_IN > .pin1" to="net.VBUS5" />
      <trace from=".C_LDO_IN > .pin2" to="net.GND" />
      <trace from=".C_LDO_OUT > .pin1" to="net.VCC_3V3" />
      <trace from=".C_LDO_OUT > .pin2" to="net.GND" />
      <trace from=".C_3V3_BULK > .pin1" to="net.VCC_3V3" />
      <trace from=".C_3V3_BULK > .pin2" to="net.GND" />

      {isNativeUsbMspm0 ? (
        <>
          <trace from={p("U_MAIN", mspm0UsbLqfp64Pins.vusb)} to="net.VCC_3V3" />
          <trace from=".C_MCU_VUSB > .pin1" to="net.VCC_3V3" />
          <trace from=".C_MCU_VUSB > .pin2" to="net.GND" />
        </>
      ) : (
        <>
          <trace
            from={port("U_USB_UART", "VCC")}
            to="net.VCC_3V3"
            thickness="0.35mm"
          />
          <trace
            from={port("U_USB_UART", "GND")}
            to="net.GND"
            thickness="0.35mm"
          />
          <trace from={port("U_USB_UART", "V3")} to="net.VCC_3V3" />
          <trace from=".C_USB_UART_VCC > .pin1" to="net.VCC_3V3" />
          <trace from=".C_USB_UART_VCC > .pin2" to="net.GND" />
          <trace from=".C_USB_UART_V33 > .pin1" to="net.VCC_3V3" />
          <trace from=".C_USB_UART_V33 > .pin2" to="net.GND" />
          <trace from={port("U_USB_UART", "RXD")} to="net.UART_MSP_TX" />
          <trace from={port("U_USB_UART", "TXD")} to="net.UART_MSP_RX" />
        </>
      )}

      <trace
        from={p("U_MAIN", mspm0Pins.vdd)}
        to="net.VCC_3V3"
        thickness="0.35mm"
      />
      <trace
        from={p("U_MAIN", mspm0Pins.vss)}
        to="net.GND"
        thickness="0.35mm"
      />
      <trace from=".C_MCU_VDD > .pin1" to="net.VCC_3V3" />
      <trace from=".C_MCU_VDD > .pin2" to="net.GND" />
      <trace from=".C_MCU_BULK > .pin1" to="net.VCC_3V3" />
      <trace from=".C_MCU_BULK > .pin2" to="net.GND" />
      <trace from={p("U_MAIN", mspm0Pins.vcore)} to="net.MSPM0_VCORE" />
      <trace from=".C_MCU_VCORE > .pin1" to="net.MSPM0_VCORE" />
      <trace from=".C_MCU_VCORE > .pin2" to="net.GND" />
      <trace from={p("U_MAIN", mspm0Pins.rosc)} to=".R_MCU_ROSC > .pin1" />
      <trace from=".R_MCU_ROSC > .pin2" to="net.GND" />
      <trace from={p("U_MAIN", mspm0Pins.reset)} to="net.MAIN_RESET" />
      <trace from=".R_MCU_RESET > .pin1" to="net.MAIN_RESET" />
      <trace from=".R_MCU_RESET > .pin2" to="net.VCC_3V3" />
      <trace from=".C_MCU_RESET > .pin1" to="net.MAIN_RESET" />
      <trace from=".C_MCU_RESET > .pin2" to="net.GND" />
      {!isNativeUsbMspm0 && (
        <>
          <trace
            from={p("U_MAIN", mspm0g3507Pins.uartTx)}
            to="net.UART_MSP_TX"
          />
          <trace
            from={p("U_MAIN", mspm0g3507Pins.uartRx)}
            to="net.UART_MSP_RX"
          />
        </>
      )}
      <trace
        from={p("U_MAIN", mspm0Pins.i2cSda)}
        to="net.MCU_I2C_SDA_LOCAL"
        thickness="0.15mm"
      />
      <trace
        from=".R_MCU_I2C_SDA_LINK > .pin1"
        to="net.MCU_I2C_SDA_LOCAL"
        thickness="0.15mm"
      />
      <trace
        from=".R_MCU_I2C_SDA_LINK > .pin2"
        to="net.SENSOR_SDA"
        thickness="0.15mm"
      />
      <trace
        from={p("U_MAIN", mspm0Pins.i2cScl)}
        to="net.MCU_I2C_SCL_LOCAL"
        thickness="0.15mm"
      />
      <trace
        from=".R_MCU_I2C_SCL_LINK > .pin1"
        to="net.MCU_I2C_SCL_LOCAL"
        thickness="0.15mm"
      />
      <trace
        from=".R_MCU_I2C_SCL_LINK > .pin2"
        to="net.SENSOR_SCL"
        thickness="0.15mm"
      />
      <trace
        from={p("U_MAIN", mspm0Pins.sensorInterrupt)}
        to="net.SENSOR_INT"
      />
      <trace from={p("U_MAIN", mspm0Pins.sensorReset)} to="net.SENSOR_RESET" />
      <trace from=".R_I2C_SDA > .pin1" to="net.SENSOR_SDA" />
      <trace from=".R_I2C_SDA > .pin2" to="net.VCC_3V3" />
      <trace from=".R_I2C_SCL > .pin1" to="net.SENSOR_SCL" />
      <trace from=".R_I2C_SCL > .pin2" to="net.VCC_3V3" />

      <trace from={p("J_SWD", 1)} to="net.VCC_3V3" />
      <trace from={p("J_SWD", 2)} to={p("U_MAIN", mspm0Pins.swdio)} />
      <trace name="swd-ground-1-to-2" from={p("J_SWD", 3)} to={p("J_SWD", 5)} />
      <trace from={p("J_SWD", 4)} to={p("U_MAIN", mspm0Pins.swclk)} />
      <trace
        name="swd-ground-2-to-detect"
        from={p("J_SWD", 5)}
        to={p("J_SWD", 9)}
      />
      <trace
        name="swd-ground-detect-to-link"
        from={p("J_SWD", 9)}
        to=".R_SWD_GND_LINK > .pin1"
      />
      <trace from=".R_SWD_GND_LINK > .pin2" to="net.GND" />
      <trace from={p("J_SWD", 10)} to="net.MAIN_RESET" />
      <trace from={p("J_SENSOR_IO", 1)} to="net.VCC_3V3" />
      <trace from={p("J_SENSOR_IO", 2)} to="net.GND" />
      <trace from={p("J_SENSOR_IO", 3)} to="net.SENSOR_SDA" />
      <trace from={p("J_SENSOR_IO", 4)} to="net.SENSOR_SCL" />
      <trace from={p("J_SENSOR_IO", 5)} to="net.SENSOR_INT" />
      <trace from={p("J_SENSOR_IO", 6)} to="net.SENSOR_RESET" />
      <trace from={p("J_SENSOR_IO", 7)} to="net.SENSOR_ADDR0" />
      <trace from={p("J_SENSOR_IO", 8)} to="net.SENSOR_ADDR1" />
      <trace from=".TP_RESET > .pin1" to="net.MAIN_RESET" />

      <copperpour
        name="BOTTOM_GND_POUR"
        layer="bottom"
        connectsTo="net.GND"
        padMargin="0.25mm"
        traceMargin="0.2mm"
        boardEdgeMargin="0.3mm"
        outline={bottomPourOutline}
        useThermalReliefs
      />
      <silkscreentext
        text="QUICK CONFIGURE • SENSOR BOARD"
        pcbX={compactMspm0X(5)}
        pcbY={compactMspm0Y(28)}
        fontSize="0.65mm"
      />
      <silkscreentext
        text={
          isNativeUsbMspm0
            ? `${controllerMpn} • NATIVE USB`
            : "MSPM0G3507SPMR + CH340N"
        }
        pcbX={compactMspm0X(-11)}
        pcbY={compactMspm0Y(25.5)}
        fontSize="0.52mm"
      />
      <silkscreentext
        text={sensor.sensorPartNumber}
        pcbX={compactMspm0X(30)}
        pcbY={compactMspm0Y(25.5)}
        fontSize="0.55mm"
      />
      <silkscreentext
        text={`I2C ${sensor.defaultI2cAddress} • ${isNativeUsbMspm0 ? "USB-C FS" : "USB-C UART"}`}
        pcbX={compactMspm0X(27)}
        pcbY={compactMspm0Y(-28)}
        fontSize="0.5mm"
      />
      <silkscreentext
        text="3V3 • SWD • 2L"
        pcbX={compactMspm0X(-28)}
        pcbY={compactMspm0Y(-28)}
        fontSize="0.48mm"
      />
    </board>
  );
};
