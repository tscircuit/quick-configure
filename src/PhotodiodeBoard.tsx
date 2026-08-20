import { cloneElement } from "react"
import { SmdUsbC } from "@tsci/seveibar.smd-usb-c"
import { connectors, mcus, type ConnectorId, type McuId } from "./board-data"

export interface PhotodiodeBoardProps {
  connector: ConnectorId
  mcu: McuId
}

const LeftEdgeUsbC = (props: Parameters<typeof SmdUsbC>[0]) =>
  cloneElement(SmdUsbC(props), {
    cadModel: {
      objUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=2a4bc2358b36497d9ab2a66ab6419ba3&pn=C165948",
      rotationOffset: { x: 0, y: 0, z: 180 },
      positionOffset: { x: -2.5, y: 0, z: 0 },
    },
  })

const ch552tPinLabels = mcus.ch552t.pinLabels

const opa320Pins = {
  pin1: "OUT",
  pin2: "VNEG",
  pin3: "NONINV",
  pin4: "INV",
  pin5: "VPOS",
} as const

const usblc6Pins = {
  pin1: "DP_PORT",
  pin2: "GND",
  pin3: "DM_PORT",
  pin4: "DM_MCU",
  pin5: "VBUS",
  pin6: "DP_MCU",
} as const

const ldoPins = {
  pin1: "IN",
  pin2: "GND",
  pin3: "EN",
  pin4: "NC",
  pin5: "OUT",
} as const

const p = (component: string, pin: number) => `.${component} > .pin${pin}`

const interfaceSection = { schSectionName: "Interface" } as const
const controlSection = { schSectionName: "Control" } as const
const analogSection = { schSectionName: "Analog" } as const

export const PhotodiodeBoard = ({ connector, mcu: mcuId }: PhotodiodeBoardProps) => {
  const mcu = mcus[mcuId]
  const connectorInfo = connectors[connector]
  const isUsb = connector !== "jst-sh"
  const needsUsbBridge = isUsb && !mcu.nativeUsb
  const usbController = needsUsbBridge ? "U_USB" : "U_MAIN"
  const usbDpPin = needsUsbBridge ? 14 : mcu.nativeUsb?.dpPin
  const usbDmPin = needsUsbBridge ? 15 : mcu.nativeUsb?.dmPin
  const mainX = needsUsbBridge ? 0 : -4
  const isLargeMcu = mcuId === "msp430f5529"
  const mainDecouplingX = isLargeMcu ? -11.5 : mainX
  const mainDecouplingY = isLargeMcu ? 12 : -7.2
  const resetX = isLargeMcu ? -8.5 : mainX + 3
  const resetY = isLargeMcu ? 12 : -7.2
  const boardWidth = isLargeMcu ? 62 : 56
  const boardHeight = isLargeMcu ? 34 : 30
  const connectorX = isLargeMcu
    ? -26.5
    : connector === "usb-c"
      ? -23
      : -23.8
  const boardTitle = `${connectorInfo.displayName} + ${mcu.displayName}`

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
      <schematicsection name="Analog" displayName="Photodiode Analog Front End" />

      {connector === "usb-c" && (
        <LeftEdgeUsbC
          {...interfaceSection}
          name="J1"
          pcbX={connectorX}
          pcbY={0}
          pcbRotation={-90}
          schX={-14}
          schY={5}
        />
      )}

      {connector === "usb-micro" && (
        <chip
          {...interfaceSection}
          name="J1"
          manufacturerPartNumber="10118194-0001LF"
          footprint="kicad:Connector_USB/USB_Micro-B_Amphenol_10118194-0001LF_Horizontal"
          pinLabels={{
            pin1: "VBUS",
            pin2: "USB_DM",
            pin3: "USB_DP",
            pin4: "ID",
            pin5: "GND",
          }}
          pcbX={connectorX}
          pcbY={0}
          pcbRotation={90}
          schX={-14}
          schY={5}
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
          pcbY={0}
          pcbRotation={90}
          schX={-14}
          schY={5}
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
            pcbX={-17}
            pcbY={9.5}
            pcbRotation={-90}
            schX={-10}
            schY={5}
          />
          <chip
            {...interfaceSection}
            name="U_LDO"
            manufacturerPartNumber="TLV75533PDBVR"
            footprint="kicad:Package_TO_SOT_SMD/SOT-23-5"
            pinLabels={ldoPins}
            pcbX={-15.5}
            pcbY={-5}
            pcbRotation={90}
            schX={-10}
            schY={-4}
          />
          <capacitor
            {...interfaceSection}
            name="C_LDO_IN"
            capacitance="1uF"
            footprint="0603"
            pcbX={-19}
            pcbY={-9.5}
            schX={-12}
            schY={-6}
          />
          <capacitor
            {...interfaceSection}
            name="C_LDO_OUT"
            capacitance="1uF"
            footprint="0603"
            pcbX={-12}
            pcbY={-8}
            schX={-8}
            schY={-6}
          />
        </>
      )}

      {connector === "usb-c" && (
        <>
          <resistor {...interfaceSection} name="R_CC1" resistance="5.1k" footprint="0402" pcbX={-21} pcbY={11.5} schX={-13} schY={8} />
          <resistor {...interfaceSection} name="R_CC2" resistance="5.1k" footprint="0402" pcbX={-18} pcbY={12.2} schX={-11} schY={8} />
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
            pcbX={-10.5}
            pcbY={3}
            pcbRotation={180}
            schX={-5}
            schY={3}
          />
          <capacitor {...controlSection} name="C_USB" capacitance="100nF" footprint="0402" pcbX={-10.5} pcbY={8.5} schX={-5} schY={6.5} />
          <capacitor {...controlSection} name="C_USB_V33" capacitance="100nF" footprint="0402" pcbX={-7} pcbY={8.5} schX={-3} schY={6.5} />
          <resistor {...controlSection} name="R_USB_RST" resistance="100k" footprint="0402" pcbX={-14} pcbY={8.5} schX={-7} schY={6.5} />
        </>
      )}

      <chip
        {...controlSection}
        name="U_MAIN"
        manufacturerPartNumber={mcu.manufacturerPartNumber}
        supplierPartNumbers={mcu.supplierPartNumbers}
        footprint={mcu.footprint}
        pinLabels={mcu.pinLabels}
        pcbX={mainX}
        pcbY={1.5}
        pcbRotation={mcu.pinCount >= 48 ? 45 : 180}
        schX={1}
        schY={1}
      />

      <capacitor {...controlSection} name="C_MAIN" capacitance="100nF" footprint="0402" pcbX={mainDecouplingX} pcbY={mainDecouplingY} pcbRotation={isLargeMcu ? 90 : 0} schX={1} schY={6.5} />
      <resistor
        {...controlSection}
        name="R_RESET"
        resistance={mcuId === "ch552t" ? "100k" : "47k"}
        footprint="0402"
        pcbX={resetX}
        pcbY={resetY}
        schX={3.5}
        schY={6.5}
      />

      {mcuId === "ch552t" && (
        <capacitor {...controlSection} name="C_MAIN_V33" capacitance="100nF" footprint="0402" pcbX={mainX - 3} pcbY={-7.2} schX={-1.5} schY={6.5} />
      )}

      {mcuId === "msp430f5529" && (
        <>
          <capacitor {...controlSection} name="C_VCORE" capacitance="470nF" footprint="0603" pcbX={-5.5} pcbY={12} pcbRotation={90} schX={-1} schY={8} />
          <capacitor {...controlSection} name="C_V18" capacitance="1uF" footprint="0603" pcbX={-2.5} pcbY={12} pcbRotation={90} schX={1} schY={8} />
          <capacitor {...controlSection} name="C_VUSB" capacitance="220nF" footprint="0603" pcbX={0.5} pcbY={12} pcbRotation={90} schX={3} schY={8} />
          <resistor {...controlSection} name="R_USB_PULLUP" resistance="1.4k" footprint="0402" pcbX={3.5} pcbY={12} schX={-1} schY={9.5} />
        </>
      )}

      <chip
        {...analogSection}
        name="U_OPA"
        manufacturerPartNumber="OPA320AIDBVR"
        supplierPartNumbers={{ jlcpcb: ["C92494"] }}
        footprint="kicad:Package_TO_SOT_SMD/SOT-23-5"
        pinLabels={opa320Pins}
        pcbX={12.5}
        pcbY={2}
        pcbRotation={90}
        schX={8}
        schY={0}
      />

      <diode
        {...analogSection}
        name="D_PHOTO"
        photo
        manufacturerPartNumber="BPX 65"
        footprint="kicad:Package_TO_SOT_THT/TO-18-2_Lens"
        pinLabels={{ pin1: "anode", pin2: "cathode" }}
        doNotPlace
        pcbX={22}
        pcbY={1.5}
        pcbRotation={90}
        schX={14}
        schY={0}
      />

      <capacitor {...analogSection} name="C_OPA" capacitance="100nF" footprint="0402" pcbX={12.5} pcbY={6} schX={8} schY={4} />
      <resistor {...analogSection} name="R_REF_TOP" resistance="56k" footprint="0402" pcbX={8} pcbY={-5.2} schX={6} schY={-4} />
      <resistor {...analogSection} name="R_REF_BOTTOM" resistance="10k" footprint="0402" pcbX={11} pcbY={-5.2} schX={8} schY={-4} />
      <capacitor {...analogSection} name="C_REF" capacitance="1uF" footprint="0603" pcbX={14} pcbY={-7.5} schX={10} schY={-4} />
      <resistor {...analogSection} name="R_FB" resistance="330k" footprint="0402" pcbX={16} pcbY={6.5} schX={11} schY={2} />
      <capacitor {...analogSection} name="C_FB" capacitance="10pF" footprint="0402" pcbX={16} pcbY={4.7} schX={11} schY={3} />
      <resistor {...analogSection} name="R_ADC" resistance="100" footprint="0402" pcbX={8} pcbY={1.5} schX={5} schY={0} />
      <capacitor {...analogSection} name="C_ADC" capacitance="1nF" footprint="0402" pcbX={8} pcbY={-1} schX={5} schY={-2} />

      <pinheader
        {...controlSection}
        name="J_DEBUG"
        pinCount={6}
        pitch="2.54mm"
        gender="unpopulated"
        doNotPlace
        pinLabels={["VCC_3V3", "GND", "RESET", "ADC_IN", "UART_TX", "UART_RX"]}
        pcbPinLabels={{ pin1: "3V3", pin2: "G", pin3: "RST", pin4: "ADC", pin5: "TX", pin6: "RX" }}
        showSilkscreenPinLabels
        pcbX={0}
        pcbY={-12}
        pcbOrientation="horizontal"
        schX={1}
        schY={-9}
      />

      <testpoint {...analogSection} name="TP_VREF" footprintVariant="pad" padDiameter="1.5mm" pcbX={15.5} pcbY={-9.5} schX={10} schY={-7} />
      <testpoint {...analogSection} name="TP_TIA" footprintVariant="pad" padDiameter="1.5mm" pcbX={19} pcbY={-9.5} schX={12} schY={-7} />
      <hole name="H1" diameter="2.4mm" pcbX={-(boardWidth / 2 - 3)} pcbY={boardHeight / 2 - 3} />
      <hole name="H2" diameter="2.4mm" pcbX={boardWidth / 2 - 3} pcbY={-(boardHeight / 2 - 3)} />
      <hole name="H3" diameter="2.4mm" pcbX={boardWidth / 2 - 3} pcbY={boardHeight / 2 - 3} />
      <hole name="H4" diameter="2.4mm" pcbX={-(boardWidth / 2 - 3)} pcbY={-(boardHeight / 2 - 3)} />

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
          <trace from=".J1 > .pin6" to="net.USB_CC1" />
          <trace from=".R_CC1 > .pin1" to="net.USB_CC1" />
          <trace from=".R_CC1 > .pin2" to="net.GND" />
          <trace from=".J1 > .pin12" to="net.USB_CC2" />
          <trace from=".R_CC2 > .pin1" to="net.USB_CC2" />
          <trace from=".R_CC2 > .pin2" to="net.GND" />
          <trace from=".J1 > .pin8" to="net.USB_DP_PORT" thickness="0.25mm" />
          <trace from=".J1 > .pin10" to="net.USB_DP_PORT" thickness="0.25mm" />
          <trace from=".J1 > .pin7" to="net.USB_DM_PORT" thickness="0.25mm" />
          <trace from=".J1 > .pin9" to="net.USB_DM_PORT" thickness="0.25mm" />
        </>
      )}

      {connector === "usb-micro" && (
        <>
          <trace from=".J1 > .pin1" to="net.VBUS5" thickness="0.5mm" />
          <trace from=".J1 > .pin5" to="net.GND" thickness="0.5mm" />
          <trace from=".J1 > .pin3" to="net.USB_DP_PORT" thickness="0.25mm" />
          <trace from=".J1 > .pin2" to="net.USB_DM_PORT" thickness="0.25mm" />
        </>
      )}

      {isUsb && usbDpPin && usbDmPin && (
        <>
          <trace from=".U_ESD > .pin1" to="net.USB_DP_PORT" thickness="0.25mm" />
          <trace from=".U_ESD > .pin3" to="net.USB_DM_PORT" thickness="0.25mm" />
          <trace from=".U_ESD > .pin6" to="net.USB_DP_MCU" thickness="0.25mm" />
          <trace from=".U_ESD > .pin4" to="net.USB_DM_MCU" thickness="0.25mm" />
          <trace from={p(usbController, usbDpPin)} to="net.USB_DP_MCU" thickness="0.25mm" />
          <trace from={p(usbController, usbDmPin)} to="net.USB_DM_MCU" thickness="0.25mm" />
          <trace from=".U_ESD > .pin5" to="net.VBUS5" />
          <trace from=".U_ESD > .pin2" to="net.GND" />
          <trace from=".U_LDO > .pin1" to="net.VBUS5" thickness="0.4mm" />
          <trace from=".U_LDO > .pin3" to="net.VBUS5" />
          <trace from=".U_LDO > .pin2" to="net.GND" />
          <trace from=".U_LDO > .pin5" to="net.VCC_3V3" thickness="0.4mm" />
          <trace from=".C_LDO_IN > .pin1" to="net.VBUS5" />
          <trace from=".C_LDO_IN > .pin2" to="net.GND" />
          <trace from=".C_LDO_OUT > .pin1" to="net.VCC_3V3" />
          <trace from=".C_LDO_OUT > .pin2" to="net.GND" />
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
            pcbRouteHints={mcuId === "msp430fr5994" ? [{ x: -13, y: 4 }, { x: -2, y: 4 }] : undefined}
          />
        </>
      )}

      {needsUsbBridge && (
        <>
          <trace from=".U_USB > .pin19" to="net.VCC_3V3" thickness="0.4mm" />
          <trace from=".U_USB > .pin18" to="net.GND" thickness="0.4mm" />
          <trace from=".U_USB > .pin20" to="net.USB_BRIDGE_V33" />
          <trace from=".C_USB > .pin1" to="net.VCC_3V3" />
          <trace from=".C_USB > .pin2" to="net.GND" />
          <trace from=".C_USB_V33 > .pin1" to="net.USB_BRIDGE_V33" />
          <trace from=".C_USB_V33 > .pin2" to="net.GND" />
          <trace from=".U_USB > .pin6" to="net.USB_BRIDGE_RESET" />
          <trace from=".R_USB_RST > .pin1" to="net.USB_BRIDGE_RESET" />
          <trace from=".R_USB_RST > .pin2" to="net.GND" />
          <trace from=".U_USB > .pin9" to="net.UART_MAIN_RX" />
          <trace from=".U_USB > .pin10" to="net.UART_MAIN_TX" />
        </>
      )}

      {mcu.vccPins.map((pin) => (
        <trace key={`vcc-${pin}`} from={p("U_MAIN", pin)} to="net.VCC_3V3" thickness="0.35mm" />
      ))}
      {mcu.gndPins.map((pin) => (
        <trace key={`gnd-${pin}`} from={p("U_MAIN", pin)} to="net.GND" thickness="0.35mm" />
      ))}
      <trace from=".C_MAIN > .pin1" to="net.VCC_3V3" />
      <trace from=".C_MAIN > .pin2" to="net.GND" />
      <trace from={p("U_MAIN", mcu.resetPin)} to="net.MAIN_RESET" />
      <trace from=".R_RESET > .pin1" to="net.MAIN_RESET" />
      <trace from=".R_RESET > .pin2" to={mcuId === "ch552t" ? "net.GND" : "net.VCC_3V3"} />
      <trace from={p("U_MAIN", mcu.uartTxPin)} to="net.UART_MAIN_TX" />
      <trace from={p("U_MAIN", mcu.uartRxPin)} to="net.UART_MAIN_RX" />

      {mcuId === "ch552t" && (
        <>
          <trace from=".U_MAIN > .pin20" to="net.MAIN_V33" />
          <trace from=".C_MAIN_V33 > .pin1" to="net.MAIN_V33" />
          <trace from=".C_MAIN_V33 > .pin2" to="net.GND" />
        </>
      )}

      {mcuId === "msp430f5529" && (
        <>
          <trace from=".U_MAIN > .pin39" to="net.MSP_VCORE" />
          <trace from=".C_VCORE > .pin1" to="net.MSP_VCORE" />
          <trace from=".C_VCORE > .pin2" to="net.GND" />
          <trace from=".U_MAIN > .pin74" to="net.MSP_V18" />
          <trace from=".C_V18 > .pin1" to="net.MSP_V18" />
          <trace from=".C_V18 > .pin2" to="net.GND" />
          <trace from=".U_MAIN > .pin75" to="net.MSP_VUSB" />
          <trace from=".C_VUSB > .pin1" to="net.MSP_VUSB" />
          <trace from=".C_VUSB > .pin2" to="net.GND" />
          <trace from=".U_MAIN > .pin78" to="net.MSP_USB_PUR" />
          <trace from=".R_USB_PULLUP > .pin1" to="net.MSP_USB_PUR" />
          <trace from=".R_USB_PULLUP > .pin2" to="net.USB_DP_MCU" />
          {isUsb && <trace from=".U_MAIN > .pin76" to="net.VBUS5" />}
        </>
      )}

      <trace from=".U_OPA > .pin5" to="net.VCC_3V3" />
      <trace from=".U_OPA > .pin2" to="net.GND" />
      <trace from=".C_OPA > .pin1" to="net.VCC_3V3" />
      <trace from=".C_OPA > .pin2" to="net.GND" />
      <trace from=".R_REF_TOP > .pin1" to="net.VCC_3V3" />
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
      <trace from=".C_FB > .pin2" to="net.TIA_OUT" />
      <trace from=".U_OPA > .pin1" to="net.TIA_OUT" />
      <trace from=".R_ADC > .pin1" to="net.TIA_OUT" />
      <trace from=".R_ADC > .pin2" to="net.ADC_IN" />
      <trace from=".C_ADC > .pin1" to="net.ADC_IN" />
      <trace from=".C_ADC > .pin2" to="net.GND" />
      <trace from={p("U_MAIN", mcu.adcPin)} to="net.ADC_IN" />

      <trace from=".J_DEBUG > .pin1" to="net.VCC_3V3" />
      <trace from=".J_DEBUG > .pin2" to="net.GND" />
      <trace from=".J_DEBUG > .pin3" to="net.MAIN_RESET" />
      <trace from=".J_DEBUG > .pin4" to="net.ADC_IN" />
      <trace from=".J_DEBUG > .pin5" to="net.UART_MAIN_TX" />
      <trace from=".J_DEBUG > .pin6" to="net.UART_MAIN_RX" />
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

      <silkscreentext text={boardTitle} pcbX={7} pcbY={boardHeight / 2 - 1.6} fontSize="0.78mm" />
      <silkscreentext text="BPX65 + OPA320" pcbX={16.5} pcbY={-12.4} fontSize="0.65mm" />
      <silkscreentext text="4L • GND / 3V3 PLANES" pcbX={8.5} pcbY={-13.5} fontSize="0.48mm" />
      {needsUsbBridge && <silkscreentext text="CH552 USB BRIDGE" pcbX={-10.5} pcbY={10.8} fontSize="0.55mm" />}
    </board>
  )
}
