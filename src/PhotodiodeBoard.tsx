import { A_10118194_0001LF } from "../imports/A_10118194_0001LF/A_10118194_0001LF";
import { MSP430FR2433IRGER } from "../imports/MSP430FR2433IRGER/MSP430FR2433IRGER";
import { connectors, mcus, type ConnectorId, type McuId } from "./board-data";
import { SmdUsbC } from "./SmdUsbC";

export interface PhotodiodeBoardProps {
  connector: ConnectorId;
  mcu: McuId;
}

const ch552tPinLabels = mcus.ch552t.pinLabels;

const opa320Pins = {
  pin1: "OUT",
  pin2: "VNEG",
  pin3: "NONINV",
  pin4: "INV",
  pin5: "VPOS",
} as const;

const usblc6Pins = {
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

const p = (component: string, pin: number) => `.${component} > .pin${pin}`;

const interfaceSection = { schSectionName: "Interface" } as const;
const controlSection = { schSectionName: "Control" } as const;
const analogSection = { schSectionName: "Analog" } as const;
const verticalSchematic = { schOrientation: "vertical" } as const;

// Compress the functional zones without scaling any package or local pad
// geometry. This leaves the USB connector at the physical board edge.
function compactPhotodiodeX(x: number) {
  if (x < -12) return x + 2;
  if (x > 17) return x - 3;
  return x;
}

function compactPhotodiodeY(y: number) {
  if (Math.abs(y) <= 6) return y;
  return Math.sign(y) * (6 + (Math.abs(y) - 6) * 0.5);
}

export const PhotodiodeBoard = ({
  connector,
  mcu: mcuId,
}: PhotodiodeBoardProps) => {
  const mcu = mcus[mcuId];
  const connectorInfo = connectors[connector];
  const isUsb = connector !== "jst-sh";
  const needsUsbBridge = isUsb && !mcu.nativeUsb;
  const usbController = needsUsbBridge ? "U_USB" : "U_MAIN";
  const usbDpPin = needsUsbBridge ? 14 : mcu.nativeUsb?.dpPin;
  const usbDmPin = needsUsbBridge ? 15 : mcu.nativeUsb?.dmPin;
  const mainX = needsUsbBridge ? 0 : -4;
  const isMspm33 = mcuId === "mspm33c321a";
  const isLargeMcu = mcuId === "msp430f5529";
  const mainDecouplingX = isLargeMcu
    ? -11.5
    : isMspm33
      ? -2.5
      : needsUsbBridge
        ? 7.5
        : mainX;
  const mainDecouplingY = isLargeMcu
    ? 16
    : isMspm33
      ? -4.2
      : needsUsbBridge
        ? -4.6
        : -7.2;
  const resetX = isLargeMcu ? -8.5 : isMspm33 ? -5.8 : mainX + 3;
  const resetY = isLargeMcu ? 16 : isMspm33 ? -3 : -7.2;
  const mainSchX = isMspm33
    ? needsUsbBridge
      ? 0.31
      : -0.72
    : needsUsbBridge && mcuId === "msp430fr2355"
      ? 1
      : needsUsbBridge
        ? 1.3
        : 1;
  const mainSchHeight =
    mcuId === "msp430fr2433"
      ? 2.6
      : mcuId === "msp430fr5994" || isMspm33
        ? 5
        : undefined;
  const usbBridgeSchX = isMspm33
    ? -7.32
    : mcuId === "msp430fr2355"
      ? -7.5
      : -5.1;
  const opaSchX = isMspm33
    ? needsUsbBridge
      ? 9.9
      : 8.81
    : needsUsbBridge && mcuId === "msp430fr2355"
      ? 11
      : 8;
  const adcSchX = isMspm33
    ? needsUsbBridge
      ? 7.2
      : 6.1
    : needsUsbBridge && mcuId === "msp430fr2355"
      ? 8
      : 5.2;
  const boardWidth = isLargeMcu || isMspm33 ? 40.5 : 40;
  const boardHeight = isLargeMcu ? 26 : isMspm33 ? 25 : 21;
  const ldoX = needsUsbBridge ? -16.25 : -9.5;
  const ldoY = -(boardHeight / 2 - (needsUsbBridge ? 3.5 : 3));
  const connectorX =
    connector === "usb-c"
      ? -(boardWidth / 2) + 5
      : connector === "usb-micro"
        ? -(boardWidth / 2) + 4.4
        : -(boardWidth / 2) + 3.55;
  const boardTitle = `${connectorInfo.displayName} + ${mcu.displayName}`;

  return (
    <board
      name={`${connector}_${mcuId}_BPX65`}
      width={boardWidth}
      height={boardHeight}
      layers={4}
      solderMaskColor="red"
      schSheetName="Main"
      placementDrcChecksDisabled
    >
      <schematicsheet name="Main" displayName={boardTitle} sheetIndex={0} />
      <schematicsection name="Interface" displayName="Connector & Power" />
      <schematicsection name="Control" displayName="USB & Controller" />
      <schematicsection
        name="Analog"
        displayName="Photodiode Analog Front End"
      />

      {connector === "usb-c" && (
        <SmdUsbC
          {...interfaceSection}
          name="J1"
          pcbX={connectorX}
          pcbY={compactPhotodiodeY(0)}
          pcbRotation={-90}
          schX={-14}
          schY={5}
          schHeight={1.4}
        />
      )}

      {connector === "usb-micro" && (
        <A_10118194_0001LF
          {...interfaceSection}
          name="J1"
          pcbX={connectorX}
          pcbY={compactPhotodiodeY(0)}
          pcbRotation={-90}
          schX={-14}
          schY={5}
          schHeight={1}
        />
      )}

      {connector === "jst-sh" && (
        <chip
          {...interfaceSection}
          name="J1"
          manufacturerPartNumber="SM04B-SRSS-TB"
          footprint="kicad:Connector_JST/JST_SH_SM04B-SRSS-TB_1x04-1MP_P1.00mm_Horizontal"
          pinLabels={{
            pin1: "GND",
            pin2: "VCC_3V3",
            pin3: "UART_TX",
            pin4: "UART_RX",
          }}
          pcbX={connectorX}
          pcbY={compactPhotodiodeY(0)}
          pcbRotation={-90}
          schX={-14}
          schY={5}
          schPortArrangement={{
            leftSide: {
              pins: ["GND", "VCC_3V3"],
              direction: "top-to-bottom",
            },
            rightSide: {
              pins: ["UART_TX", "UART_RX"],
              direction: "top-to-bottom",
            },
          }}
        />
      )}

      {isUsb && (
        <>
          <chip
            {...interfaceSection}
            name="U_ESD"
            manufacturerPartNumber="USBLC6-2SC6"
            supplierPartNumbers={{ jlcpcb: ["C7519"] }}
            footprint="kicad:Package_TO_SOT_SMD/SOT-23-6"
            pinLabels={usblc6Pins}
            pcbX={needsUsbBridge ? -16.5 : compactPhotodiodeX(-17)}
            pcbY={compactPhotodiodeY(9.5)}
            pcbRotation={-90}
            schX={-10}
            schY={5.1}
          />
          <chip
            {...interfaceSection}
            name="U_LDO"
            manufacturerPartNumber="TLV75533PDBVR"
            footprint="kicad:Package_TO_SOT_SMD/SOT-23-5"
            pinLabels={ldoPins}
            pcbX={ldoX}
            pcbY={ldoY}
            pcbRotation={90}
            schX={-10}
            schY={-4}
            schHeight={0.6}
          />
          <capacitor
            {...interfaceSection}
            name="C_LDO_IN"
            capacitance="1uF"
            footprint="0603"
            pcbX={ldoX - 0.95}
            pcbY={-(boardHeight / 2) + 1.5}
            pcbRotation={90}
            schX={-12}
            schY={-6}
            {...verticalSchematic}
          />
          <capacitor
            {...interfaceSection}
            name="C_LDO_OUT"
            capacitance="1uF"
            footprint="0603"
            pcbX={needsUsbBridge ? -10.9 : -6}
            pcbY={
              needsUsbBridge
                ? -(boardHeight / 2) + 0.5
                : -(boardHeight / 2 - 1.5)
            }
            pcbRotation={needsUsbBridge ? 180 : 0}
            schX={-8}
            schY={-6}
            {...verticalSchematic}
          />
        </>
      )}

      {connector === "usb-c" && (
        <>
          <resistor
            {...interfaceSection}
            name="R_CC1"
            resistance="5.1k"
            footprint="0402"
            pcbX={compactPhotodiodeX(-21)}
            pcbY={boardHeight / 2 - 1.5}
            schX={-13}
            schY={8}
          />
          <resistor
            {...interfaceSection}
            name="R_CC2"
            resistance="5.1k"
            footprint="0402"
            pcbX={isLargeMcu ? compactPhotodiodeX(-18) : -12}
            pcbY={boardHeight / 2 - 1.5}
            schX={-11}
            schY={8}
          />
        </>
      )}

      {needsUsbBridge && (
        <>
          <chip
            {...controlSection}
            name="U_USB"
            manufacturerPartNumber="CH552T"
            supplierPartNumbers={{ jlcpcb: ["C111367"] }}
            footprint="kicad:Package_SO/TSSOP-20_4.4x6.5mm_P0.65mm"
            pinLabels={ch552tPinLabels}
            pcbX={-7}
            pcbY={-(boardHeight / 2 - 3.25)}
            pcbRotation={180}
            schX={usbBridgeSchX}
            schY={3}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_USB"
            capacitance="100nF"
            footprint="0402"
            pcbX={-9.5}
            pcbY={isMspm33 ? 10 : compactPhotodiodeY(8.5)}
            schX={-5.3}
            schY={6.5}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_USB_V33"
            capacitance="100nF"
            footprint="0402"
            pcbX={-6.5}
            pcbY={compactPhotodiodeY(8.5)}
            schX={-2.7}
            schY={6.5}
          />
          <resistor
            {...controlSection}
            name="R_USB_RST"
            resistance="100k"
            footprint="0402"
            pcbX={-14}
            pcbY={5.3}
            schX={-7}
            schY={6.5}
          />
        </>
      )}

      {mcuId === "msp430fr2433" ? (
        <MSP430FR2433IRGER
          {...controlSection}
          name="U_MAIN"
          pinLabels={mcu.pinLabels as any}
          pcbX={compactPhotodiodeX(mainX)}
          pcbY={compactPhotodiodeY(needsUsbBridge ? 2 : 1.5)}
          pcbRotation={180}
          schX={mainSchX}
          schY={1}
          schHeight={mainSchHeight}
        />
      ) : (
        <chip
          {...controlSection}
          name="U_MAIN"
          manufacturerPartNumber={mcu.manufacturerPartNumber}
          supplierPartNumbers={mcu.supplierPartNumbers}
          footprint={mcu.footprint}
          pinLabels={mcu.pinLabels}
          pcbX={compactPhotodiodeX(mainX)}
          pcbY={compactPhotodiodeY(needsUsbBridge ? 2 : 1.5)}
          pcbRotation={mcu.pinCount >= 48 ? 45 : 180}
          schX={mainSchX}
          schY={1}
          schHeight={mainSchHeight}
        />
      )}

      <capacitor
        {...controlSection}
        {...verticalSchematic}
        name="C_MAIN"
        capacitance="100nF"
        footprint="0402"
        pcbX={compactPhotodiodeX(mainDecouplingX)}
        pcbY={compactPhotodiodeY(mainDecouplingY)}
        pcbRotation={isLargeMcu ? 90 : 0}
        schX={needsUsbBridge && mcuId === "msp430fr2355" ? 0.5 : 0.9}
        schY={6.5}
      />
      <resistor
        {...controlSection}
        name="R_RESET"
        resistance={mcuId === "ch552t" ? "100k" : "47k"}
        footprint="0402"
        pcbX={compactPhotodiodeX(resetX)}
        pcbY={compactPhotodiodeY(resetY)}
        pcbRotation={isMspm33 ? 90 : 0}
        schX={needsUsbBridge && mcuId === "msp430fr2355" ? 4 : 3.6}
        schY={6.5}
      />

      {isMspm33 && (
        <>
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_MAIN_2"
            capacitance="100nF"
            footprint="0402"
            pcbX={compactPhotodiodeX(mainX + 5.25)}
            pcbY={compactPhotodiodeY(5)}
            pcbRotation={90}
            schX={-1}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_MSPM33_VDD_BULK"
            capacitance="10uF"
            footprint="0603"
            pcbX={compactPhotodiodeX(mainX)}
            pcbY={compactPhotodiodeY(8.4)}
            schX={1.5}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_MSPM33_VBAT"
            capacitance="1uF"
            footprint="0603"
            pcbX={compactPhotodiodeX(mainX - 5.4)}
            pcbY={compactPhotodiodeY(-0.4)}
            pcbRotation={90}
            schX={4}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_MSPM33_VCORE"
            capacitance="2.2uF"
            footprint="0603"
            pcbX={compactPhotodiodeX(mainX - 5.4)}
            pcbY={compactPhotodiodeY(2.2)}
            pcbRotation={90}
            schX={6.19}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_MSPM33_RESET"
            capacitance="10nF"
            footprint="0402"
            pcbX={compactPhotodiodeX(mainX - 5)}
            pcbY={compactPhotodiodeY(-4.6)}
            schX={5.5}
            schY={6.5}
          />
          <resistor
            {...controlSection}
            name="R_MSPM33_BSL"
            resistance="47k"
            footprint="0402"
            pcbX={compactPhotodiodeX(mainX + 2.8)}
            pcbY={compactPhotodiodeY(7)}
            schX={9.31}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_MSPM33_VREF"
            capacitance="1uF"
            footprint="0603"
            pcbX={compactPhotodiodeX(mainX - 3)}
            pcbY={compactPhotodiodeY(6.9)}
            schX={11.5}
            schY={8}
          />
        </>
      )}

      {mcuId === "ch552t" && (
        <capacitor
          {...controlSection}
          {...verticalSchematic}
          name="C_MAIN_V33"
          capacitance="100nF"
          footprint="0402"
          pcbX={compactPhotodiodeX(mainX - 3)}
          pcbY={compactPhotodiodeY(-7.2)}
          schX={-1.5}
          schY={6.5}
        />
      )}

      {mcuId === "msp430f5529" && (
        <>
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_VCORE"
            capacitance="470nF"
            footprint="0603"
            pcbX={compactPhotodiodeX(-5.5)}
            pcbY={compactPhotodiodeY(16)}
            pcbRotation={90}
            schX={-1}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_V18"
            capacitance="1uF"
            footprint="0603"
            pcbX={compactPhotodiodeX(-2.5)}
            pcbY={compactPhotodiodeY(16)}
            pcbRotation={90}
            schX={1}
            schY={8}
          />
          <capacitor
            {...controlSection}
            {...verticalSchematic}
            name="C_VUSB"
            capacitance="220nF"
            footprint="0603"
            pcbX={compactPhotodiodeX(0.5)}
            pcbY={compactPhotodiodeY(16)}
            pcbRotation={90}
            schX={3}
            schY={8}
          />
          <resistor
            {...controlSection}
            name="R_USB_PULLUP"
            resistance="1.4k"
            footprint="0402"
            pcbX={compactPhotodiodeX(3.5)}
            pcbY={compactPhotodiodeY(16)}
            schX={-1}
            schY={9.5}
          />
        </>
      )}

      <chip
        {...analogSection}
        name="U_OPA"
        manufacturerPartNumber="OPA320AIDBVR"
        supplierPartNumbers={{ jlcpcb: ["C92494"] }}
        footprint="kicad:Package_TO_SOT_SMD/SOT-23-5"
        pinLabels={opa320Pins}
        pcbX={compactPhotodiodeX(12.5)}
        pcbY={compactPhotodiodeY(2)}
        pcbRotation={90}
        schX={opaSchX}
        schY={0}
        schHeight={0.6}
      />

      <diode
        {...analogSection}
        name="D_PHOTO"
        photo
        manufacturerPartNumber="BPX 65"
        footprint="kicad:Package_TO_SOT_THT/TO-18-2_Lens"
        pinLabels={{ pin1: "anode", pin2: "cathode" }}
        doNotPlace
        pcbX={compactPhotodiodeX(22)}
        pcbY={compactPhotodiodeY(1.5)}
        pcbRotation={90}
        schX={14}
        schY={0}
      />

      <capacitor
        {...analogSection}
        {...verticalSchematic}
        name="C_OPA"
        capacitance="100nF"
        footprint="0402"
        pcbX={compactPhotodiodeX(12.5)}
        pcbY={compactPhotodiodeY(6)}
        schX={8}
        schY={4}
      />
      <resistor
        {...analogSection}
        name="R_REF_TOP"
        resistance="56k"
        footprint="0402"
        pcbX={compactPhotodiodeX(8)}
        pcbY={compactPhotodiodeY(-5.2)}
        schX={6}
        schY={-4}
      />
      <resistor
        {...analogSection}
        name="R_REF_BOTTOM"
        resistance="10k"
        footprint="0402"
        pcbX={compactPhotodiodeX(11)}
        pcbY={compactPhotodiodeY(-5.2)}
        schX={8}
        schY={-4}
      />
      <capacitor
        {...analogSection}
        {...verticalSchematic}
        name="C_REF"
        capacitance="1uF"
        footprint="0603"
        pcbX={compactPhotodiodeX(14)}
        pcbY={compactPhotodiodeY(-7.5)}
        schX={10}
        schY={-4}
      />
      <resistor
        {...analogSection}
        name="R_FB"
        resistance="330k"
        footprint="0402"
        pcbX={compactPhotodiodeX(16)}
        pcbY={compactPhotodiodeY(6.5)}
        schX={11}
        schY={2}
      />
      <capacitor
        {...analogSection}
        {...verticalSchematic}
        name="C_FB"
        capacitance="10pF"
        footprint="0402"
        pcbX={compactPhotodiodeX(16)}
        pcbY={compactPhotodiodeY(4.7)}
        schX={11}
        schY={3}
      />
      <resistor
        {...analogSection}
        name="R_ADC"
        resistance="100"
        footprint="0402"
        pcbX={compactPhotodiodeX(8)}
        pcbY={compactPhotodiodeY(1.5)}
        schX={adcSchX}
        schY={0}
      />
      <capacitor
        {...analogSection}
        {...verticalSchematic}
        name="C_ADC"
        capacitance="1nF"
        footprint="0402"
        pcbX={compactPhotodiodeX(8)}
        pcbY={compactPhotodiodeY(-1)}
        schX={5}
        schY={-2}
      />

      <pinheader
        {...controlSection}
        name="J_DEBUG"
        pinCount={6}
        pitch="2.54mm"
        gender="unpopulated"
        doNotPlace
        pinLabels={
          isMspm33
            ? ["VCC_3V3", "GND", "RESET", "ADC_IN", "SWDIO", "SWCLK"]
            : ["VCC_3V3", "GND", "RESET", "ADC_IN", "UART_TX", "UART_RX"]
        }
        pcbPinLabels={
          isMspm33
            ? {
                pin1: "3V3",
                pin2: "G",
                pin3: "RST",
                pin4: "ADC",
                pin5: "DIO",
                pin6: "CLK",
              }
            : {
                pin1: "3V3",
                pin2: "G",
                pin3: "RST",
                pin4: "ADC",
                pin5: "TX",
                pin6: "RX",
              }
        }
        showSilkscreenPinLabels
        pcbX={needsUsbBridge ? 6 : compactPhotodiodeX(0)}
        pcbY={compactPhotodiodeY(-12)}
        pcbOrientation="horizontal"
        pcbRotation={needsUsbBridge ? 180 : 0}
        schX={1}
        schY={-9}
        schWidth={0.865}
      />

      <testpoint
        {...analogSection}
        name="TP_VREF"
        footprintVariant="pad"
        padDiameter="1.5mm"
        pcbX={needsUsbBridge ? 14.5 : compactPhotodiodeX(12)}
        pcbY={needsUsbBridge ? -3.5 : compactPhotodiodeY(-9.5)}
        schX={10}
        schY={-7}
      />
      <testpoint
        {...analogSection}
        name="TP_TIA"
        footprintVariant="pad"
        padDiameter="1.5mm"
        pcbX={needsUsbBridge ? 17.25 : compactPhotodiodeX(15.5)}
        pcbY={needsUsbBridge ? -3.5 : compactPhotodiodeY(-9.5)}
        schX={12}
        schY={-7}
      />
      <hole
        name="H1"
        diameter="2.4mm"
        pcbX={boardWidth / 2 - 2.25}
        pcbY={-(boardHeight / 2 - 3)}
      />
      <hole
        name="H2"
        diameter="2.4mm"
        pcbX={boardWidth / 2 - 2.25}
        pcbY={boardHeight / 2 - 3}
      />

      {needsUsbBridge && (
        <via
          name="V_LDO_OUT_GND"
          pcbX={-12.5}
          pcbY={-(boardHeight / 2) + 0.5}
          fromLayer="top"
          toLayer="inner1"
          holeDiameter="0.2mm"
          outerDiameter="0.45mm"
          connectsTo="net.GND"
        />
      )}

      {isMspm33 && (
        <>
          <via
            name="V_MSPM33_EP_1"
            pcbX={compactPhotodiodeX(mainX - 0.9)}
            pcbY={compactPhotodiodeY(0.6)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter="0.2mm"
            outerDiameter="0.45mm"
            connectsTo="net.GND"
          />
          <via
            name="V_MSPM33_EP_2"
            pcbX={compactPhotodiodeX(mainX + 0.9)}
            pcbY={compactPhotodiodeY(0.6)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter="0.2mm"
            outerDiameter="0.45mm"
            connectsTo="net.GND"
          />
          <via
            name="V_MSPM33_EP_3"
            pcbX={compactPhotodiodeX(mainX - 0.9)}
            pcbY={compactPhotodiodeY(2.4)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter="0.2mm"
            outerDiameter="0.45mm"
            connectsTo="net.GND"
          />
          <via
            name="V_MSPM33_EP_4"
            pcbX={compactPhotodiodeX(mainX + 0.9)}
            pcbY={compactPhotodiodeY(2.4)}
            fromLayer="top"
            toLayer="bottom"
            holeDiameter="0.2mm"
            outerDiameter="0.45mm"
            connectsTo="net.GND"
          />
        </>
      )}

      {connector === "usb-c" && (
        <>
          <trace from=".J1 > .pin3" to="net.VBUS5" thickness="0.5mm" />
          <trace from=".J1 > .pin4" to="net.VBUS5" thickness="0.5mm" />
          <trace from=".J1 > .pin13" to="net.VBUS5" thickness="0.5mm" />
          <trace from=".J1 > .pin14" to="net.VBUS5" thickness="0.5mm" />
          <trace from=".J1 > .pin1" to="net.GND" thickness="0.5mm" />
          <trace from=".J1 > .pin2" to="net.GND" thickness="0.5mm" />
          <trace from=".J1 > .pin15" to="net.GND" thickness="0.5mm" />
          <trace from=".J1 > .pin16" to="net.GND" thickness="0.5mm" />
          {[17, 18, 19, 20].map((pin) => (
            <trace
              key={`usb-shield-${pin}`}
              from={`.J1 > .pin${pin}`}
              to="net.GND"
              thickness="0.5mm"
            />
          ))}
          <trace from=".J1 > .pin6" to="net.USB_CC1" />
          <trace from=".R_CC1 > .pin1" to="net.USB_CC1" />
          <trace from=".R_CC1 > .pin2" to="net.GND" />
          <trace from=".J1 > .pin12" to="net.USB_CC2" />
          <trace from=".R_CC2 > .pin1" to="net.USB_CC2" />
          <trace from=".R_CC2 > .pin2" to="net.GND" />
          <trace from=".J1 > .pin8" to="net.USB_DP_PORT" thickness="0.2mm" />
          <trace from=".J1 > .pin10" to="net.USB_DP_PORT" thickness="0.2mm" />
          <trace from=".J1 > .pin7" to="net.USB_DM_PORT" thickness="0.2mm" />
          <trace from=".J1 > .pin9" to="net.USB_DM_PORT" thickness="0.2mm" />
        </>
      )}

      {connector === "usb-micro" && (
        <>
          <trace from=".J1 > .pin1" to="net.VBUS5" thickness="0.3mm" />
          <trace from=".J1 > .pin5" to="net.GND" thickness="0.5mm" />
          <trace from=".J1 > .pin3" to="net.USB_DP_PORT" thickness="0.25mm" />
          <trace from=".J1 > .pin2" to="net.USB_DM_PORT" thickness="0.25mm" />
        </>
      )}

      {isUsb && usbDpPin && usbDmPin && (
        <>
          <trace
            from=".U_ESD > .pin1"
            to="net.USB_DP_PORT"
            thickness="0.25mm"
          />
          <trace
            from=".U_ESD > .pin3"
            to="net.USB_DM_PORT"
            thickness="0.25mm"
          />
          <trace from=".U_ESD > .pin6" to="net.USB_DP_MCU" thickness="0.25mm" />
          <trace from=".U_ESD > .pin4" to="net.USB_DM_MCU" thickness="0.25mm" />
          <trace
            from={p(usbController, usbDpPin)}
            to="net.USB_DP_MCU"
            thickness="0.25mm"
          />
          <trace
            from={p(usbController, usbDmPin)}
            to="net.USB_DM_MCU"
            thickness="0.25mm"
          />
          <trace from=".U_ESD > .pin5" to="net.VBUS5" />
          <trace from=".U_ESD > .pin2" to="net.GND" />
          <trace from=".U_LDO > .pin1" to="net.VBUS5" thickness="0.4mm" />
          <trace
            from=".U_LDO > .pin3"
            to=".U_LDO > .pin1"
            thickness="0.1mm"
            pcbRouteHints={[
              { x: ldoX + 0.95, y: -(boardHeight / 2) + 0.7 },
              { x: ldoX - 0.95, y: -(boardHeight / 2) + 0.7 },
            ]}
          />
          <trace from=".U_LDO > .pin2" to="net.GND" thickness="0.1mm" />
          <trace from=".U_LDO > .pin5" to="net.VCC_3V3" thickness="0.3mm" />
          <trace from=".C_LDO_IN > .pin1" to="net.VBUS5" />
          <trace from=".C_LDO_IN > .pin2" to="net.GND" thickness="0.1mm" />
          {needsUsbBridge ? (
            <trace
              from=".C_LDO_OUT > .pin1"
              to=".U_USB > .pin19"
              thickness="0.1mm"
              maxLength="3mm"
            />
          ) : (
            <trace
              from=".C_LDO_OUT > .pin1"
              to="net.VCC_3V3"
              thickness="0.1mm"
            />
          )}
          <trace from=".C_LDO_OUT > .pin2" to="net.GND" maxLength="3mm" />
        </>
      )}

      {connector === "jst-sh" && (
        <>
          <trace from=".J1 > .pin1" to="net.GND" thickness="0.5mm" />
          <trace from=".J1 > .pin2" to="net.VCC_3V3" thickness="0.5mm" />
          <trace from=".J1 > .pin3" to="net.UART_MAIN_TX" />
          <trace
            from=".J1 > .pin4"
            to="net.UART_MAIN_RX"
            thickness={mcuId === "msp430fr5994" ? "0.13mm" : undefined}
            pcbRouteHints={
              mcuId === "msp430fr5994"
                ? [
                    { x: -13, y: 4 },
                    { x: -2, y: 4 },
                  ]
                : undefined
            }
          />
        </>
      )}

      {needsUsbBridge && (
        <>
          <trace from=".U_USB > .pin19" to="net.VCC_3V3" thickness="0.2mm" />
          <trace from=".U_USB > .pin18" to="net.GND" thickness="0.25mm" />
          <trace from=".U_USB > .pin20" to="net.USB_BRIDGE_V33" />
          <trace from=".C_USB > .pin1" to="net.VCC_3V3" />
          <trace from=".C_USB > .pin2" to="net.GND" thickness="0.1mm" />
          <trace from=".C_USB_V33 > .pin1" to="net.USB_BRIDGE_V33" />
          <trace from=".C_USB_V33 > .pin2" to="net.GND" />
          <trace from=".U_USB > .pin6" to="net.USB_BRIDGE_RESET" />
          <trace from=".R_USB_RST > .pin1" to="net.USB_BRIDGE_RESET" />
          <trace from=".R_USB_RST > .pin2" to="net.GND" thickness="0.1mm" />
          <trace
            from=".U_USB > .pin9"
            to={p("U_MAIN", mcu.uartRxPin)}
            thickness="0.1mm"
          />
          <trace
            from=".U_USB > .pin10"
            to={p("U_MAIN", mcu.uartTxPin)}
            thickness="0.1mm"
            pcbRouteHints={
              mcuId === "msp430fr2355"
                ? [
                    { x: -3, y: -1 },
                    { x: 5, y: 0 },
                    { x: 5, y: 6.5 },
                    { x: 4, y: 6.5 },
                  ]
                : undefined
            }
          />
        </>
      )}

      {mcu.vccPins.map((pin) => (
        <trace
          key={`vcc-${pin}`}
          from={p("U_MAIN", pin)}
          to="net.VCC_3V3"
          thickness="0.35mm"
        />
      ))}
      {mcu.gndPins.map((pin) => (
        <trace
          key={`gnd-${pin}`}
          from={p("U_MAIN", pin)}
          to="net.GND"
          thickness="0.35mm"
        />
      ))}
      <trace from=".C_MAIN > .pin1" to="net.VCC_3V3" />
      <trace from=".C_MAIN > .pin2" to="net.GND" />
      {needsUsbBridge && mcuId === "msp430fr2355" ? (
        <trace
          from={p("U_MAIN", mcu.resetPin)}
          to=".R_RESET > .pin1"
          thickness="0.05mm"
          maxViaCount={2}
          pcbPath={[
            { x: -4.163, y: 0.75 },
            { x: -5.338, y: 0.742 },
            {
              x: -5.338,
              y: 0.742,
              via: true,
              fromLayer: "top",
              toLayer: "bottom",
            },
            { x: -5.338, y: 0.742 },
            { x: -4.879, y: -7.283 },
            {
              x: -4.879,
              y: -7.283,
              via: true,
              fromLayer: "bottom",
              toLayer: "top",
            },
            { x: -4.879, y: -7.283 },
          ]}
        />
      ) : (
        <>
          <trace
            from={p("U_MAIN", mcu.resetPin)}
            to="net.MAIN_RESET"
            thickness="0.12mm"
          />
          <trace from=".R_RESET > .pin1" to="net.MAIN_RESET" />
        </>
      )}
      <trace
        from=".R_RESET > .pin2"
        to={mcuId === "ch552t" ? "net.GND" : "net.VCC_3V3"}
      />
      {!needsUsbBridge && (
        <>
          <trace
            from={p("U_MAIN", mcu.uartTxPin)}
            to="net.UART_MAIN_TX"
            thickness="0.1mm"
          />
          <trace
            from={p("U_MAIN", mcu.uartRxPin)}
            to="net.UART_MAIN_RX"
            thickness="0.1mm"
          />
        </>
      )}

      {mcuId === "ch552t" && (
        <>
          <trace from=".U_MAIN > .pin20" to="net.MAIN_V33" />
          <trace from=".C_MAIN_V33 > .pin1" to="net.MAIN_V33" />
          <trace from=".C_MAIN_V33 > .pin2" to="net.GND" />
        </>
      )}

      {mcuId === "msp430f5529" && (
        <>
          <trace from=".U_MAIN > .pin20" to="net.MSP_VCORE" />
          <trace from=".C_VCORE > .pin1" to="net.MSP_VCORE" />
          <trace from=".C_VCORE > .pin2" to="net.GND" />
          <trace from=".U_MAIN > .pin67" to="net.MSP_V18" />
          <trace from=".C_V18 > .pin1" to="net.MSP_V18" />
          <trace from=".C_V18 > .pin2" to="net.GND" />
          <trace from=".U_MAIN > .pin66" to="net.MSP_VUSB" />
          <trace from=".C_VUSB > .pin1" to="net.MSP_VUSB" />
          <trace from=".C_VUSB > .pin2" to="net.GND" />
          <trace from=".U_MAIN > .pin63" to="net.MSP_USB_PUR" />
          <trace from=".R_USB_PULLUP > .pin1" to="net.MSP_USB_PUR" />
          <trace from=".R_USB_PULLUP > .pin2" to="net.USB_DP_MCU" />
          {isUsb && <trace from=".U_MAIN > .pin65" to="net.VBUS5" />}
        </>
      )}

      {isMspm33 &&
        mcu.vbatPin &&
        mcu.vcorePin &&
        mcu.vrefPins &&
        mcu.bslInvokePin && (
          <>
            <trace
              from={p("U_MAIN", mcu.vbatPin)}
              to="net.VCC_3V3"
              thickness="0.35mm"
            />
            <trace from=".C_MAIN_2 > .pin1" to="net.VCC_3V3" />
            <trace from=".C_MAIN_2 > .pin2" to="net.GND" />
            <trace from=".C_MSPM33_VDD_BULK > .pin1" to="net.VCC_3V3" />
            <trace from=".C_MSPM33_VDD_BULK > .pin2" to="net.GND" />
            <trace from=".C_MSPM33_VBAT > .pin1" to="net.VCC_3V3" />
            <trace from=".C_MSPM33_VBAT > .pin2" to="net.GND" />
            <trace from={p("U_MAIN", mcu.vcorePin)} to="net.MSPM33_VCORE" />
            <trace from=".C_MSPM33_VCORE > .pin1" to="net.MSPM33_VCORE" />
            <trace from=".C_MSPM33_VCORE > .pin2" to="net.GND" />
            <trace
              from={p("U_MAIN", mcu.vrefPins.positivePin)}
              to="net.VCC_3V3"
            />
            <trace from={p("U_MAIN", mcu.vrefPins.negativePin)} to="net.GND" />
            <trace from=".C_MSPM33_VREF > .pin1" to="net.VCC_3V3" />
            <trace from=".C_MSPM33_VREF > .pin2" to="net.GND" />
            <trace from=".C_MSPM33_RESET > .pin1" to="net.MAIN_RESET" />
            <trace from=".C_MSPM33_RESET > .pin2" to="net.GND" />
            <trace
              from={p("U_MAIN", mcu.bslInvokePin)}
              to="net.MSPM33_BSL_INVOKE"
            />
            <trace from=".R_MSPM33_BSL > .pin1" to="net.MSPM33_BSL_INVOKE" />
            <trace from=".R_MSPM33_BSL > .pin2" to="net.GND" />
          </>
        )}

      <trace from=".U_OPA > .pin5" to="net.VCC_3V3" thickness="0.1mm" />
      <trace from=".U_OPA > .pin2" to="net.GND" />
      <trace from=".C_OPA > .pin1" to="net.VCC_3V3" />
      <trace from=".C_OPA > .pin2" to="net.GND" />
      <trace from=".R_REF_TOP > .pin1" to="net.VCC_3V3" thickness="0.1mm" />
      <trace from=".R_REF_TOP > .pin2" to="net.VREF_0V5" />
      <trace from=".R_REF_BOTTOM > .pin1" to="net.VREF_0V5" />
      <trace from=".R_REF_BOTTOM > .pin2" to="net.GND" />
      <trace from=".C_REF > .pin1" to="net.VREF_0V5" />
      <trace from=".C_REF > .pin2" to="net.GND" />
      <trace from=".U_OPA > .pin3" to="net.VREF_0V5" />

      <trace from=".D_PHOTO > .pin1" to="net.GND" />
      <trace from=".D_PHOTO > .pin2" to="net.PD_SUM" />
      <trace from=".U_OPA > .pin4" to="net.PD_SUM" />
      <trace from=".R_FB > .pin1" to="net.PD_SUM" />
      <trace from=".R_FB > .pin2" to="net.TIA_OUT" />
      <trace from=".C_FB > .pin1" to="net.PD_SUM" />
      <trace from=".C_FB > .pin2" to="net.TIA_OUT" thickness="0.1mm" />
      <trace from=".U_OPA > .pin1" to="net.TIA_OUT" thickness="0.1mm" />
      <trace from=".R_ADC > .pin1" to="net.TIA_OUT" />
      <trace from=".R_ADC > .pin2" to="net.ADC_IN" />
      <trace from=".C_ADC > .pin1" to="net.ADC_IN" />
      <trace from=".C_ADC > .pin2" to="net.GND" />
      <trace
        from={p("U_MAIN", mcu.adcPin)}
        to="net.ADC_IN"
        thickness="0.12mm"
      />

      <trace from=".J_DEBUG > .pin1" to="net.VCC_3V3" />
      <trace from=".J_DEBUG > .pin2" to="net.GND" />
      {needsUsbBridge && mcuId === "msp430fr2355" ? (
        <trace
          from=".J_DEBUG > .pin3"
          to=".R_RESET > .pin1"
          thickness="0.1mm"
        />
      ) : (
        <trace from=".J_DEBUG > .pin3" to="net.MAIN_RESET" />
      )}
      <trace from=".J_DEBUG > .pin4" to="net.ADC_IN" />
      {isMspm33 && mcu.swdPins ? (
        <>
          <trace from=".J_DEBUG > .pin5" to="net.MSPM33_SWDIO" />
          <trace
            from={p("U_MAIN", mcu.swdPins.dataPin)}
            to="net.MSPM33_SWDIO"
          />
          <trace from=".J_DEBUG > .pin6" to="net.MSPM33_SWCLK" />
          <trace
            from={p("U_MAIN", mcu.swdPins.clockPin)}
            to="net.MSPM33_SWCLK"
          />
        </>
      ) : needsUsbBridge ? (
        <>
          <trace
            from=".J_DEBUG > .pin5"
            to=".U_USB > .pin10"
            thickness="0.1mm"
          />
          <trace
            from=".J_DEBUG > .pin6"
            to=".U_USB > .pin9"
            thickness="0.1mm"
          />
        </>
      ) : (
        <>
          <trace from=".J_DEBUG > .pin5" to="net.UART_MAIN_TX" />
          <trace from=".J_DEBUG > .pin6" to="net.UART_MAIN_RX" />
        </>
      )}
      <trace from=".TP_VREF > .pin1" to="net.VREF_0V5" />
      <trace from=".TP_TIA > .pin1" to="net.TIA_OUT" />

      <copperpour
        name="INNER1_GND_PLANE"
        layer="inner1"
        connectsTo="net.GND"
        padMargin="0.25mm"
        traceMargin="0.2mm"
        boardEdgeMargin="0.3mm"
        useThermalReliefs
      />
      <copperpour
        name="INNER2_3V3_PLANE"
        layer="inner2"
        connectsTo="net.VCC_3V3"
        padMargin="0.25mm"
        traceMargin="0.2mm"
        boardEdgeMargin="0.3mm"
        useThermalReliefs
      />

      <silkscreentext
        text={boardTitle}
        pcbX={compactPhotodiodeX(7)}
        pcbY={compactPhotodiodeY(boardHeight / 2 - 1.6)}
        fontSize="0.78mm"
      />
      <silkscreentext
        text="BPX65 + OPA320"
        pcbX={compactPhotodiodeX(16.5)}
        pcbY={compactPhotodiodeY(-12.4)}
        fontSize="0.65mm"
      />
      <silkscreentext
        text="4L • GND / 3V3 PLANES"
        pcbX={compactPhotodiodeX(8.5)}
        pcbY={compactPhotodiodeY(-13.5)}
        fontSize="0.48mm"
      />
      {needsUsbBridge && (
        <silkscreentext
          text="CH552 USB BRIDGE"
          pcbX={compactPhotodiodeX(-10.5)}
          pcbY={compactPhotodiodeY(10.8)}
          fontSize="0.55mm"
        />
      )}
    </board>
  );
};
