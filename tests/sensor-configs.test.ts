import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { BME280 } from "../imports/BME280/BME280"
import { MLX90640ESF_BAA_000_TU } from "../imports/MLX90640ESF_BAA_000_TU/MLX90640ESF_BAA_000_TU"
import { MPU_6050 } from "../imports/MPU_6050/MPU_6050"
import { sensors, type SensorId } from "../src/sensor-data"

const projectRoot = join(import.meta.dir, "..")
const ids = Object.keys(sensors) as SensorId[]

describe("sensor catalog", () => {
  test("hardcodes the three requested I2C sensors", () => {
    expect(ids).toEqual(["bme280", "mpu6050", "mlx90640"])
    expect(ids.map((id) => sensors[id].manufacturerPartNumber)).toEqual([
      "BME280",
      "MPU-6050",
      "MLX90640ESF-BAA-000-TU",
    ])
    expect(ids.map((id) => sensors[id].defaultI2cAddress)).toEqual([
      "0x76",
      "0x68",
      "0x33",
    ])
    expect(ids.map((id) => sensors[id].supplierPartNumber)).toEqual([
      "C92489",
      "C24112",
      "C17380659",
    ])
  })

  test("describes every requested sensing capability", () => {
    expect(sensors.bme280.capabilities).toEqual([
      "Relative humidity",
      "Temperature",
      "Barometric pressure",
    ])
    expect(sensors.mpu6050.capabilities).toEqual([
      "3-axis accelerometer",
      "3-axis gyroscope",
    ])
    expect(sensors.mlx90640.capabilities).toEqual([
      "32×24 far-infrared array",
      "110°×75° field of view",
    ])
  })

  test("uses exact imported footprints, pin maps, and 3D models", async () => {
    const bme = BME280({ name: "U_TEST" }) as any
    const mpu = MPU_6050({ name: "U_TEST" }) as any
    const mlx = MLX90640ESF_BAA_000_TU({ name: "U_TEST" }) as any

    expect(bme.props.pinLabels.pin3).toContain("SDI")
    expect(bme.props.pinLabels.pin4).toContain("SCK")
    expect(bme.props.supplierPartNumbers.jlcpcb).toEqual(["C92489"])

    expect(mpu.props.pinLabels.pin23).toContain("SCL")
    expect(mpu.props.pinLabels.pin24).toContain("SDA")
    expect(mpu.props.pinLabels.pin12).toContain("INT")
    expect(mpu.props.supplierPartNumbers.jlcpcb).toEqual(["C24112"])

    expect(mlx.props.pinLabels.pin1).toContain("SDA")
    expect(mlx.props.pinLabels.pin4).toContain("SCL")
    expect(mlx.props.supplierPartNumbers.jlcpcb).toEqual(["C17380659"])

    for (const path of [
      "imports/BME280/BME280.step",
      "imports/BME280/BME280.obj",
      "imports/MPU_6050/MPU_6050.step",
      "imports/MPU_6050/MPU_6050.obj",
      "imports/MLX90640ESF_BAA_000_TU/MLX90640ESF_BAA_000_TU.step",
      "imports/MLX90640ESF_BAA_000_TU/MLX90640ESF_BAA_000_TU.obj",
    ]) {
      const model = Bun.file(join(projectRoot, path))
      expect(await model.exists()).toBe(true)
      expect(model.size).toBeGreaterThan(10_000)
    }
  })
})

describe("sensor reference boards", () => {
  test("has USB-C MSP430F5529 and MSPM0G51x wrappers per sensor", async () => {
    for (const id of ids) {
      const msp430Wrapper = Bun.file(
        join(projectRoot, `usb-c__msp430f5529__${id}.circuit.tsx`),
      )
      expect(await msp430Wrapper.exists()).toBe(true)
      expect(await msp430Wrapper.text()).toContain(`<SensorBoard sensor="${id}" />`)
      for (const controller of ["mspm0g5117", "mspm0g5187"] as const) {
        const mspm0Wrapper = Bun.file(
          join(projectRoot, `usb-c__${controller}__${id}.circuit.tsx`),
        )
        expect(await mspm0Wrapper.exists()).toBe(true)
        expect(await mspm0Wrapper.text()).toContain(
          `<SensorBoard controller="${controller}" sensor="${id}" />`,
        )
      }
    }
  })

  test("keeps common I2C pull-ups and the requested sensor support circuits", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "SensorBoard.tsx"),
    ).text()

    expect(source).toContain('name="R_I2C_SDA"')
    expect(source).toContain('name="R_I2C_SCL"')
    expect(source).toContain(
      'sensorId === "mlx90640" ? "1k" : "4.7k"',
    )
    expect(source).toContain('name="C_SENSOR_VDDIO"')
    expect(source).toContain('name="C_SENSOR_VLOGIC"')
    expect(source).toContain('capacitance="10nF"')
    expect(source).toContain('name="C_SENSOR_REGOUT"')
    expect(source).toContain('name="C_SENSOR_CPOUT"')
    expect(source).toContain('name="C_SENSOR_BULK"')
    expect(source).toContain('capacitance="10uF"')
    expect(source).toContain('to="net.SENSOR_INT"')
  })

  test("keeps every explicit sensor-board rotation orthogonal", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "SensorBoard.tsx"),
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

    expect(rotationExpressions.length).toBeGreaterThan(10)
    expect(rotations.every(Number.isFinite)).toBe(true)
    expect(rotations.every((rotation) => rotation % 90 === 0)).toBe(true)
  })

  test("exposes every sensor with all generated controller variants", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text()

    for (const id of ids) {
      expect(html).toContain(`<option value="${id}">`)
    }
    expect(html).toContain("peripheralChoiceIds")
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__msp430f5529__${sensor}`)",
    )
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__mspm0g5117__${sensor}`)",
    )
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__mspm0g5187__${sensor}`)",
    )
  })
})
