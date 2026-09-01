import { describe, expect, test } from "bun:test"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { expectedConfigurationIds } from "../scripts/configuration-ids"
import { mcus } from "../src/board-data"
import { screens } from "../src/screen-data"
import {
  screenModelSpecs,
  type ScreenId,
} from "../src/screen-model-specs"

const projectRoot = join(import.meta.dir, "..")
const ids = Object.keys(screens) as ScreenId[]

describe("screen catalog", () => {
  test("hardcodes the four selected panels and their exact connector mates", () => {
    expect(ids).toEqual([
      "er-epd0213-2b",
      "er-oled096-1-3w",
      "er-tft020-3",
      "er-tft028a2-4",
    ])

    expect(
      ids.map((id) => [
        screens[id].connector.mpn,
        screens[id].connector.positionCount,
        screens[id].connector.contactSide,
      ]),
    ).toEqual([
      ["ER-CON24HT-1", 24, "top"],
      ["ER-CON30HT-1", 30, "top"],
      ["ER-CON14HB-1", 14, "bottom"],
      ["ER-CON50HT-1", 50, "top"],
    ])
  })

  test("keeps every electrical contact plus two mechanical pads in the footprint map", () => {
    for (const id of ids) {
      const screen = screens[id]
      expect(Object.keys(screen.connector.pinLabels)).toHaveLength(
        screen.connector.positionCount + 2,
      )
      expect(screen.connector.pitch).toBe("0.5 mm")
      expect(screen.connector.footprint).toBe(
        screenModelSpecs[id].connectorModel,
      )
    }
  })

  test("preserves the critical SPI pin mappings", () => {
    expect(screens["er-epd0213-2b"].connector.pinLabels.pin9).toBe(
      "BUSY_N",
    )
    expect(screens["er-epd0213-2b"].connector.pinLabels.pin13).toBe(
      "SCLK",
    )
    expect(screens["er-epd0213-2b"].connector.pinLabels.pin14).toBe(
      "MOSI",
    )
    expect(screens["er-oled096-1-3w"].connector.pinLabels.pin18).toBe(
      "D0_SCLK",
    )
    expect(screens["er-oled096-1-3w"].connector.pinLabels.pin19).toBe(
      "D1_MOSI",
    )
    expect(screens["er-tft020-3"].connector.pinLabels.pin8).toBe("MOSI")
    expect(screens["er-tft020-3"].connector.pinLabels.pin9).toBe("SCLK")
    expect(screens["er-tft028a2-4"].connector.pinLabels.pin34).toBe("MOSI")
    expect(screens["er-tft028a2-4"].connector.pinLabels.pin37).toBe("SCLK")
  })
})

describe("generated assets and variants", () => {
  test("the source manifest contains exactly the 72 selectable circuits", async () => {
    const rootCircuits = (await readdir(projectRoot))
      .filter((filename) => filename.endsWith(".circuit.tsx"))
      .map((filename) => filename.replace(".circuit.tsx", ""))
      .sort()

    expect(expectedConfigurationIds).toHaveLength(72)
    expect(rootCircuits).toEqual(expectedConfigurationIds)
  })

  for (const id of ids) {
    test(`${id} has a generated GLB and root circuit`, async () => {
      const model = Bun.file(
        join(projectRoot, "src", "models", screenModelSpecs[id].outputFilename),
      )
      const msp430Wrapper = Bun.file(
        join(projectRoot, `usb-c__msp430f5529__${id}.circuit.tsx`),
      )
      expect(await model.exists()).toBe(true)
      expect(model.size).toBeGreaterThan(100_000)
      expect(new TextDecoder().decode((await model.arrayBuffer()).slice(0, 4))).toBe(
        "glTF",
      )
      expect(await msp430Wrapper.exists()).toBe(true)
      for (const controller of ["mspm0g5117", "mspm0g5187"] as const) {
        const mspm0Wrapper = Bun.file(
          join(projectRoot, `usb-c__${controller}__${id}.circuit.tsx`),
        )
        expect(await mspm0Wrapper.exists()).toBe(true)
        expect(await mspm0Wrapper.text()).toContain(
          `<ScreenBoard controller="${controller}" screen="${id}" />`,
        )
      }
    })
  }

  test("uses the corrected MSP430F5529 USB and SPI-capable pins", () => {
    const mcu = mcus.msp430f5529
    expect(mcu.nativeUsb).toEqual({ dpPin: 62, dmPin: 64 })
    expect(mcu.resetPin).toBe(76)
    expect(mcu.vccPins).toEqual([11, 18, 50])
    expect(mcu.gndPins).toEqual([14, 19, 49, 61, 68])
    expect(mcu.pinLabels.pin37).toContain("UCB0SIMO")
    expect(mcu.pinLabels.pin39).toContain("UCB0CLK")
  })

  test("implements the UC8251 external booster and normal-operation straps", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "ScreenBoard.tsx"),
    ).text()
    const compactSource = source.replace(/\s+/g, " ")

    for (const part of [
      "FTC252012S100MBCA",
      "SI1308EDL-T1-GE3",
      "MBR0530T1G",
      "FRL1206FR470TS",
      "CL21B105KBFNNNE",
      "CL31B475KAHNNNE",
    ]) {
      expect(source).toContain(part)
    }
    expect(source).toContain('resistance="0.47"')
    expect(source).toContain('inductance="10uH"')
    expect(source).toContain('name="C_EPD_FLY"')
    expect(source).toContain('name="C_EPD_BOOST_IN"')
    expect(source).toContain('name="R_EPD_GATE_PD"')
    expect(source).toContain('capacitance="4.7uF"')
    expect(source).toContain(`const epaperMosfetPins = {
  pin1: "GATE",
  pin2: "SOURCE",
  pin3: "DRAIN",
}`)
    expect(source).toContain(
      '<trace from=".Q_EPD_BOOST > .pin1" to="net.EPD_GDR" />',
    )
    expect(compactSource).toContain(
      '<trace from=".Q_EPD_BOOST > .pin2" to="net.EPD_RESE" thickness="0.35mm" />',
    )
    expect(source).toContain(
      'noConnect={isEpaper ? ["NC", "NC_2", "TSCL", "TSDA", "VPP"] : undefined}',
    )
    expect(source).toContain(
      '<trace from=".J_DISPLAY > .pin8" to="net.GND" />',
    )
  })

  test("keeps every explicit screen-board rotation orthogonal", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "ScreenBoard.tsx"),
    ).text()
    const rotationExpressions = [
      ...source.matchAll(/pcbRotation=\{([^}]+)\}/g),
    ].map(([, value]) => value.trim())
    const rotations = rotationExpressions.flatMap((expression) => {
      if (/^-?\d+(?:\.\d+)?$/.test(expression)) {
        return [Number(expression)]
      }

      const conditional = expression.match(
        /\?\s*(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)$/,
      )
      expect(conditional).not.toBeNull()
      return conditional ? [Number(conditional[1]), Number(conditional[2])] : []
    })

    expect(rotationExpressions.length).toBeGreaterThan(0)
    expect(rotations.every(Number.isFinite)).toBe(true)
    expect(rotations.every((rotation) => rotation % 90 === 0)).toBe(true)
  })

  test("the selector exposes only the four pre-generated screen keys", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()
    for (const id of ids) {
      expect(html).toContain(`<option value="${id}">`)
    }
    expect(html).toContain("72 selectable designs")
    expect(html).toContain("usb-c__msp430f5529__${screen}")
    expect(html).toContain("usb-c__mspm0g5117__${screen}")
    expect(html).toContain("usb-c__mspm0g5187__${screen}")
    expect(html).toContain("availableConfigurations")
  })
})
