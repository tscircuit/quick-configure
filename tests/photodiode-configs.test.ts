import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { connectors, mcus } from "../src/board-data"

const projectRoot = join(import.meta.dir, "..")

describe("MSPM33 photodiode target", () => {
  test("uses the exact MSPM33C321A RGZ device and datasheet pin map", () => {
    const mcu = mcus.mspm33c321a

    expect(mcu.manufacturerPartNumber).toBe("MSPM33C321ASRGZR")
    expect(mcu.footprint).toBe(
      "kicad:Package_DFN_QFN/VQFN-48-1EP_7x7mm_P0.5mm_EP4.1x4.1mm",
    )
    expect(mcu.pinCount).toBe(49)
    expect(mcu.adcPin).toBe(47)
    expect(mcu.uartTxPin).toBe(18)
    expect(mcu.uartRxPin).toBe(19)
    expect(mcu.resetPin).toBe(4)
    expect(mcu.vccPins).toEqual([6, 31])
    expect(mcu.gndPins).toEqual([49])
    expect(mcu.swdPins).toEqual({ dataPin: 34, clockPin: 35 })
    expect(mcu.vbatPin).toBe(5)
    expect(mcu.vcorePin).toBe(48)
    expect(mcu.vrefPins).toEqual({ positivePin: 43, negativePin: 39 })
    expect(mcu.bslInvokePin).toBe(33)
    expect(mcu.pinLabels.pin47).toContain("ADC0_0")
    expect(mcu.pinLabels.pin49).toContain("VSS")
  })

  test("has one MSPM33 wrapper for every photodiode connector", async () => {
    for (const connector of Object.keys(connectors)) {
      const wrapper = Bun.file(
        join(
          projectRoot,
          `${connector}__mspm33c321a__photodiode.circuit.tsx`,
        ),
      )

      expect(await wrapper.exists()).toBe(true)
      expect(await wrapper.text()).toContain(
        `<PhotodiodeBoard connector="${connector}" mcu="mspm33c321a" />`,
      )
    }
  })

  test("ships the viewer and fabrication bundle for every connector", async () => {
    const artifacts = [
      "3d.glb",
      "3d.png",
      "pcb.svg",
      "schematic.svg",
      "resources/altium-project.zip",
      "resources/gerbers.zip",
      "resources/kicad-project.zip",
      "resources/schematic.pdf",
    ]

    for (const connector of Object.keys(connectors)) {
      for (const artifact of artifacts) {
        const file = Bun.file(
          join(
            projectRoot,
            "public",
            "viewer",
            `${connector}__mspm33c321a__photodiode`,
            artifact,
          ),
        )

        expect(await file.exists()).toBe(true)
        expect(file.size).toBeGreaterThan(0)
      }
    }
  })

  test("implements TI's power, reset, BSL, and SWD requirements", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "PhotodiodeBoard.tsx"),
    ).text()

    for (const component of [
      'name="C_MAIN_2" capacitance="100nF"',
      'name="C_MSPM33_VDD_BULK" capacitance="10uF"',
      'name="C_MSPM33_VBAT" capacitance="1uF"',
      'name="C_MSPM33_VCORE" capacitance="2.2uF"',
      'name="C_MSPM33_VREF" capacitance="1uF"',
      'name="C_MSPM33_RESET" capacitance="10nF"',
      'name="R_MSPM33_BSL" resistance="47k"',
    ]) {
      expect(source).toContain(component)
    }

    expect(source).toContain('to="net.MSPM33_VCORE"')
    expect(source).toContain('to="net.MSPM33_BSL_INVOKE"')
    expect(source).toContain('name="V_MSPM33_EP_1"')
    expect(source).toContain('name="V_MSPM33_EP_4"')
    expect(source).toContain('["VCC_3V3", "GND", "RESET", "ADC_IN", "SWDIO", "SWCLK"]')
  })

  test("exposes the MSPM33 in the selector", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()

    expect(html).toContain('<option value="mspm33c321a">')
    expect(html).toContain('mspm33c321a:{label:"TI MSPM33C321A"')
  })
})
