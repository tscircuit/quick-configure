import { describe, expect, test } from "bun:test"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { expectedConfigurationIds } from "../scripts/configuration-ids"

const projectRoot = join(import.meta.dir, "..")
const adafruitIds = [
  "adafruit-bno085",
  "adafruit-mcp9808",
  "adafruit-bno055",
  "adafruit-sht45",
  "adafruit-sht41",
  "adafruit-lis3dh",
  "adafruit-lsm6dsox",
  "adafruit-aht20",
  "adafruit-vl53l4cd",
  "adafruit-veml7700",
] as const

const productIds = [4754, 1782, 2472, 5665, 5776, 2809, 4438, 4566, 5396, 4162]

describe("Adafruit sensor selector", () => {
  test("exposes the ten ranked boards in the documented order", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()
    const positions = adafruitIds.map((id) => {
      const marker = `<option value="${id}">`
      expect(html).toContain(marker)
      return html.indexOf(marker)
    })

    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(html).toContain("35 selectable designs")
    expect(html).toContain("BNO085 MSPM0 Orientation Sensor Board")
    expect(html).toContain("This Adafruit-selected sensor configuration")
    expect(html).toContain("Source product page")
    for (const productId of productIds) {
      expect(html).toContain(
        `productUrl:"https://www.adafruit.com/product/${productId}"`,
      )
    }
  })

  test("keeps each controller family on generated configurations only", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()

    expect(html).toContain('<option value="mspm0g3507">TI MSPM0G3507')
    expect(html).toContain(
      'Object.fromEntries(adafruitSensorIds.map(sensor=>[sensor,{connector:"usb-c",mcu:"mspm0g3507"}]))',
    )
    expect(html).toContain(
      "adafruitSensorIds.map(sensor=>`usb-c__mspm0g3507__${sensor}`)",
    )
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__msp430f5529__${sensor}`)",
    )
    expect(html).toContain(
      "screenIds.map(screen=>`usb-c__msp430f5529__${screen}`)",
    )
    expect(html).toContain("mspm0Option.disabled=!isAdafruit")
    expect(html).toContain("photodiodeControllerIds.includes(mcuSelect.value)")
    expect(html).not.toContain(
      "Object.keys(controllers).map(controller=>`${connector}__${controller}__photodiode`)",
    )
  })

  test("rejects an unavailable key before constructing viewer URLs", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()
    const start = html.indexOf("function loadBoard()")
    const end = html.indexOf("function setView", start)
    const loadBoard = html.slice(start, end)

    expect(start).toBeGreaterThan(-1)
    expect(
      loadBoard.indexOf("if(!availableConfigurations.has(key))"),
    ).toBeLessThan(loadBoard.indexOf("base=`./viewer/${key}`"))
    expect(loadBoard).toContain("return}")
    expect(loadBoard).toContain("link.download=`${boardKey()}.glb`")
  })
})

describe("Adafruit selection documentation", () => {
  test("records the dated store-rank methodology and sourcing", async () => {
    const readme = await Bun.file(join(projectRoot, "README.md")).text()

    expect(readme).toContain(
      "Selected 2026-08-29 from Adafruit's live default Sensors category merchandising",
    )
    expect(readme).toContain("reproducible store-rank proxy")
    expect(readme).toContain("https://www.adafruit.com/category/35")
    expect(readme).toContain("MSPM0G3507SPMR")
    expect(readme).toContain("C22389960")
    expect(readme).toContain("**35 selectable configurations**")
    for (const productId of productIds) {
      expect(readme).toContain(`https://www.adafruit.com/product/${productId}`)
    }
  })
})

describe("Static deployment assets", () => {
  test("publishes every selectable board and its downloads", async () => {
    const siteIndex = await Bun.file(
      join(projectRoot, "site", "index.html"),
    ).text()
    const publicIndex = await Bun.file(
      join(projectRoot, "public", "index.html"),
    ).text()
    expect(publicIndex).toBe(siteIndex)

    const viewerRoot = join(projectRoot, "public", "viewer")
    const deployedBoardIds = (
      await readdir(viewerRoot, { withFileTypes: true })
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
    expect(deployedBoardIds).toEqual([...expectedConfigurationIds].sort())

    const requiredFiles = [
      "3d.glb",
      "3d.png",
      "pcb.svg",
      "schematic.svg",
      "resources/gerbers.zip",
      "resources/schematic.pdf",
      "resources/kicad-project.zip",
      "resources/altium-project.zip",
    ]
    for (const boardId of expectedConfigurationIds) {
      for (const requiredFile of requiredFiles) {
        const artifact = Bun.file(join(viewerRoot, boardId, requiredFile))
        expect(await artifact.exists()).toBe(true)
        expect(artifact.size).toBeGreaterThan(0)
      }
    }
  })
})
