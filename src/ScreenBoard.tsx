import { Fragment } from "react";
import { MSPM0G5117SPMR, mspm0UsbLqfp64Pins } from "./MSPM0G5117SPMR";
import { MSPM0G5187SPMR } from "./MSPM0G5187SPMR";
import { mcus } from "./board-data";
import { screens, type ScreenId } from "./screen-data";
import { SmdUsbC } from "./SmdUsbC";

export interface ScreenBoardProps {
  screen: ScreenId;
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

const backlightMosfetPins = {
  pin1: "GATE",
  pin2: "SOURCE",
  pin3: "DRAIN",
} as const;

const epaperMosfetPins = {
  pin1: "GATE",
  pin2: "SOURCE",
  pin3: "DRAIN",
} as const;

const epaperSchottkyPins = {
  pin1: "CATHODE",
  pin2: "ANODE",
} as const;

const f5529 = {
  vcore: 20,
  backlightPwm: 23,
  displayTe: 24,
  displayBusy: 24,
  spiMosi: 37,
  spiMiso: 38,
  spiClock: 39,
  uartTx: 40,
  uartRx: 41,
  displayCs: 42,
  displayDc: 43,
  displayReset: 44,
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
const displaySection = { schSectionName: "Display" } as const;
const verticalCapacitorSymbol = { schOrientation: "vertical" } as const;

const OledSupport = () => (
  <>
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_OLED_C2"
      capacitance="1uF"
      footprint="0603"
      pcbX={31.5}
      pcbY={6.5}
      pcbRotation={90}
      schX={20}
      schY={7}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_OLED_C1"
      capacitance="1uF"
      footprint="0603"
      pcbX={28.5}
      pcbY={6}
      pcbRotation={90}
      schX={24}
      schY={7}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_OLED_VBAT"
      capacitance="1uF"
      footprint="0603"
      pcbX={25.5}
      pcbY={7.5}
      schX={28}
      schY={7}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_OLED_VDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={25.5}
      pcbY={4.5}
      schX={32}
      schY={7}
    />
    <resistor
      {...displaySection}
      name="R_OLED_IREF"
      resistance="390k"
      footprint="0402"
      pcbX={28}
      pcbY={-2}
      schX={8}
      schY={-5}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_OLED_VCOMH"
      capacitance="2.2uF"
      maxDecouplingTraceLength="6mm"
      footprint="0603"
      pcbX={32.2}
      pcbY={-4}
      schX={24}
      schY={-5}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_OLED_VCC"
      capacitance="4.7uF"
      maxDecouplingTraceLength="6mm"
      footprint="0805"
      pcbX={32}
      pcbY={-8.3}
      schX={30}
      schY={-5}
    />
  </>
);

const BacklightSwitch = () => (
  <>
    <chip
      {...displaySection}
      name="Q_BL"
      manufacturerPartNumber="AO3400A"
      supplierPartNumbers={{ jlcpcb: ["C20917"] }}
      footprint="kicad:Package_TO_SOT_SMD/SOT-23"
      pinLabels={backlightMosfetPins}
      pcbX={14}
      pcbY={-16}
      pcbRotation={90}
      schX={22}
      schY={-6}
      schHeight={0.4}
    />
    <resistor
      {...displaySection}
      name="R_BL_GATE"
      resistance="100"
      footprint="0402"
      pcbX={9}
      pcbY={-16}
      schX={18}
      schY={-6}
    />
    <resistor
      {...displaySection}
      name="R_BL_GATE_PD"
      resistance="100k"
      footprint="0402"
      pcbX={11.5}
      pcbY={-19}
      schX={22}
      schY={-9}
    />
  </>
);

const Tft020Support = () => (
  <>
    <BacklightSwitch />
    <resistor
      {...displaySection}
      name="R_BL1"
      resistance="47"
      footprint="1206"
      pcbX={24}
      pcbY={-17}
      schX={28}
      schY={-6}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_TFT_VDD"
      capacitance="1uF"
      footprint="0603"
      pcbX={22}
      pcbY={10}
      schX={20}
      schY={7}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_TFT_IOVDD"
      capacitance="100nF"
      footprint="0402"
      pcbX={26}
      pcbY={10}
      schX={26}
      schY={7}
    />
  </>
);

const Tft028Support = () => (
  <>
    <BacklightSwitch />
    {[1, 2, 3, 4].map((index) => (
      <resistor
        {...displaySection}
        key={`R_BL${index}`}
        name={`R_BL${index}`}
        resistance="100"
        footprint="0805"
        pcbX={20 + (index - 1) * 4}
        pcbY={-18}
        schX={28 + (index - 1) * 5}
        schY={-6}
      />
    ))}
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_TFT_VDDI1"
      capacitance="100nF"
      footprint="0402"
      pcbX={22}
      pcbY={12}
      schX={20}
      schY={7}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_TFT_VDDI2"
      capacitance="100nF"
      footprint="0402"
      pcbX={25}
      pcbY={12}
      schX={26}
      schY={7}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_TFT_VCI"
      capacitance="1uF"
      footprint="0603"
      pcbX={28}
      pcbY={12}
      schX={32}
      schY={7}
    />
  </>
);

const EpaperSupport = () => (
  <>
    <inductor
      {...displaySection}
      name="L_EPD_BOOST"
      manufacturerPartNumber="FTC252012S100MBCA"
      supplierPartNumbers={{ jlcpcb: ["C5832376"] }}
      inductance="10uH"
      maxCurrentRating="1.2A"
      footprint="kicad:Inductor_SMD/L_1008_2520Metric"
      pcbX={17}
      pcbY={13}
      pcbRotation={0}
      schX={20}
      schY={5}
    />
    <chip
      {...displaySection}
      name="Q_EPD_BOOST"
      manufacturerPartNumber="SI1308EDL-T1-GE3"
      supplierPartNumbers={{ jlcpcb: ["C469327"] }}
      footprint="kicad:Package_TO_SOT_SMD/SOT-323_SC-70"
      pinLabels={epaperMosfetPins}
      pcbX={22}
      pcbY={13}
      pcbRotation={90}
      schX={25}
      schY={4}
      schHeight={0.4}
    />
    <resistor
      {...displaySection}
      name="R_EPD_SENSE"
      manufacturerPartNumber="FRL1206FR470TS"
      supplierPartNumbers={{ jlcpcb: ["C2907355"] }}
      resistance="0.47"
      footprint="1206"
      pcbX={26}
      pcbY={13}
      pcbRotation={90}
      schX={30}
      schY={3}
    />
    <resistor
      {...displaySection}
      name="R_EPD_GATE_PD"
      resistance="10k"
      footprint="0402"
      pcbX={22}
      pcbY={16}
      pcbRotation={0}
      schX={25}
      schY={2}
    />

    {[1, 2, 3].map((index) => (
      <chip
        {...displaySection}
        key={`D_EPD_${index}`}
        name={`D_EPD_${index}`}
        manufacturerPartNumber="MBR0530T1G"
        supplierPartNumbers={{ jlcpcb: ["C82046"] }}
        footprint="kicad:Diode_SMD/D_SOD-123"
        pinLabels={epaperSchottkyPins}
        pcbX={30 - index * 5}
        pcbY={7}
        pcbRotation={index === 3 ? 180 : 0}
        schX={20 + (index - 1) * 5}
        schY={0}
      />
    ))}

    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_EPD_FLY"
      manufacturerPartNumber="CL31B475KAHNNNE"
      supplierPartNumbers={{ jlcpcb: ["C1872"] }}
      capacitance="4.7uF"
      maxVoltageRating="25V"
      maxDecouplingTraceLength="12mm"
      footprint="1206"
      pcbX={18.5}
      pcbY={10.5}
      pcbRotation={0}
      schX={35}
      schY={1}
    />
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_EPD_BOOST_IN"
      manufacturerPartNumber="CL31B475KAHNNNE"
      supplierPartNumbers={{ jlcpcb: ["C1872"] }}
      capacitance="4.7uF"
      maxVoltageRating="25V"
      maxDecouplingTraceLength="12mm"
      footprint="1206"
      pcbX={10}
      pcbY={16}
      pcbRotation={0}
      schX={16}
      schY={5}
    />

    {[
      ["C_EPD_VDHR", 29.75, 7, 38, 7],
      ["C_EPD_VDDD", 29, -3, 38, 4],
      ["C_EPD_VSH", 29, -6, 38, 1],
      ["C_EPD_VSL", 29, -8, 38, -2],
      ["C_EPD_VCOM", 29, -11, 38, -5],
      ["C_EPD_VDD", 32.3, -1, 22, 8],
      ["C_EPD_VGH", 29, 1, 30, -4],
      ["C_EPD_VGL", 25, -3, 24, -4],
    ].map(([name, pcbX, pcbY, schX, schY]) => (
      <capacitor
        {...displaySection}
        {...verticalCapacitorSymbol}
        key={name}
        name={name as string}
        manufacturerPartNumber="CL21B105KBFNNNE"
        supplierPartNumbers={{ jlcpcb: ["C28323"] }}
        capacitance="1uF"
        maxVoltageRating="50V"
        maxDecouplingTraceLength="12mm"
        footprint="0805"
        pcbX={pcbX as number}
        pcbY={pcbY as number}
        pcbRotation={180}
        schX={schX as number}
        schY={schY as number}
      />
    ))}
    <capacitor
      {...displaySection}
      {...verticalCapacitorSymbol}
      name="C_EPD_VDD_HF"
      manufacturerPartNumber="CC0603KRX7R9BB104"
      supplierPartNumbers={{ jlcpcb: ["C14663"] }}
      capacitance="100nF"
      maxVoltageRating="50V"
      maxDecouplingTraceLength="12mm"
      footprint="0603"
      pcbX={32.5}
      pcbY={1.5}
      pcbRotation={180}
      schX={28}
      schY={8}
    />
  </>
);

export const ScreenBoard = ({
  screen: screenId,
  controller = "msp430f5529",
}: ScreenBoardProps) => {
  const screen = screens[screenId];
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
  const isOled = screenId === "er-oled096-1-3w";
  const isTft020 = screenId === "er-tft020-3";
  const isTft028 = screenId === "er-tft028a2-4";
  const isEpaper = screenId === "er-epd0213-2b";
  const displaySchematicHeight = isOled
    ? 3.2
    : isTft020
      ? 1.6
      : isTft028
        ? 5.2
        : 2.6;
  const boardWidth = 82;
  const boardHeight = 52;
  const boardTitle = `USB-C + ${controllerLabel} + ${screen.displayName}`;
  const displaySignalPins = Array.from(
    { length: screen.connector.positionCount },
    (_, index) => screen.connector.pinLabels[`pin${index + 1}`],
  );
  const displayPortArrangement = {
    leftSide: {
      pins: displaySignalPins.slice(
        0,
        Math.ceil(screen.connector.positionCount / 2),
      ),
      direction: "top-to-bottom" as const,
    },
    rightSide: {
      pins: [
        ...displaySignalPins.slice(
          Math.ceil(screen.connector.positionCount / 2),
        ),
        "MP1",
        "MP2",
      ],
      direction: "top-to-bottom" as const,
    },
  };

  return (
    <board
      name={`usb-c_${controller}_${screenId}`}
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
        name="Display"
        displayName={`${screen.controller} Display Interface`}
      />

      <SmdUsbC
        {...interfaceSection}
        name="J_USB"
        pcbX={-36}
        pcbY={0}
        pcbRotation={-90}
        schX={-16}
        schY={5}
      />
      <chip
        {...interfaceSection}
        name="U_ESD"
        manufacturerPartNumber="USBLC6-2SC6"
        supplierPartNumbers={{ jlcpcb: ["C7519"] }}
        footprint="kicad:Package_TO_SOT_SMD/SOT-23-6"
        pinLabels={usbEsdPins}
        pcbX={-29}
        pcbY={0}
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
        pcbX={-28}
        pcbY={-8}
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
        pcbX={-3.8}
        pcbY={9}
        pcbRotation={-90}
        schX={-7}
        schY={5}
      />
      <resistor
        {...interfaceSection}
        name="R_USB_DM"
        resistance={isNativeUsbMspm0 ? "0" : "27"}
        footprint="0402"
        pcbX={-5}
        pcbY={9}
        pcbRotation={-90}
        schX={-7}
        schY={3}
      />
      <resistor
        {...interfaceSection}
        name="R_CC1"
        resistance="5.1k"
        footprint="0402"
        pcbX={-31}
        pcbY={12}
        schX={-14}
        schY={8}
      />
      <resistor
        {...interfaceSection}
        name="R_CC2"
        resistance="5.1k"
        footprint="0402"
        pcbX={-27}
        pcbY={12}
        schX={-12}
        schY={8}
      />
      <capacitor
        {...interfaceSection}
        {...verticalCapacitorSymbol}
        name="C_LDO_IN"
        capacitance="1uF"
        footprint="0603"
        pcbX={-32}
        pcbY={-11}
        schX={-13}
        schY={-7}
      />
      <capacitor
        {...interfaceSection}
        {...verticalCapacitorSymbol}
        name="C_LDO_OUT"
        capacitance="1uF"
        footprint="0603"
        pcbX={-24}
        pcbY={-11}
        schX={-9}
        schY={-7}
      />
      <capacitor
        {...interfaceSection}
        {...verticalCapacitorSymbol}
        name="C_3V3_BULK"
        capacitance="4.7uF"
        footprint="0805"
        pcbX={-20}
        pcbY={-11}
        schX={-7}
        schY={-7}
      />

      {isNativeUsbMspm0 ? (
        <NativeUsbMspm0
          {...controlSection}
          name="U_MAIN"
          pcbX={-9}
          pcbY={0}
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
          pcbX={-9}
          pcbY={0}
          pcbRotation={0}
          schX={0}
          schY={1}
        />
      )}
      {isNativeUsbMspm0 ? (
        <>
          <capacitor
            {...controlSection}
            {...verticalCapacitorSymbol}
            name="C_MCU_VDD"
            capacitance="100nF"
            footprint="0402"
            pcbX={0}
            pcbY={-0.25}
            pcbRotation={0}
            schX={-4}
            schY={7}
          />
          <capacitor
            {...controlSection}
            {...verticalCapacitorSymbol}
            name="C_MCU_BULK"
            capacitance="10uF"
            footprint="0805"
            pcbX={-18}
            pcbY={-3.75}
            pcbRotation={180}
            schX={-1}
            schY={7}
          />
        </>
      ) : (
        <>
          <capacitor
            {...controlSection}
            {...verticalCapacitorSymbol}
            name="C_MCU_DVCC1"
            capacitance="100nF"
            footprint="0402"
            pcbX={-18}
            pcbY={-3.75}
            pcbRotation={180}
            schX={-4}
            schY={7}
          />
          <capacitor
            {...controlSection}
            {...verticalCapacitorSymbol}
            name="C_MCU_DVCC2"
            capacitance="100nF"
            footprint="0402"
            pcbX={0}
            pcbY={-0.25}
            pcbRotation={0}
            schX={-2}
            schY={7}
          />
          <capacitor
            {...controlSection}
            {...verticalCapacitorSymbol}
            name="C_MCU_AVCC"
            capacitance="1uF"
            footprint="0603"
            pcbX={-19}
            pcbY={-0.25}
            pcbRotation={180}
            schX={0}
            schY={7}
          />
        </>
      )}
      <capacitor
        {...controlSection}
        {...verticalCapacitorSymbol}
        name="C_VCORE"
        capacitance="470nF"
        footprint="0603"
        pcbX={-18}
        pcbY={-6.5}
        pcbRotation={180}
        schX={2}
        schY={7}
      />
      <capacitor
        {...controlSection}
        {...verticalCapacitorSymbol}
        name="C_VBUS"
        capacitance="4.7uF"
        footprint="0805"
        pcbX={-3.5}
        pcbY={12.5}
        pcbRotation={90}
        schX={4}
        schY={8}
      />
      {!isNativeUsbMspm0 && (
        <capacitor
          {...controlSection}
          {...verticalCapacitorSymbol}
          name="C_V18"
          capacitance="220nF"
          footprint="0603"
          pcbX={-10.3}
          pcbY={12.75}
          pcbRotation={90}
          schX={7}
          schY={8}
        />
      )}
      <capacitor
        {...controlSection}
        {...verticalCapacitorSymbol}
        name="C_VUSB"
        capacitance={isNativeUsbMspm0 ? "100nF" : "220nF"}
        footprint="0603"
        pcbX={-8}
        pcbY={12.75}
        pcbRotation={90}
        schX={10}
        schY={8}
      />
      {!isNativeUsbMspm0 && (
        <resistor
          {...controlSection}
          name="R_USB_PULLUP"
          resistance="1.4k"
          footprint="0402"
          pcbX={-1}
          pcbY={9.5}
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
        pcbX={-13}
        pcbY={9}
        pcbRotation={0}
        schX={2}
        schY={9}
      />
      <capacitor
        {...controlSection}
        {...verticalCapacitorSymbol}
        name="C_MCU_RESET"
        capacitance={isNativeUsbMspm0 ? "10nF" : "2.2nF"}
        footprint="0402"
        pcbX={-15.25}
        pcbY={9}
        pcbRotation={0}
        schX={4}
        schY={10}
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
          pcbX={-8.5}
          pcbY={9.5}
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
                pcbX={0}
                pcbY={-1.5}
                width={2.6}
                height={0.4}
                shape="rect"
              />
              <smtpad
                portHints={["2"]}
                pcbX={0}
                pcbY={0}
                width={2.6}
                height={0.4}
                shape="rect"
              />
              <smtpad
                portHints={["3"]}
                pcbX={0}
                pcbY={1.5}
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
              <courtyardrect pcbX={0} pcbY={0} width={2.8} height={4.9} />
            </footprint>
          }
          cadModel={null}
          pcbX={-8.5}
          pcbY={9.5}
          pcbRotation={90}
          schX={-1}
          schY={-5}
        />
      )}
      <resistor
        {...displaySection}
        name="R_DISPLAY_CS"
        resistance="10k"
        footprint="0402"
        pcbX={10}
        pcbY={12}
        schX={10}
        schY={10}
      />
      <resistor
        {...displaySection}
        name="R_DISPLAY_RESET"
        resistance="10k"
        footprint="0402"
        pcbX={13}
        pcbY={12}
        schX={14}
        schY={10}
      />

      <chip
        {...displaySection}
        name="J_DISPLAY"
        manufacturerPartNumber={screen.connector.mpn}
        footprint={screen.connector.footprint}
        cadModel={{ glbUrl: screen.connector.modelUrl }}
        pinLabels={screen.connector.pinLabels}
        noConnect={isEpaper ? ["NC", "NC_2", "TSCL", "TSDA", "VPP"] : undefined}
        schPortArrangement={displayPortArrangement}
        pcbX={35}
        pcbY={0}
        pcbRotation={-90}
        schX={45}
        schY={1}
        schHeight={displaySchematicHeight}
      />

      {isOled && <OledSupport />}
      {isTft020 && <Tft020Support />}
      {isTft028 && <Tft028Support />}
      {isEpaper && <EpaperSupport />}

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
                "SWCLK",
                "DISPLAY_CS",
                "SPI_CLK",
                "SPI_MOSI",
                "SPI_MISO",
                isEpaper ? "BUSY_N" : "TE",
              ]
            : [
                "VCC_3V3",
                "GND",
                "RESET",
                "TEST",
                "UART_TX",
                "UART_RX",
                "SPI_CLK",
                "SPI_MOSI",
                "SPI_MISO",
                isEpaper ? "BUSY_N" : "TE",
              ]
        }
        pcbPinLabels={
          isNativeUsbMspm0
            ? {
                pin1: "3V3",
                pin2: "G",
                pin3: "RST",
                pin4: "DIO",
                pin5: "CLK",
                pin6: "CS",
                pin7: "SCK",
                pin8: "MO",
                pin9: "MI",
                pin10: isEpaper ? "BSY" : "TE",
              }
            : {
                pin1: "3V3",
                pin2: "G",
                pin3: "RST",
                pin4: "TST",
                pin5: "TX",
                pin6: "RX",
                pin7: "CLK",
                pin8: "MO",
                pin9: "MI",
                pin10: isEpaper ? "BSY" : "TE",
              }
        }
        showSilkscreenPinLabels
        pcbX={-6}
        pcbY={-20}
        pcbOrientation="horizontal"
        schX={0}
        schY={-8}
        schWidth={0.96}
      />

      <hole name="H1" diameter="2.4mm" pcbX={-38} pcbY={23} />
      <hole name="H2" diameter="2.4mm" pcbX={38} pcbY={23} />
      <hole name="H3" diameter="2.4mm" pcbX={-38} pcbY={-23} />
      <hole name="H4" diameter="2.4mm" pcbX={38} pcbY={-23} />

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
          {["C_MCU_DVCC1", "C_MCU_DVCC2", "C_MCU_AVCC"].map(
            (component) => (
              <Fragment key={`${component}-rails`}>
                <trace
                  key={`${component}-vcc`}
                  from={`.${component} > .pin1`}
                  to="net.VCC_3V3"
                />
                <trace
                  key={`${component}-gnd`}
                  from={`.${component} > .pin2`}
                  to="net.GND"
                />
              </Fragment>
            ),
          )}
        </>
      )}
      <trace
        from={p("U_MAIN", controllerPins.vcore)}
        to="net.MSP_VCORE"
      />
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
        from={p("U_MAIN", controllerPins.spiClock)}
        to="net.DISPLAY_SCLK"
        thickness="0.12mm"
      />
      <trace
        from={p("U_MAIN", controllerPins.spiMosi)}
        to="net.DISPLAY_MOSI"
        thickness="0.12mm"
      />
      <trace
        from={p("U_MAIN", controllerPins.spiMiso)}
        to="net.DISPLAY_MISO"
        thickness="0.12mm"
      />
      <trace
        from={p("U_MAIN", controllerPins.displayCs)}
        to="net.DISPLAY_CS_N"
        thickness="0.12mm"
      />
      <trace
        from={p("U_MAIN", controllerPins.displayDc)}
        to="net.DISPLAY_DC"
        thickness="0.12mm"
      />
      <trace
        from={p("U_MAIN", controllerPins.displayReset)}
        to="net.DISPLAY_RESET_N"
        thickness="0.12mm"
      />
      <trace
        from={p(
          "U_MAIN",
          isEpaper ? controllerPins.displayBusy : controllerPins.displayTe,
        )}
        to={isEpaper ? "net.DISPLAY_BUSY_N" : "net.DISPLAY_TE"}
        thickness="0.12mm"
      />
      <trace from=".R_DISPLAY_CS > .pin1" to="net.DISPLAY_CS_N" />
      <trace from=".R_DISPLAY_CS > .pin2" to="net.VCC_3V3" />
      <trace from=".R_DISPLAY_RESET > .pin1" to="net.DISPLAY_RESET_N" />
      <trace from=".R_DISPLAY_RESET > .pin2" to="net.VCC_3V3" />

      {isOled && (
        <>
          {[1, 8, 10, 11, 12, 16, 17, 20, 21, 22, 23, 24, 25, 29, 30].map(
            (pin) => (
              <trace
                key={`oled-gnd-${pin}`}
                from={p("J_DISPLAY", pin)}
                to="net.GND"
              />
            ),
          )}
          {[6, 9].map((pin) => (
            <trace
              key={`oled-vcc-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.VCC_3V3"
            />
          ))}
          <trace from=".J_DISPLAY > .pin2" to=".C_OLED_C2 > .pin1" />
          <trace from=".J_DISPLAY > .pin3" to=".C_OLED_C2 > .pin2" />
          <trace from=".J_DISPLAY > .pin4" to=".C_OLED_C1 > .pin1" />
          <trace from=".J_DISPLAY > .pin5" to=".C_OLED_C1 > .pin2" />
          <trace from=".C_OLED_VBAT > .pin1" to="net.VCC_3V3" />
          <trace from=".C_OLED_VBAT > .pin2" to="net.GND" />
          <trace from=".C_OLED_VDD > .pin1" to="net.VCC_3V3" />
          <trace from=".C_OLED_VDD > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin13" to="net.DISPLAY_CS_N" />
          <trace from=".J_DISPLAY > .pin14" to="net.DISPLAY_RESET_N" />
          <trace from=".J_DISPLAY > .pin15" to="net.DISPLAY_DC" />
          <trace from=".J_DISPLAY > .pin18" to="net.DISPLAY_SCLK" />
          <trace from=".J_DISPLAY > .pin19" to="net.DISPLAY_MOSI" />
          <trace from=".J_DISPLAY > .pin26" to=".R_OLED_IREF > .pin1" />
          <trace from=".R_OLED_IREF > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin27" to=".C_OLED_VCOMH > .pin2" />
          <trace from=".C_OLED_VCOMH > .pin1" to="net.GND" />
          <trace from=".J_DISPLAY > .pin28" to=".C_OLED_VCC > .pin2" />
          <trace from=".C_OLED_VCC > .pin1" to="net.GND" />
        </>
      )}

      {isTft020 && (
        <>
          {[2, 5, 13].map((pin) => (
            <trace
              key={`tft020-gnd-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.GND"
            />
          ))}
          {[10, 11].map((pin) => (
            <trace
              key={`tft020-vcc-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.VCC_3V3"
            />
          ))}
          <trace from=".J_DISPLAY > .pin6" to="net.DISPLAY_RESET_N" />
          <trace from=".J_DISPLAY > .pin7" to="net.DISPLAY_DC" />
          <trace from=".J_DISPLAY > .pin8" to="net.DISPLAY_MOSI" />
          <trace from=".J_DISPLAY > .pin9" to="net.DISPLAY_SCLK" />
          <trace from=".J_DISPLAY > .pin12" to="net.DISPLAY_CS_N" />
          <trace from=".C_TFT_VDD > .pin1" to="net.VCC_3V3" />
          <trace from=".C_TFT_VDD > .pin2" to="net.GND" />
          <trace from=".C_TFT_IOVDD > .pin1" to="net.VCC_3V3" />
          <trace from=".C_TFT_IOVDD > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin4" to="net.BACKLIGHT_ANODE_1" />
          <trace from=".R_BL1 > .pin1" to="net.VBUS5" thickness="0.4mm" />
          <trace
            from=".R_BL1 > .pin2"
            to="net.BACKLIGHT_ANODE_1"
            thickness="0.4mm"
          />
          <trace
            from=".J_DISPLAY > .pin3"
            to="net.BACKLIGHT_CATHODE"
            thickness="0.4mm"
          />
        </>
      )}

      {isTft028 && (
        <>
          {[43, 48, 49, 50].map((pin) => (
            <trace
              key={`tft028-gnd-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.GND"
              thickness="0.4mm"
            />
          ))}
          {[40, 41, 42].map((pin) => (
            <trace
              key={`tft028-vcc-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.VCC_3V3"
              thickness="0.35mm"
            />
          ))}
          <trace from=".J_DISPLAY > .pin6" to="net.GND" />
          {[7, 8, 9].map((pin) => (
            <trace
              key={`tft028-mode-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.VCC_3V3"
            />
          ))}
          <trace from=".J_DISPLAY > .pin10" to="net.DISPLAY_RESET_N" />
          {Array.from({ length: 18 }, (_, index) => index + 15).map((pin) => (
            <trace
              key={`tft028-db-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.GND"
            />
          ))}
          <trace from=".J_DISPLAY > .pin33" to="net.DISPLAY_MISO" />
          <trace from=".J_DISPLAY > .pin34" to="net.DISPLAY_MOSI" />
          <trace from=".J_DISPLAY > .pin35" to="net.VCC_3V3" />
          <trace from=".J_DISPLAY > .pin36" to="net.DISPLAY_DC" />
          <trace from=".J_DISPLAY > .pin37" to="net.DISPLAY_SCLK" />
          <trace from=".J_DISPLAY > .pin38" to="net.DISPLAY_CS_N" />
          <trace from=".J_DISPLAY > .pin39" to="net.DISPLAY_TE" />
          <trace from=".C_TFT_VDDI1 > .pin1" to="net.VCC_3V3" />
          <trace from=".C_TFT_VDDI1 > .pin2" to="net.GND" />
          <trace from=".C_TFT_VDDI2 > .pin1" to="net.VCC_3V3" />
          <trace from=".C_TFT_VDDI2 > .pin2" to="net.GND" />
          <trace from=".C_TFT_VCI > .pin1" to="net.VCC_3V3" />
          <trace from=".C_TFT_VCI > .pin2" to="net.GND" />
          {[2, 3, 4, 5].map((pin, index) => (
            <Fragment key={`tft028-backlight-${pin}`}>
              <trace
                key={`tft028-bl-vbus-${pin}`}
                from={`.R_BL${index + 1} > .pin1`}
                to="net.VBUS5"
                thickness="0.35mm"
              />
              <trace
                key={`tft028-bl-anode-${pin}`}
                from={`.R_BL${index + 1} > .pin2`}
                to={`net.BACKLIGHT_ANODE_${index + 1}`}
                thickness="0.35mm"
              />
              <trace
                key={`tft028-bl-display-${pin}`}
                from={p("J_DISPLAY", pin)}
                to={`net.BACKLIGHT_ANODE_${index + 1}`}
                thickness="0.35mm"
              />
            </Fragment>
          ))}
          <trace
            from=".J_DISPLAY > .pin1"
            to="net.BACKLIGHT_CATHODE"
            thickness="0.5mm"
          />
        </>
      )}

      {isEpaper && (
        <>
          {/* UC8251 datasheet page 53 booster. Panel pins 1, 4, 6, 7, and 19
              stay open: two NCs, the unused external temperature bus, and VPP. */}
          <trace from=".J_DISPLAY > .pin2" to="net.EPD_GDR" />
          <trace from=".Q_EPD_BOOST > .pin1" to="net.EPD_GDR" />
          <trace from=".R_EPD_GATE_PD > .pin1" to="net.EPD_GDR" />
          <trace from=".R_EPD_GATE_PD > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin3" to="net.EPD_RESE" />
          <trace
            from=".Q_EPD_BOOST > .pin2"
            to="net.EPD_RESE"
            thickness="0.35mm"
          />
          <trace
            from=".R_EPD_SENSE > .pin1"
            to="net.EPD_RESE"
            thickness="0.35mm"
          />
          <trace from=".R_EPD_SENSE > .pin2" to="net.GND" thickness="0.35mm" />

          <trace
            from=".L_EPD_BOOST > .pin1"
            to="net.VCC_3V3"
            thickness="0.45mm"
          />
          <trace
            from=".C_EPD_BOOST_IN > .pin1"
            to="net.VCC_3V3"
            thickness="0.45mm"
          />
          <trace
            from=".C_EPD_BOOST_IN > .pin2"
            to="net.GND"
            thickness="0.45mm"
          />
          <trace
            from=".L_EPD_BOOST > .pin2"
            to="net.EPD_SWITCH"
            thickness="0.45mm"
          />
          <trace
            from=".Q_EPD_BOOST > .pin3"
            to="net.EPD_SWITCH"
            thickness="0.45mm"
          />
          <trace
            from=".D_EPD_1 > .pin2"
            to="net.EPD_SWITCH"
            thickness="0.35mm"
          />
          <trace
            from=".C_EPD_FLY > .pin1"
            to="net.EPD_SWITCH"
            thickness="0.35mm"
          />

          <trace from=".D_EPD_1 > .pin1" to="net.EPD_VGH" thickness="0.35mm" />
          <trace from=".J_DISPLAY > .pin21" to="net.EPD_VGH" />
          <trace from=".C_EPD_VGH > .pin1" to="net.EPD_VGH" />
          <trace from=".C_EPD_VGH > .pin2" to="net.GND" />

          <trace
            from=".C_EPD_FLY > .pin2"
            to="net.EPD_PUMP"
            thickness="0.35mm"
          />
          <trace from=".D_EPD_2 > .pin2" to="net.EPD_PUMP" thickness="0.35mm" />
          <trace from=".D_EPD_2 > .pin1" to="net.GND" thickness="0.35mm" />
          <trace from=".D_EPD_3 > .pin1" to="net.EPD_PUMP" thickness="0.35mm" />
          <trace from=".D_EPD_3 > .pin2" to="net.EPD_VGL" thickness="0.35mm" />
          <trace from=".J_DISPLAY > .pin23" to="net.EPD_VGL" />
          <trace from=".C_EPD_VGL > .pin1" to="net.EPD_VGL" />
          <trace from=".C_EPD_VGL > .pin2" to="net.GND" />

          <trace from=".J_DISPLAY > .pin5" to=".C_EPD_VDHR > .pin1" />
          <trace from=".C_EPD_VDHR > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin8" to="net.GND" />
          <trace from=".J_DISPLAY > .pin9" to="net.DISPLAY_BUSY_N" />
          <trace from=".J_DISPLAY > .pin10" to="net.DISPLAY_RESET_N" />
          <trace from=".J_DISPLAY > .pin11" to="net.DISPLAY_DC" />
          <trace from=".J_DISPLAY > .pin12" to="net.DISPLAY_CS_N" />
          <trace from=".J_DISPLAY > .pin13" to="net.DISPLAY_SCLK" />
          <trace from=".J_DISPLAY > .pin14" to="net.DISPLAY_MOSI" />
          {[15, 16].map((pin) => (
            <trace
              key={`epd-vcc-${pin}`}
              from={p("J_DISPLAY", pin)}
              to="net.VCC_3V3"
              thickness="0.35mm"
            />
          ))}
          <trace from=".J_DISPLAY > .pin17" to="net.GND" thickness="0.35mm" />
          <trace from=".J_DISPLAY > .pin18" to=".C_EPD_VDDD > .pin1" />
          <trace from=".C_EPD_VDDD > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin20" to=".C_EPD_VSH > .pin1" />
          <trace from=".C_EPD_VSH > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin22" to=".C_EPD_VSL > .pin1" />
          <trace from=".C_EPD_VSL > .pin2" to="net.GND" />
          <trace from=".J_DISPLAY > .pin24" to=".C_EPD_VCOM > .pin1" />
          <trace from=".C_EPD_VCOM > .pin2" to="net.GND" />
          <trace from=".C_EPD_VDD > .pin1" to="net.VCC_3V3" />
          <trace from=".C_EPD_VDD > .pin2" to="net.GND" />
          <trace from=".C_EPD_VDD_HF > .pin1" to="net.VCC_3V3" />
          <trace from=".C_EPD_VDD_HF > .pin2" to="net.GND" />
        </>
      )}

      {(isTft020 || isTft028) && (
        <>
          <trace
            from={p("U_MAIN", controllerPins.backlightPwm)}
            to="net.BACKLIGHT_PWM"
          />
          <trace from=".R_BL_GATE > .pin1" to="net.BACKLIGHT_PWM" />
          <trace from=".R_BL_GATE > .pin2" to="net.BACKLIGHT_GATE" />
          <trace from=".R_BL_GATE_PD > .pin1" to="net.BACKLIGHT_GATE" />
          <trace from=".R_BL_GATE_PD > .pin2" to="net.GND" />
          <trace from=".Q_BL > .pin1" to="net.BACKLIGHT_GATE" />
          <trace from=".Q_BL > .pin2" to="net.GND" thickness="0.5mm" />
          <trace
            from=".Q_BL > .pin3"
            to="net.BACKLIGHT_CATHODE"
            thickness="0.5mm"
          />
        </>
      )}

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
      <trace
        from=".J_DEBUG > .pin5"
        to={p(
          "U_MAIN",
          isNativeUsbMspm0 ? mspm0UsbLqfp64Pins.swclk : f5529.uartTx,
        )}
      />
      <trace
        from=".J_DEBUG > .pin6"
        to={isNativeUsbMspm0 ? "net.DISPLAY_CS_N" : p("U_MAIN", f5529.uartRx)}
      />
      <trace from=".J_DEBUG > .pin7" to="net.DISPLAY_SCLK" />
      <trace from=".J_DEBUG > .pin8" to="net.DISPLAY_MOSI" />
      <trace from=".J_DEBUG > .pin9" to="net.DISPLAY_MISO" />
      <trace
        from=".J_DEBUG > .pin10"
        to={isEpaper ? "net.DISPLAY_BUSY_N" : "net.DISPLAY_TE"}
      />

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
        text="QUICK CONFIGURE • SCREEN"
        pcbX={0}
        pcbY={24}
        fontSize="0.72mm"
      />
      <silkscreentext
        text={screen.id.toUpperCase()}
        pcbX={15}
        pcbY={22.5}
        fontSize="0.58mm"
      />
      <silkscreentext
        text={`${screen.connector.mpn} • 4-WIRE SPI`}
        pcbX={18}
        pcbY={-24}
        fontSize="0.55mm"
      />
      <silkscreentext
        text="2L • BOTTOM GND POUR"
        pcbX={-18}
        pcbY={-24}
        fontSize="0.48mm"
      />
    </board>
  );
};
