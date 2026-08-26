import erOled096ModelUrl from "./models/er-oled096-1-3w.glb"
import erTft020ModelUrl from "./models/er-tft020-3.glb"
import erTft028ModelUrl from "./models/er-tft028a2-4.glb"
import {
  screenModelSpecs,
  type ScreenId,
} from "./screen-model-specs"

export type { ScreenId } from "./screen-model-specs"

export interface ScreenDefinition {
  id: ScreenId
  displayName: string
  productName: string
  sku: string
  technology: "OLED" | "IPS TFT"
  controller: "SSD1306" | "ST7789" | "ILI9341"
  interface: "4-wire SPI"
  resolution: `${number}×${number}`
  description: string
  productUrl: string
  datasheetUrl: string
  connector: {
    mpn: string
    positionCount: 14 | 30 | 50
    pitch: "0.5 mm"
    contactSide: "top" | "bottom"
    mounting: "horizontal SMT"
    footprint: string
    modelUrl: string
    pinLabels: Record<string, string>
  }
}

const oledPinLabels = {
  pin1: "NC_GND",
  pin2: "C2P",
  pin3: "C2N",
  pin4: "C1P",
  pin5: "C1N",
  pin6: "VBAT",
  pin7: "NC",
  pin8: "VSS",
  pin9: "VDD",
  pin10: "BS0",
  pin11: "BS1",
  pin12: "BS2",
  pin13: "CS_N",
  pin14: "RESET_N",
  pin15: "DC",
  pin16: "RW_N",
  pin17: "E_RD_N",
  pin18: "D0_SCLK",
  pin19: "D1_MOSI",
  pin20: "D2",
  pin21: "D3",
  pin22: "D4",
  pin23: "D5",
  pin24: "D6",
  pin25: "D7",
  pin26: "IREF",
  pin27: "VCOMH",
  pin28: "VCC_OLED",
  pin29: "VLSS",
  pin30: "NC_GND_2",
  pin31: "MP1",
  pin32: "MP2",
} as const

const tft020PinLabels = {
  pin1: "NC",
  pin2: "GND",
  pin3: "LED_N",
  pin4: "LED_P",
  pin5: "GND_2",
  pin6: "RESET_N",
  pin7: "DC",
  pin8: "MOSI",
  pin9: "SCLK",
  pin10: "VDD",
  pin11: "IOVDD",
  pin12: "CS_N",
  pin13: "GND_3",
  pin14: "NC_2",
  pin15: "MP1",
  pin16: "MP2",
} as const

const tft028PinLabels = Object.fromEntries([
  "LEDK",
  "LEDA1",
  "LEDA2",
  "LEDA3",
  "LEDA4",
  "IM0",
  "IM1",
  "IM2",
  "IM3",
  "RESET_N",
  "VSYNC",
  "HSYNC",
  "DOTCLK",
  "DE",
  ...Array.from({ length: 18 }, (_, index) => `DB${17 - index}`),
  "MISO",
  "MOSI",
  "RD_N",
  "DC",
  "SCLK",
  "CS_N",
  "TE",
  "VDDI",
  "VDDI_2",
  "VCI",
  "GND",
  "TOUCH_XP",
  "TOUCH_YP",
  "TOUCH_XN",
  "TOUCH_YN",
  "GND_2",
  "GND_3",
  "GND_4",
  "MP1",
  "MP2",
].map((label, index) => [`pin${index + 1}`, label]))

const modelUrls: Record<ScreenId, string> = {
  "er-oled096-1-3w": erOled096ModelUrl,
  "er-tft020-3": erTft020ModelUrl,
  "er-tft028a2-4": erTft028ModelUrl,
}

export const screens: Record<ScreenId, ScreenDefinition> = {
  "er-oled096-1-3w": {
    id: "er-oled096-1-3w",
    displayName: '0.96″ OLED · ER-OLED0.96-1.3W',
    productName: "ER-OLED0.96-1.3W Display Board",
    sku: "OLED096",
    technology: "OLED",
    controller: "SSD1306",
    interface: "4-wire SPI",
    resolution: "128×64",
    description:
      "A raw 0.96-inch white OLED panel with its SSD1306 charge-pump support circuit and matching 30-position top-contact ZIF connector.",
    productUrl:
      "https://www.buydisplay.com/128x64-oled-i2c-0-96-display-white-color-connector-fpc-ssd1306",
    datasheetUrl:
      "https://www.buydisplay.com/download/manual/ER-OLED0.96-1_Series_Datasheet.pdf",
    connector: {
      mpn: "ER-CON30HT-1",
      positionCount: 30,
      pitch: "0.5 mm",
      contactSide: "top",
      mounting: "horizontal SMT",
      footprint: screenModelSpecs["er-oled096-1-3w"].connectorModel,
      modelUrl: modelUrls["er-oled096-1-3w"],
      pinLabels: oledPinLabels,
    },
  },
  "er-tft020-3": {
    id: "er-tft020-3",
    displayName: '2.0″ IPS TFT · ER-TFT020-3',
    productName: "ER-TFT020-3 Display Board",
    sku: "TFT020",
    technology: "IPS TFT",
    controller: "ST7789",
    interface: "4-wire SPI",
    resolution: "240×320",
    description:
      "A compact 2.0-inch IPS color display with an ST7789 SPI interface, PWM backlight control, and matching 14-position bottom-contact ZIF connector.",
    productUrl:
      "https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc",
    datasheetUrl:
      "https://www.buydisplay.com/download/manual/ER-TFT020-3_Datasheet.pdf",
    connector: {
      mpn: "ER-CON14HB-1",
      positionCount: 14,
      pitch: "0.5 mm",
      contactSide: "bottom",
      mounting: "horizontal SMT",
      footprint: screenModelSpecs["er-tft020-3"].connectorModel,
      modelUrl: modelUrls["er-tft020-3"],
      pinLabels: tft020PinLabels,
    },
  },
  "er-tft028a2-4": {
    id: "er-tft028a2-4",
    displayName: '2.8″ IPS TFT · ER-TFT028A2-4',
    productName: "ER-TFT028A2-4 Display Board",
    sku: "TFT028",
    technology: "IPS TFT",
    controller: "ILI9341",
    interface: "4-wire SPI",
    resolution: "240×320",
    description:
      "A popular 2.8-inch IPS color panel configured for ILI9341 four-wire SPI, with PWM backlight control and matching 50-position top-contact ZIF connector.",
    productUrl:
      "https://www.buydisplay.com/2-8-inch-240x320-ips-tft-lcd-display-panel-optional-touch-panel-wide-view",
    datasheetUrl:
      "https://www.buydisplay.com/download/manual/ER-TFT028A2-4_Datasheet.pdf",
    connector: {
      mpn: "ER-CON50HT-1",
      positionCount: 50,
      pitch: "0.5 mm",
      contactSide: "top",
      mounting: "horizontal SMT",
      footprint: screenModelSpecs["er-tft028a2-4"].connectorModel,
      modelUrl: modelUrls["er-tft028a2-4"],
      pinLabels: tft028PinLabels,
    },
  },
}
