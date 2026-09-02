import { Fragment } from "react";
import { BME280 } from "../imports/BME280/BME280";
import { MLX90640ESF_BAA_000_TU } from "../imports/MLX90640ESF_BAA_000_TU/MLX90640ESF_BAA_000_TU";
import { MPU_6050 } from "../imports/MPU_6050/MPU_6050";
import { MSPM0G5117SPMR, mspm0UsbLqfp64Pins } from "./MSPM0G5117SPMR";
import { MSPM0G5187SPMR } from "./MSPM0G5187SPMR";
import { mcus } from "./board-data";
import { sensors, type SensorId } from "./sensor-data";
import { SmdUsbC } from "./SmdUsbC";

export interface SensorBoardProps {
  sensor: SensorId;
  controller?: "msp430f5529" | "mspm0g5117" | "mspm0g5187";
}

const usbEsdPins = {
  pin1: "DP_PORT",
  pin2: "GND",
  pin3: "DM_PORT",
  pin4: "DM_MCU",
  pin5: "VBUS",
  pin6: "DP_MCU",
} as const;

const ldoPins = {
  pin1: "IN",
  pin2: "GND",
  pin3: "EN",
  pin4: "NC",
  pin5: "OUT",
} as const;

const f5529 = {
  vcore: 20,
  sensorInterrupt: 24,
  i2cSda: 37,
  i2cScl: 38,
  uartTx: 40,
  uartRx: 41,
  usbDp: 62,
  usbPullup: 63,
  usbDm: 64,
  usbVbus: 65,
  usbVusb: 66,
  v18: 67,
  xt2In: 69,
  xt2Out: 70,
  test: 71,
  reset: 76,
} as const;

const p = (component: string, pin: number) => `.${component} > .pin${pin}`;

const interfaceSection = { schSectionName: "Interface" } as const;
const controlSection = { schSectionName: "Control" } as const;
const sensorSection = { schSectionName: "Sensor" } as const;
const verticalCapacitor = { schOrientation: "vertical" } as const;

// Pull the interface and sensor zones toward the controller while leaving
// footprint-local coordinates untouched.
function compactSensorX(x: number) {
  if (x <= -20) return x + 8;
  if (x > 5) return x - 8;
  return x;
}

function compactSensorY(y: number) {
  if (Math.abs(y) <= 14) return y;
  return Math.sign(y) * (14 + (Math.abs(y) - 14) * 0.1);
}

const Bme280Circuit = () => (
  <>
    <BME280
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactSensorX(30)}
      pcbY={compactSensorY(0)}
      pcbRotation={0}
      schX={12}
      schY={1}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactSensorX(26)}
      pcbY={compactSensorY(-5)}
      schX={9}
      schY={6}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_VDDIO"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactSensorX(32)}
      pcbY={compactSensorY(-5)}
      schX={12}
      schY={6}
    />

    <trace from=".U_SENSOR > .pin1" to="net.GND" />
    <trace from=".U_SENSOR > .pin7" to="net.GND" />
    <trace from=".U_SENSOR > .pin8" to="net.VCC_3V3" />
    <trace from=".U_SENSOR > .pin6" to="net.VCC_3V3" />
    <trace from=".U_SENSOR > .pin2" to="net.VCC_3V3" />
    <trace from=".U_SENSOR > .pin5" to="net.GND" />
    <trace from=".U_SENSOR > .pin3" to="net.SENSOR_SDA" />
    <trace from=".U_SENSOR > .pin4" to="net.SENSOR_SCL" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDDIO > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDDIO > .pin2" to="net.GND" />
  </>
);

const Mpu6050Circuit = () => (
  <>
    <MPU_6050
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactSensorX(30)}
      pcbY={compactSensorY(0)}
      pcbRotation={0}
      schX={12}
      schY={1}
      schHeight={2.6}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactSensorX(24)}
      pcbY={compactSensorY(-5)}
      schX={8}
      schY={6}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_VLOGIC"
      capacitance="10nF"
      footprint="0402"
      pcbX={compactSensorX(27)}
      pcbY={compactSensorY(-7)}
      schX={11}
      schY={6}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_REGOUT"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactSensorX(32)}
      pcbY={compactSensorY(-7)}
      schX={11}
      schY={-5}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_CPOUT"
      capacitance="2.2nF"
      footprint="0402"
      pcbX={compactSensorX(35)}
      pcbY={compactSensorY(4.5)}
      schX={14}
      schY={-5}
    />

    <trace from=".U_SENSOR > .pin13" to="net.VCC_3V3" />
    <trace from=".U_SENSOR > .pin8" to="net.VCC_3V3" />
    <trace from=".U_SENSOR > .pin18" to="net.GND" />
    <trace from=".U_SENSOR > .pin25" to="net.GND" thickness="0.35mm" />
    <trace from=".U_SENSOR > .pin1" to="net.GND" />
    <trace from=".U_SENSOR > .pin11" to="net.GND" />
    <trace from=".U_SENSOR > .pin9" to="net.GND" />
    <trace from=".U_SENSOR > .pin24" to="net.SENSOR_SDA" />
    <trace from=".U_SENSOR > .pin23" to="net.SENSOR_SCL" />
    <trace from=".U_SENSOR > .pin12" to="net.SENSOR_INT" />
    <trace from=".U_SENSOR > .pin10" to="net.SENSOR_REGOUT" />
    <trace from=".C_SENSOR_REGOUT > .pin1" to="net.SENSOR_REGOUT" />
    <trace from=".C_SENSOR_REGOUT > .pin2" to="net.GND" />
    <trace from=".U_SENSOR > .pin20" to="net.SENSOR_CPOUT" />
    <trace from=".C_SENSOR_CPOUT > .pin1" to="net.SENSOR_CPOUT" />
    <trace from=".C_SENSOR_CPOUT > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_VLOGIC > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VLOGIC > .pin2" to="net.GND" />
  </>
);

const Mlx90640Circuit = () => (
  <>
    <MLX90640ESF_BAA_000_TU
      {...sensorSection}
      name="U_SENSOR"
      pcbX={compactSensorX(30)}
      pcbY={compactSensorY(0)}
      pcbRotation={0}
      schX={12}
      schY={1}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={compactSensorX(30)}
      pcbY={compactSensorY(-8)}
      schX={10}
      schY={6}
    />
    <capacitor
      {...verticalCapacitor}
      {...sensorSection}
      name="C_SENSOR_BULK"
      capacitance="10uF"
      footprint="1206"
      pcbX={compactSensorX(35)}
      pcbY={compactSensorY(-8)}
      schX={14}
      schY={6}
    />

    <trace from=".U_SENSOR > .pin2" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".U_SENSOR > .pin3" to="net.GND" thickness="0.35mm" />
    <trace from=".U_SENSOR > .pin1" to="net.SENSOR_SDA" />
    <trace from=".U_SENSOR > .pin4" to="net.SENSOR_SCL" />
    <trace from=".C_SENSOR_VDD > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_VDD > .pin2" to="net.GND" />
    <trace from=".C_SENSOR_BULK > .pin1" to="net.VCC_3V3" />
    <trace from=".C_SENSOR_BULK > .pin2" to="net.GND" />
  </>
);

export const SensorBoard = ({
  sensor: sensorId,
  controller = "msp430f5529",
}: SensorBoardProps) => {
  const sensor = sensors[sensorId];
  const mcu = mcus.msp430f5529;
  const isNativeUsbMspm0 = controller !== "msp430f5529";
  const isMspm0g5187 = controller === "mspm0g5187";
  const controllerLabel = isMspm0g5187
    ? "MSPM0G5187"
    : isNativeUsbMspm0
      ? "MSPM0G5117"
      : "MSP430F5529";
  const NativeUsbMspm0 = isMspm0g5187 ? MSPM0G5187SPMR : MSPM0G5117SPMR;
  const controllerPins = isNativeUsbMspm0 ? mspm0UsbLqfp64Pins : f5529;
  const i2cPullupResistance = sensorId === "mlx90640" ? "1k" : "4.7k";
  const boardWidth = 64;
  const boardHeight = 33;
  const boardTitle = `USB-C + ${controllerLabel} + ${sensor.manufacturerPartNumber}`;

  return (
    <board
      name={`usb-c_${controller}_${sensorId}`}
      width={boardWidth}
      height={boardHeight}
      layers={2}
      solderMaskColor="red"
      schSheetName="Main"
    >
      <schematicsheet name="Main" displayName={boardTitle} sheetIndex={0} />
      <schematicsection name="Interface" displayName="USB-C & Power" />
      <schematicsection
        name="Control"
        displayName={`${controllerLabel} Controller`}
      />
      <schematicsection
        name="Sensor"
        displayName={`${sensor.manufacturerPartNumber} ${sensor.interface} Sensor`}
      />

      <SmdUsbC
        {...interfaceSection}
        name="J_USB"
        pcbX={compactSensorX(-36)}
        pcbY={compactSensorY(0)}
        pcbRotation={-90}
        schX={-16}
        schY={5}
        schHeight={1.4}
      />
      <chip
        {...interfaceSection}
        name="U_ESD"
        manufacturerPartNumber="USBLC6-2SC6"
        supplierPartNumbers={{ jlcpcb: ["C7519"] }}
        footprint="kicad:Package_TO_SOT_SMD/SOT-23-6"
        pinLabels={usbEsdPins}
        pcbX={compactSensorX(-29)}
        pcbY={compactSensorY(0)}
        pcbRotation={0}
        schX={-11}
        schY={5.2}
      />
      <chip
        {...interfaceSection}
        name="U_LDO"
        manufacturerPartNumber="TLV75533PDBVR"
        footprint="kicad:Package_TO_SOT_SMD/SOT-23-5"
        pinLabels={ldoPins}
        pcbX={compactSensorX(-28)}
        pcbY={compactSensorY(-8)}
        pcbRotation={90}
        schX={-11}
        schY={-4}
        schHeight={0.6}
      />
      <resistor
        {...interfaceSection}
        name="R_USB_DP"
        resistance={isNativeUsbMspm0 ? "0" : "27"}
        footprint="0402"
        pcbX={compactSensorX(-3.8)}
        pcbY={compactSensorY(9)}
        pcbRotation={-90}
        schX={-7}
        schY={5}
      />
      <resistor
        {...interfaceSection}
        name="R_USB_DM"
        resistance={isNativeUsbMspm0 ? "0" : "27"}
        footprint="0402"
        pcbX={compactSensorX(-5)}
        pcbY={compactSensorY(9)}
        pcbRotation={-90}
        schX={-7}
        schY={3}
      />
      <resistor
        {...interfaceSection}
        name="R_CC1"
        resistance="5.1k"
        footprint="0402"
        pcbX={compactSensorX(-31)}
        pcbY={compactSensorY(12)}
        schX={-14}
        schY={8}
      />
      <resistor
        {...interfaceSection}
        name="R_CC2"
        resistance="5.1k"
        footprint="0402"
        pcbX={compactSensorX(-27)}
        pcbY={compactSensorY(12)}
        schX={-12}
        schY={8}
      />
      <capacitor
        {...verticalCapacitor}
        {...interfaceSection}
        name="C_LDO_IN"
        capacitance="1uF"
        footprint="0603"
        pcbX={compactSensorX(-32)}
        pcbY={compactSensorY(-11)}
        schX={-13}
        schY={-7}
      />
      <capacitor
        {...verticalCapacitor}
        {...interfaceSection}
        name="C_LDO_OUT"
        capacitance="1uF"
        footprint="0603"
        pcbX={compactSensorX(-24)}
        pcbY={compactSensorY(-11)}
        schX={-9}
        schY={-7}
      />
      <capacitor
        {...verticalCapacitor}
        {...interfaceSection}
        name="C_3V3_BULK"
        capacitance="4.7uF"
        footprint="0805"
        pcbX={compactSensorX(-20)}
        pcbY={compactSensorY(-11)}
        schX={-7}
        schY={-7}
      />

      {isNativeUsbMspm0 ? (
        <NativeUsbMspm0
          {...controlSection}
          name="U_MAIN"
          pcbX={compactSensorX(-9)}
          pcbY={compactSensorY(0)}
          pcbRotation={0}
          schX={0}
          schY={1}
        />
      ) : (
        <chip
          {...controlSection}
          name="U_MAIN"
          manufacturerPartNumber={mcu.manufacturerPartNumber}
          supplierPartNumbers={mcu.supplierPartNumbers}
          footprint={mcu.footprint}
          pinLabels={mcu.pinLabels}
          pcbX={compactSensorX(-9)}
          pcbY={compactSensorY(0)}
          pcbRotation={0}
          schX={0}
          schY={1}
        />
      )}
      {isNativeUsbMspm0 ? (
        <>
          <capacitor
            {...verticalCapacitor}
            {...controlSection}
            name="C_MCU_VDD"
            capacitance="100nF"
            footprint="0402"
            pcbX={compactSensorX(0)}
            pcbY={compactSensorY(-0.25)}
            pcbRotation={0}
            schX={-4}
            schY={7}
          />
          <capacitor
            {...verticalCapacitor}
            {...controlSection}
            name="C_MCU_BULK"
            capacitance="10uF"
            footprint="0805"
            pcbX={compactSensorX(-18)}
            pcbY={compactSensorY(-3.75)}
            pcbRotation={180}
            schX={-1}
            schY={7}
          />
        </>
      ) : (
        <>
          <capacitor
            {...verticalCapacitor}
            {...controlSection}
            name="C_MCU_DVCC1"
            capacitance="100nF"
            footprint="0402"
            pcbX={compactSensorX(-18)}
            pcbY={compactSensorY(-3.75)}
            pcbRotation={180}
            schX={-4}
            schY={7}
          />
          <capacitor
            {...verticalCapacitor}
            {...controlSection}
            name="C_MCU_DVCC2"
            capacitance="100nF"
            footprint="0402"
            pcbX={compactSensorX(0)}
            pcbY={compactSensorY(-0.25)}
            pcbRotation={0}
            schX={-2}
            schY={7}
          />
          <capacitor
            {...verticalCapacitor}
            {...controlSection}
            name="C_MCU_AVCC"
            capacitance="1uF"
            footprint="0603"
            pcbX={compactSensorX(-19)}
            pcbY={compactSensorY(10.5)}
            pcbRotation={180}
            schX={0}
            schY={7}
          />
        </>
      )}
      <capacitor
        {...verticalCapacitor}
        {...controlSection}
        name="C_VCORE"
        capacitance="470nF"
        footprint="0603"
        pcbX={compactSensorX(isNativeUsbMspm0 ? -3.5 : -4)}
        pcbY={compactSensorY(isNativeUsbMspm0 ? -10.5 : -11)}
        pcbRotation={isNativeUsbMspm0 ? -90 : 0}
        schX={1.9}
        schY={7}
      />
      <capacitor
        {...verticalCapacitor}
        {...controlSection}
        name="C_VBUS"
        capacitance="4.7uF"
        footprint="0805"
        pcbX={compactSensorX(-3.5)}
        pcbY={compactSensorY(12.5)}
        pcbRotation={90}
        schX={2.93}
        schY={8}
      />
      {!isNativeUsbMspm0 && (
        <capacitor
          {...verticalCapacitor}
          {...controlSection}
          name="C_V18"
          capacitance="220nF"
          footprint="0603"
          pcbX={compactSensorX(-10.3)}
          pcbY={compactSensorY(12.75)}
          pcbRotation={90}
          schX={4.33}
          schY={8}
        />
      )}
      <capacitor
        {...verticalCapacitor}
        {...controlSection}
        name="C_VUSB"
        capacitance={isNativeUsbMspm0 ? "100nF" : "220nF"}
        footprint="0603"
        pcbX={compactSensorX(isNativeUsbMspm0 ? -8.5 : -8)}
        pcbY={compactSensorY(isNativeUsbMspm0 ? -10.5 : 12.75)}
        pcbRotation={isNativeUsbMspm0 ? -90 : 90}
        schX={6}
        schY={8}
      />
      {!isNativeUsbMspm0 && (
        <resistor
          {...controlSection}
          name="R_USB_PULLUP"
          resistance="1.4k"
          footprint="0402"
          pcbX={compactSensorX(-1)}
          pcbY={compactSensorY(9.5)}
          pcbRotation={0}
          schX={-3}
          schY={9}
        />
      )}
      <resistor
        {...controlSection}
        name="R_MCU_RESET"
        resistance="47k"
        footprint="0402"
        pcbX={compactSensorX(-13)}
        pcbY={compactSensorY(9)}
        pcbRotation={0}
        schX={1.37}
        schY={9}
      />
      <capacitor
        {...verticalCapacitor}
        {...controlSection}
        name="C_MCU_RESET"
        capacitance={isNativeUsbMspm0 ? "10nF" : "2.2nF"}
        footprint="0402"
        pcbX={compactSensorX(-15.25)}
        pcbY={compactSensorY(9)}
        pcbRotation={0}
        schX={3.5}
        schY={9}
      />
      {isNativeUsbMspm0 ? (
        <resistor
          {...controlSection}
          name="R_MCU_ROSC"
          manufacturerPartNumber="PTFR0402B100KP9"
          supplierPartNumbers={{ jlcpcb: ["C478863"] }}
          resistance="100k"
          tolerance="0.1%"
          footprint="0402"
          pcbX={compactSensorX(-8.5)}
          pcbY={compactSensorY(9.5)}
          schX={-1}
          schY={-5}
        />
      ) : (
        <resonator
          {...controlSection}
          name="Y_XT2"
          manufacturerPartNumber="CSTNR4M00GH5L000R0"
          supplierPartNumbers={{ jlcpcb: ["C341526"] }}
          frequency="4MHz"
          loadCapacitance="39pF"
          pinVariant="ground_pin"
          footprint={
            <footprint>
              <smtpad
                portHints={["1"]}
                pcbX={compactSensorX(0)}
                pcbY={compactSensorY(-1.5)}
                width={2.6}
                height={0.4}
                shape="rect"
              />
              <smtpad
                portHints={["2"]}
                pcbX={compactSensorX(0)}
                pcbY={compactSensorY(0)}
                width={2.6}
                height={0.4}
                shape="rect"
              />
              <smtpad
                portHints={["3"]}
                pcbX={compactSensorX(0)}
                pcbY={compactSensorY(1.5)}
                width={2.6}
                height={0.4}
                shape="rect"
              />
              <silkscreenpath
                route={[
                  { x: -1.1, y: -2.35 },
                  { x: 1.1, y: -2.35 },
                ]}
              />
              <silkscreenpath
                route={[
                  { x: -1.1, y: 2.35 },
                  { x: 1.1, y: 2.35 },
                ]}
              />
              <courtyardrect
                pcbX={compactSensorX(0)}
                pcbY={compactSensorY(0)}
                width={2.8}
                height={4.9}
              />
            </footprint>
          }
          cadModel={null}
          pcbX={compactSensorX(-8.5)}
          pcbY={compactSensorY(9.5)}
          pcbRotation={90}
          schX={-1}
          schY={-5}
        />
      )}

      <resistor
        {...sensorSection}
        name="R_I2C_SDA"
        resistance={i2cPullupResistance}
        footprint="0402"
        pcbX={compactSensorX(12)}
        pcbY={compactSensorY(9)}
        pcbRotation={isNativeUsbMspm0 ? 180 : 0}
        schX={8}
        schY={9}
      />
      <resistor
        {...sensorSection}
        name="R_I2C_SCL"
        resistance={i2cPullupResistance}
        footprint="0402"
        pcbX={compactSensorX(15)}
        pcbY={compactSensorY(9)}
        pcbRotation={isNativeUsbMspm0 ? 180 : 0}
        schX={11}
        schY={9}
      />

      {sensorId === "bme280" && <Bme280Circuit />}
      {sensorId === "mpu6050" && <Mpu6050Circuit />}
      {sensorId === "mlx90640" && <Mlx90640Circuit />}

      <pinheader
        {...controlSection}
        name="J_DEBUG"
        pinCount={10}
        pitch="2.54mm"
        gender="unpopulated"
        doNotPlace
        pinLabels={
          isNativeUsbMspm0
            ? [
                "VTREF",
                "GND",
                "RESET",
                "SWDIO",
                "I2C_SDA",
                "I2C_SCL",
                "SENSOR_INT",
                "SWCLK",
                "GND_DETECT",
                "VBUS5",
              ]
            : [
                "VCC_3V3",
                "GND",
                "RESET",
                "TEST",
                "I2C_SDA",
                "I2C_SCL",
                "SENSOR_INT",
                "UART_TX",
                "UART_RX",
                "VBUS5",
              ]
        }
        pcbPinLabels={
          isNativeUsbMspm0
            ? {
                pin1: "3V3",
                pin2: "G",
                pin3: "RST",
                pin4: "DIO",
                pin5: "SDA",
                pin6: "SCL",
                pin7: "INT",
                pin8: "CLK",
                pin9: "G",
                pin10: "5V",
              }
            : {
                pin1: "3V3",
                pin2: "G",
                pin3: "RST",
                pin4: "TST",
                pin5: "SDA",
                pin6: "SCL",
                pin7: "INT",
                pin8: "TX",
                pin9: "RX",
                pin10: "5V",
              }
        }
        showSilkscreenPinLabels
        pcbX={compactSensorX(-6)}
        pcbY={compactSensorY(-18)}
        pcbOrientation="horizontal"
        schX={0}
        schY={-8}
        schWidth={1.15}
      />

      <testpoint
        {...sensorSection}
        name="TP_SDA"
        footprintVariant="pad"
        padDiameter="1.5mm"
        pcbX={compactSensorX(18)}
        pcbY={compactSensorY(-12)}
        schX={6}
        schY={-7}
      />
      <testpoint
        {...sensorSection}
        name="TP_SCL"
        footprintVariant="pad"
        padDiameter="1.5mm"
        pcbX={compactSensorX(22)}
        pcbY={compactSensorY(-12)}
        schX={9}
        schY={-7}
      />

      <hole
        name="H1"
        diameter="2.4mm"
        pcbX={compactSensorX(-38)}
        pcbY={compactSensorY(23)}
      />
      <hole
        name="H2"
        diameter="2.4mm"
        pcbX={compactSensorX(38)}
        pcbY={compactSensorY(23)}
      />
      <hole
        name="H3"
        diameter="2.4mm"
        pcbX={compactSensorX(-38)}
        pcbY={compactSensorY(-23)}
      />
      <hole
        name="H4"
        diameter="2.4mm"
        pcbX={compactSensorX(38)}
        pcbY={compactSensorY(-23)}
      />

      <differentialpair
        name="USB_PHY_PAIR"
        positiveConnection="usb-dp-phy"
        negativeConnection="usb-dm-phy"
        maxLengthSkew="0.2mm"
        targetDifferentialImpedance="90ohm"
        pcbTraceGap="0.15mm"
        maxUncoupledLength="3mm"
      />

      <trace from=".J_USB > .pin3" to="net.VBUS5" thickness="0.5mm" />
      <trace from=".J_USB > .pin4" to="net.VBUS5" thickness="0.5mm" />
      <trace from=".J_USB > .pin13" to="net.VBUS5" thickness="0.5mm" />
      <trace from=".J_USB > .pin14" to="net.VBUS5" thickness="0.5mm" />
      {[1, 2, 15, 16].map((pin) => (
        <trace
          key={`usb-gnd-${pin}`}
          from={p("J_USB", pin)}
          to="net.GND"
          thickness="0.5mm"
        />
      ))}
      {[17, 18, 19, 20].map((pin) => (
        <trace
          key={`usb-shield-${pin}`}
          from={p("J_USB", pin)}
          to="net.GND"
          thickness="0.5mm"
        />
      ))}
      <trace from=".J_USB > .pin6" to="net.USB_CC1" />
      <trace from=".R_CC1 > .pin1" to="net.USB_CC1" />
      <trace from=".R_CC1 > .pin2" to="net.GND" />
      <trace from=".J_USB > .pin12" to="net.USB_CC2" />
      <trace from=".R_CC2 > .pin1" to="net.USB_CC2" />
      <trace from=".R_CC2 > .pin2" to="net.GND" />
      <trace
        name="usb-dp-port"
        path={[".J_USB > .pin8", ".J_USB > .pin10", ".U_ESD > .pin1"]}
        thickness="0.25mm"
        maxViaCount={2}
      />
      <trace
        name="usb-dm-port"
        path={[".J_USB > .pin7", ".J_USB > .pin9", ".U_ESD > .pin3"]}
        thickness="0.25mm"
        maxViaCount={2}
      />
      <trace
        name="usb-dp-phy"
        from=".U_ESD > .pin6"
        to=".R_USB_DP > .pin1"
        thickness="0.25mm"
        maxViaCount={0}
      />
      <trace
        name="usb-dm-phy"
        from=".U_ESD > .pin4"
        to=".R_USB_DM > .pin1"
        thickness="0.25mm"
        maxViaCount={0}
      />
      <trace from=".U_ESD > .pin5" to="net.VBUS5" />
      <trace from=".U_ESD > .pin2" to="net.GND" />
      {isNativeUsbMspm0 ? (
        <trace
          name="usb-dp-mcu"
          from=".R_USB_DP > .pin2"
          to={p("U_MAIN", mspm0UsbLqfp64Pins.usbDp)}
          thickness="0.25mm"
        />
      ) : (
        <trace
          name="usb-dp-mcu"
          path={[
            ".R_USB_DP > .pin2",
            p("U_MAIN", f5529.usbDp),
            ".R_USB_PULLUP > .pin2",
          ]}
          thickness="0.25mm"
          maxViaCount={0}
        />
      )}
      <trace
        name="usb-dm-mcu"
        from=".R_USB_DM > .pin2"
        to={p(
          "U_MAIN",
          isNativeUsbMspm0 ? mspm0UsbLqfp64Pins.usbDm : f5529.usbDm,
        )}
        thickness="0.25mm"
        maxViaCount={isNativeUsbMspm0 ? undefined : 0}
      />
      <trace from=".C_VBUS > .pin1" to="net.VBUS5" />
      <trace from=".C_VBUS > .pin2" to="net.GND" />
      {!isNativeUsbMspm0 && (
        <>
          <trace from={p("U_MAIN", f5529.usbVbus)} to="net.VBUS5" />
          <trace from={p("U_MAIN", f5529.usbPullup)} to="net.MSP_USB_PUR" />
          <trace from=".R_USB_PULLUP > .pin1" to="net.MSP_USB_PUR" />
        </>
      )}

      <trace from=".U_LDO > .pin1" to="net.VBUS5" thickness="0.4mm" />
      <trace from=".U_LDO > .pin3" to="net.VBUS5" />
      <trace from=".U_LDO > .pin2" to="net.GND" />
      <trace from=".U_LDO > .pin5" to="net.VCC_3V3" thickness="0.4mm" />
      <trace from=".C_LDO_IN > .pin1" to="net.VBUS5" />
      <trace from=".C_LDO_IN > .pin2" to="net.GND" />
      <trace from=".C_LDO_OUT > .pin1" to="net.VCC_3V3" />
      <trace from=".C_LDO_OUT > .pin2" to="net.GND" />
      <trace from=".C_3V3_BULK > .pin1" to="net.VCC_3V3" />
      <trace from=".C_3V3_BULK > .pin2" to="net.GND" />

      {isNativeUsbMspm0 ? (
        <>
          <trace
            from={p("U_MAIN", mspm0UsbLqfp64Pins.vdd)}
            to="net.VCC_3V3"
            thickness="0.35mm"
          />
          <trace
            from={p("U_MAIN", mspm0UsbLqfp64Pins.vss)}
            to="net.GND"
            thickness="0.35mm"
          />
          <trace from=".C_MCU_VDD > .pin1" to="net.VCC_3V3" />
          <trace from=".C_MCU_VDD > .pin2" to="net.GND" />
          <trace from=".C_MCU_BULK > .pin1" to="net.VCC_3V3" />
          <trace from=".C_MCU_BULK > .pin2" to="net.GND" />
        </>
      ) : (
        <>
          {[
            { pin: 11, capacitor: "C_MCU_AVCC" },
            { pin: 18, capacitor: "C_MCU_DVCC1" },
            { pin: 50, capacitor: "C_MCU_DVCC2" },
          ].map(({ pin, capacitor }) => (
            <trace
              key={`mcu-vcc-${pin}`}
              from={p("U_MAIN", pin)}
              to={`.${capacitor} > .pin1`}
              thickness="0.35mm"
              maxViaCount={0}
            />
          ))}
          {mcu.gndPins.map((pin) => (
            <trace
              key={`mcu-gnd-${pin}`}
              from={p("U_MAIN", pin)}
              to="net.GND"
              thickness="0.35mm"
            />
          ))}
          {["C_MCU_DVCC1", "C_MCU_DVCC2", "C_MCU_AVCC"].map((component) => (
            <Fragment key={`${component}-rails`}>
              <trace from={`.${component} > .pin1`} to="net.VCC_3V3" />
              <trace from={`.${component} > .pin2`} to="net.GND" />
            </Fragment>
          ))}
        </>
      )}
      <trace from={p("U_MAIN", controllerPins.vcore)} to="net.MSP_VCORE" />
      <trace from=".C_VCORE > .pin1" to="net.MSP_VCORE" />
      <trace from=".C_VCORE > .pin2" to="net.GND" />
      {!isNativeUsbMspm0 && (
        <>
          <trace from={p("U_MAIN", f5529.v18)} to="net.MSP_V18" />
          <trace from=".C_V18 > .pin1" to="net.MSP_V18" />
          <trace from=".C_V18 > .pin2" to="net.GND" />
        </>
      )}
      <trace
        from={p(
          "U_MAIN",
          isNativeUsbMspm0 ? mspm0UsbLqfp64Pins.vusb : f5529.usbVusb,
        )}
        to={isNativeUsbMspm0 ? "net.VCC_3V3" : "net.MSP_VUSB"}
      />
      <trace
        from=".C_VUSB > .pin1"
        to={isNativeUsbMspm0 ? "net.VCC_3V3" : "net.MSP_VUSB"}
      />
      <trace from=".C_VUSB > .pin2" to="net.GND" />
      <trace from={p("U_MAIN", controllerPins.reset)} to="net.MAIN_RESET" />
      <trace from=".R_MCU_RESET > .pin1" to="net.MAIN_RESET" />
      <trace from=".R_MCU_RESET > .pin2" to="net.VCC_3V3" />
      <trace from=".C_MCU_RESET > .pin1" to="net.MAIN_RESET" />
      <trace from=".C_MCU_RESET > .pin2" to="net.GND" />
      {isNativeUsbMspm0 ? (
        <>
          <trace
            from={p("U_MAIN", mspm0UsbLqfp64Pins.rosc)}
            to=".R_MCU_ROSC > .pin1"
          />
          <trace from=".R_MCU_ROSC > .pin2" to="net.GND" />
        </>
      ) : (
        <>
          <trace from={p("U_MAIN", f5529.xt2In)} to="net.XT2_IN" />
          <trace from=".Y_XT2 > .pin1" to="net.XT2_IN" />
          <trace from=".Y_XT2 > .pin2" to="net.GND" />
          <trace from={p("U_MAIN", f5529.xt2Out)} to="net.XT2_OUT" />
          <trace from=".Y_XT2 > .pin3" to="net.XT2_OUT" />
        </>
      )}

      <trace
        from={p("U_MAIN", controllerPins.i2cSda)}
        to="net.SENSOR_SDA"
        thickness="0.12mm"
      />
      <trace
        from={p("U_MAIN", controllerPins.i2cScl)}
        to="net.SENSOR_SCL"
        thickness="0.12mm"
      />
      <trace from=".R_I2C_SDA > .pin1" to="net.SENSOR_SDA" />
      <trace from=".R_I2C_SDA > .pin2" to="net.VCC_3V3" />
      <trace from=".R_I2C_SCL > .pin1" to="net.SENSOR_SCL" />
      <trace from=".R_I2C_SCL > .pin2" to="net.VCC_3V3" />
      <trace
        from={p("U_MAIN", controllerPins.sensorInterrupt)}
        to="net.SENSOR_INT"
        thickness="0.12mm"
      />

      <trace from=".J_DEBUG > .pin1" to="net.VCC_3V3" />
      <trace from=".J_DEBUG > .pin2" to="net.GND" />
      <trace from=".J_DEBUG > .pin3" to="net.MAIN_RESET" />
      <trace
        from=".J_DEBUG > .pin4"
        to={p(
          "U_MAIN",
          isNativeUsbMspm0 ? mspm0UsbLqfp64Pins.swdio : f5529.test,
        )}
      />
      <trace from=".J_DEBUG > .pin5" to="net.SENSOR_SDA" />
      <trace from=".J_DEBUG > .pin6" to="net.SENSOR_SCL" />
      <trace from=".J_DEBUG > .pin7" to="net.SENSOR_INT" />
      <trace
        from=".J_DEBUG > .pin8"
        to={
          isNativeUsbMspm0
            ? p("U_MAIN", mspm0UsbLqfp64Pins.swclk)
            : p("U_MAIN", f5529.uartTx)
        }
      />
      <trace
        from=".J_DEBUG > .pin9"
        to={isNativeUsbMspm0 ? "net.GND" : p("U_MAIN", f5529.uartRx)}
      />
      <trace from=".J_DEBUG > .pin10" to="net.VBUS5" />
      <trace from=".TP_SDA > .pin1" to="net.SENSOR_SDA" />
      <trace from=".TP_SCL > .pin1" to="net.SENSOR_SCL" />

      <copperpour
        name="BOTTOM_GND_POUR"
        layer="bottom"
        connectsTo="net.GND"
        padMargin="0.25mm"
        traceMargin="0.2mm"
        boardEdgeMargin="0.3mm"
        useThermalReliefs
      />

      <silkscreentext
        text="QUICK CONFIGURE • SENSOR"
        pcbX={compactSensorX(0)}
        pcbY={compactSensorY(24)}
        fontSize="0.72mm"
      />
      <silkscreentext
        text={sensor.manufacturerPartNumber}
        pcbX={compactSensorX(22)}
        pcbY={compactSensorY(22.5)}
        fontSize="0.58mm"
      />
      <silkscreentext
        text={`I2C ${sensor.defaultI2cAddress} • USB-C`}
        pcbX={compactSensorX(19)}
        pcbY={compactSensorY(-24)}
        fontSize="0.55mm"
      />
      <silkscreentext
        text="2L • BOTTOM GND POUR"
        pcbX={compactSensorX(-19)}
        pcbY={compactSensorY(-24)}
        fontSize="0.48mm"
      />
    </board>
  );
};
