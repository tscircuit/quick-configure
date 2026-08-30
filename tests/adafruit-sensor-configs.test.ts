import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { expectedConfigurationIds } from "../scripts/configuration-ids"
import {
  adafruitSensorIds,
  adafruitSensors,
  mspm0SensorController,
} from "../src/adafruit-sensor-data"

const projectRoot = join(import.meta.dir, "..")

describe("Adafruit sensor catalog", () => {
  test("keeps the selected store-rank order and exact Adafruit product IDs", () => {
    expect(Object.keys(adafruitSensors)).toEqual([...adafruitSensorIds])
    expect(adafruitSensorIds).toEqual([
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
    ])
    expect(
      adafruitSensorIds.map((id) => adafruitSensors[id].adafruitProductId),
    ).toEqual([4754, 1782, 2472, 5665, 5776, 2809, 4438, 4566, 5396, 4162])
  })

  test("preserves each product page, datasheet, and supported I2C address set", () => {
    expect(
      adafruitSensorIds.map((id) => adafruitSensors[id].productUrl),
    ).toEqual([
      "https://www.adafruit.com/product/4754",
      "https://www.adafruit.com/product/1782",
      "https://www.adafruit.com/product/2472",
      "https://www.adafruit.com/product/5665",
      "https://www.adafruit.com/product/5776",
      "https://www.adafruit.com/product/2809",
      "https://www.adafruit.com/product/4438",
      "https://www.adafruit.com/product/4566",
      "https://www.adafruit.com/product/5396",
      "https://www.adafruit.com/product/4162",
    ])

    expect(
      adafruitSensorIds.map((id) => [
        adafruitSensors[id].defaultI2cAddress,
        ...adafruitSensors[id].alternateI2cAddresses,
      ]),
    ).toEqual([
      ["0x4A", "0x4B"],
      ["0x18", "0x19", "0x1A", "0x1B", "0x1C", "0x1D", "0x1E", "0x1F"],
      ["0x28", "0x29"],
      ["0x44"],
      ["0x44"],
      ["0x18", "0x19"],
      ["0x6A", "0x6B"],
      ["0x38"],
      ["0x29"],
      ["0x10"],
    ])

    for (const id of adafruitSensorIds) {
      expect(adafruitSensors[id].datasheetUrl).toMatch(/^https:\/\//)
      expect(adafruitSensors[id].interface).toBe("I²C")
    }
  })

  test("uses the JLCPCB-listed MSPM0G3507 for every new configuration", async () => {
    expect(mspm0SensorController).toEqual({
      id: "mspm0g3507",
      displayName: "TI MSPM0G3507",
      manufacturerPartNumber: "MSPM0G3507SPMR",
      supplierPartNumber: "C22389960",
    })

    for (const id of adafruitSensorIds) {
      const configurationId = `usb-c__mspm0g3507__${id}`
      const wrapper = Bun.file(
        join(projectRoot, `${configurationId}.circuit.tsx`),
      )

      expect(expectedConfigurationIds).toContain(configurationId)
      expect(await wrapper.exists()).toBe(true)
      expect(await wrapper.text()).toContain(
        `<Mspm0SensorBoard sensor="${id}" />`,
      )
    }
  })
})
