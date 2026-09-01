import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { expectedConfigurationIds } from "../scripts/configuration-ids";
import {
  mspm0SensorController,
  mspm0SensorIds,
  mspm0Sensors,
} from "../src/mspm0-sensor-data";

const projectRoot = join(import.meta.dir, "..");

describe("MSPM0 sensor catalog", () => {
  test("keeps the ten sensor configurations in their intended order", () => {
    expect(Object.keys(mspm0Sensors)).toEqual([...mspm0SensorIds]);
    expect(mspm0SensorIds).toEqual([
      "bno085",
      "mcp9808",
      "bno055",
      "sht45",
      "sht41",
      "lis3dh",
      "lsm6dsox",
      "aht20",
      "vl53l4cd",
      "veml7700",
    ]);
  });

  test("preserves each sensor part, datasheet, and supported I2C address set", () => {
    expect(
      mspm0SensorIds.map((id) => mspm0Sensors[id].sensorPartNumber),
    ).toEqual([
      "BNO085",
      "MCP9808T-E/MS",
      "BNO055",
      "SHT45-AD1B-R2",
      "SHT41-AD1B-R2",
      "LIS3DHTR",
      "LSM6DSOXTR",
      "AHT20",
      "VL53L4CDV0DH/1",
      "VEML7700-TR",
    ]);
    expect(
      mspm0SensorIds.map((id) => [
        mspm0Sensors[id].defaultI2cAddress,
        ...mspm0Sensors[id].alternateI2cAddresses,
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
    ]);

    for (const id of mspm0SensorIds) {
      expect(mspm0Sensors[id].datasheetUrl).toMatch(/^https:\/\//);
      expect(mspm0Sensors[id].interface).toBe("I²C");
    }
  });

  test("uses the JLCPCB-listed MSPM0G3507 for every existing configuration", async () => {
    expect(mspm0SensorController).toEqual({
      id: "mspm0g3507",
      displayName: "TI MSPM0G3507",
      manufacturerPartNumber: "MSPM0G3507SPMR",
      supplierPartNumber: "C22389960",
    });

    for (const id of mspm0SensorIds) {
      const configurationId = `usb-c__mspm0g3507__${id}`;
      const wrapper = Bun.file(
        join(projectRoot, `${configurationId}.circuit.tsx`),
      );

      expect(expectedConfigurationIds).toContain(configurationId);
      expect(await wrapper.exists()).toBe(true);
      expect(await wrapper.text()).toContain(
        `<Mspm0SensorBoard sensor="${id}" />`,
      );
    }
  });

  test("adds native-USB MSPM0G51x variants for every configuration", async () => {
    for (const controller of ["mspm0g5117", "mspm0g5187"] as const) {
      for (const id of mspm0SensorIds) {
        const configurationId = `usb-c__${controller}__${id}`;
        const wrapper = Bun.file(
          join(projectRoot, `${configurationId}.circuit.tsx`),
        );

        expect(expectedConfigurationIds).toContain(configurationId);
        expect(await wrapper.exists()).toBe(true);
        expect(await wrapper.text()).toContain(
          `<Mspm0SensorBoard controller="${controller}" sensor="${id}" />`,
        );
      }
    }
  });
});
