import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const projectRoot = join(import.meta.dir, "..");

const section = (source: string, start: string, end: string) => {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);

  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex).replace(/\s+/g, " ");
};

describe("MSPM0 sensor board source", () => {
  test("keeps the existing red solder mask across every board family", async () => {
    for (const filename of [
      "PhotodiodeBoard.tsx",
      "SensorBoard.tsx",
      "ScreenBoard.tsx",
      "Mspm0SensorBoard.tsx",
    ]) {
      const source = await Bun.file(join(projectRoot, "src", filename)).text();
      const solderMaskColors = [
        ...source.matchAll(/solderMaskColor="([^"]+)"/g),
      ].map(([, color]) => color);

      expect(solderMaskColors).toEqual(["red"]);
    }
  });

  test("uses the stocked MSPM0G3507 package and complete common support chain", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "Mspm0SensorBoard.tsx"),
    ).text();
    const packageJson = JSON.parse(
      await Bun.file(join(projectRoot, "package.json")).text(),
    ) as {
      dependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    const modelGenerator = await Bun.file(
      join(projectRoot, "scripts", "generate-mspm0-model.ts"),
    ).text();
    const ch340n = await Bun.file(
      join(projectRoot, "imports", "CH340N.tsx"),
    ).text();
    const model = Bun.file(
      join(projectRoot, "src", "models", "mspm0g3507spmr.glb"),
    );

    expect(source).toContain(
      'import { MSPM0G3507SPMR, TLV75533PDBVR } from "@tsci/tscircuit.ti"',
    );
    expect(packageJson.dependencies?.["@tsci/tscircuit.ti"]).toBeDefined();
    expect(source).toContain("<MSPM0G3507SPMR");
    expect(source).toContain('supplierPartNumbers={{ jlcpcb: ["C22389960"] }}');
    expect(source).toContain('footprint="lqfp64_w10_h10_p0.5mm"');
    expect(source).toContain(
      'cadModel={{ glbUrl: "./src/models/mspm0g3507spmr.glb" }}',
    );
    expect(packageJson.scripts?.models).toContain(
      "scripts/generate-mspm0-model.ts",
    );
    expect(modelGenerator).toContain(
      'getJscadModelForFootprint("lqfp64_w10_h10_p0.5mm",',
    );
    expect(modelGenerator).toContain("convertJscadModelToGltf");
    expect(ch340n).toContain('manufacturerPartNumber="CH340N"');
    expect(ch340n).toContain('"C506813"');
    expect(ch340n).toContain('pin1: ["UD_POS"]');
    expect(ch340n).toContain('pin2: ["UD_NEG"]');
    expect(ch340n).toContain('pin6: ["TXD"]');
    expect(ch340n).toContain('pin7: ["RXD"]');
    expect(model.size).toBeGreaterThan(1_000_000);
    expect(model.size).toBeLessThan(2_000_000);
    expect(
      new TextDecoder().decode((await model.arrayBuffer()).slice(0, 4)),
    ).toBe("glTF");

    for (const requiredSource of [
      "<SmdUsbC",
      'manufacturerPartNumber="USBLC6-2SC6"',
      'footprint="sot23_6"',
      "<TLV75533PDBVR",
      "<CH340N",
      'name="C_USB_UART_VCC"',
      'name="C_USB_UART_V33"',
      'name="R_USB_DP_LINK"',
      'name="R_USB_DM_LINK"',
      'name="R_USB_VBUS_TOP_LINK"',
      'name="R_USB_VBUS_BOTTOM_LINK"',
      'name="V_ESD_GND_RETURN"',
      'name="esd-ground-stub"',
      'name="C_MCU_VDD"',
      'name="C_MCU_BULK"',
      'name="C_MCU_VCORE"',
      'name="R_MCU_ROSC"',
      'manufacturerPartNumber="PTFR0402B100KP9"',
      'supplierPartNumbers={{ jlcpcb: ["C478863"] }}',
      'name="R_MCU_RESET"',
      'name="C_MCU_RESET"',
      'name="R_I2C_SDA"',
      'name="R_I2C_SCL"',
      'name="R_MCU_I2C_SDA_LINK"',
      'name="R_MCU_I2C_SCL_LINK"',
      'name="usb-dp-port-tie"',
      'name="usb-dm-port-tie"',
      'name="usb-dp-device"',
      'name="usb-dm-device"',
      'name="usb-dp-uart"',
      'name="usb-dm-uart"',
      'name="J_SWD"',
      'pitch="1.27mm"',
      "doubleRow",
      'holeDiameter="0.65mm"',
      'platedDiameter="1mm"',
      'name="R_SWD_GND_LINK"',
      'name="swd-ground-1-to-2"',
      'name="swd-ground-2-to-detect"',
      'name="swd-ground-detect-to-link"',
    ]) {
      expect(source).toContain(requiredSource);
    }

    expect(source).toContain(
      '<trace from={port("U_USB_UART", "V3")} to="net.VCC_3V3" />',
    );
    expect(source).toContain(
      '<trace from=".C_USB_UART_V33 > .pin1" to="net.VCC_3V3" />',
    );
    expect(source).not.toContain("net.USB_UART_V33");
    expect(source).not.toContain("net.USB_UART_RESET");
    expect(source).not.toContain('footprint="kicad:');
  });

  test("keeps the verified MSPM0 power, reset, debug, I2C, UART, and sensor pins", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "Mspm0SensorBoard.tsx"),
    ).text();
    const pinBlock = section(source, "const mspm0g3507Pins = {", "} as const");

    expect(pinBlock).toContain("swdio: 12");
    expect(pinBlock).toContain("swclk: 13");
    expect(pinBlock).toContain("vcore: 32");
    expect(pinBlock).toContain("reset: 38");
    expect(pinBlock).toContain("vdd: 40");
    expect(pinBlock).toContain("vss: 41");
    expect(pinBlock).toContain("rosc: 42");
    expect(pinBlock).toContain("sensorInterrupt: 47");
    expect(pinBlock).toContain("sensorReset: 48");
    expect(pinBlock).toContain("i2cScl: 50");
    expect(pinBlock).toContain("i2cSda: 51");
    expect(pinBlock).toContain("uartTx: 56");
    expect(pinBlock).toContain("uartRx: 57");

    for (const pinUse of [
      'mspm0Pins.vdd)} to="net.VCC_3V3"',
      'mspm0Pins.vss)} to="net.GND"',
      'mspm0Pins.vcore)} to="net.MSPM0_VCORE"',
      'mspm0Pins.rosc)} to=".R_MCU_ROSC > .pin1"',
      'mspm0Pins.reset)} to="net.MAIN_RESET"',
      'mspm0g3507Pins.uartTx)} to="net.UART_MSP_TX"',
      'mspm0g3507Pins.uartRx)} to="net.UART_MSP_RX"',
      'mspm0Pins.i2cSda)} to="net.MCU_I2C_SDA_LOCAL"',
      'mspm0Pins.i2cScl)} to="net.MCU_I2C_SCL_LOCAL"',
      'mspm0Pins.sensorInterrupt)} to="net.SENSOR_INT"',
      'mspm0Pins.sensorReset)} to="net.SENSOR_RESET"',
      "mspm0Pins.swdio)} />",
      "mspm0Pins.swclk)} />",
    ]) {
      expect(source.replace(/\s+/g, " ")).toContain(pinUse);
    }
  });

  test("implements all ten sensor selections and their required support parts", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "Mspm0SensorBoard.tsx"),
    ).text();

    const sensorCases = {
      bno085: "Bno085Circuit",
      mcp9808: "Mcp9808Circuit",
      bno055: "Bno055Circuit",
      sht45: 'Sht4xCircuit sensor="sht45"',
      sht41: 'Sht4xCircuit sensor="sht41"',
      lis3dh: "Lis3dhCircuit",
      lsm6dsox: "Lsm6dsoxCircuit",
      aht20: "Aht20Circuit",
      vl53l4cd: "Vl53l4cdCircuit",
      veml7700: "Veml7700Circuit",
    } as const;

    for (const [sensorId, circuit] of Object.entries(sensorCases)) {
      expect(source).toContain(`case "${sensorId}":`);
      expect(source).toContain(`<${circuit} />`);
    }

    const bno085 = section(
      source,
      "const Bno085Circuit",
      "const Mcp9808Circuit",
    );
    for (const support of [
      "<BNO085",
      'name="C_SENSOR_VDD"',
      'name="C_SENSOR_VDDIO"',
      'name="C_SENSOR_CAP"',
      'name="C_SENSOR_XIN"',
      'name="C_SENSOR_XOUT"',
      "<SensorCrystal",
      'name="R_SENSOR_RESET"',
      'name="R_SENSOR_BOOT"',
      'name="R_SENSOR_CS"',
      'name="R_SENSOR_ADDR"',
      'name="R_SENSOR_HUB_SCL" resistance="2.2k"',
      'name="R_SENSOR_HUB_SDA" resistance="2.2k"',
      'port("U_SENSOR", "INT_N")',
      'port("U_SENSOR", "PS0_WAKE")',
      'port("U_SENSOR", "PS1")',
      'port("U_SENSOR", "CLKSEL0")',
      'port("U_SENSOR", "SENSOR_HUB_SCL")',
      'port("U_SENSOR", "SENSOR_HUB_SDA")',
    ]) {
      expect(bno085.replace(/\s+/g, " ")).toContain(support);
    }

    const mcp9808 = section(
      source,
      "const Mcp9808Circuit",
      "const Bno055Circuit",
    );
    for (const support of [
      "<MCP9808T_E_MS",
      'name="C_SENSOR_VDD"',
      'name="R_SENSOR_ALERT"',
      'name="R_SENSOR_ADDR0"',
      'name="R_SENSOR_ADDR1"',
      'name="R_SENSOR_ADDR2"',
    ]) {
      expect(mcp9808).toContain(support);
    }

    const bno055 = section(source, "const Bno055Circuit", "const Sht4xCircuit");
    for (const support of [
      "<BNO055",
      'name="C_SENSOR_VDD"',
      'name="C_SENSOR_VDDIO"',
      'name="C_SENSOR_CAP"',
      'name="C_SENSOR_XIN"',
      'name="C_SENSOR_XOUT"',
      "<SensorCrystal",
      'name="R_SENSOR_RESET"',
      'name="R_SENSOR_BOOT"',
      'name="R_SENSOR_ADDR"',
      'name="R_SENSOR_VDD_LINK" resistance="0"',
      'name="R_SENSOR_VDDIO_LINK" resistance="0"',
      'name="R_SENSOR_GND5_LINK" resistance="0"',
      "net.BNO055_VDD_LOCAL",
      "net.BNO055_VDDIO_LOCAL",
      "net.BNO055_GND5_LOCAL",
      'name="C_SENSOR_CAP" capacitance="1uF"',
      'name="R_SENSOR_ADDR" resistance="4.7k"',
    ]) {
      expect(bno055).toContain(support);
    }
    expect(bno055).not.toContain('port("U_SENSOR", "SWCLK")');

    const sht4x = section(source, "const Sht4xCircuit", "const Lis3dhCircuit");
    expect(sht4x).toContain("SHT41_AD1B_R2");
    expect(sht4x).toContain("SHT45_AD1B_R2");
    expect(sht4x).toContain('<keepout shape="rect"');
    expect(sht4x).toContain('name="C_SENSOR_VDD"');
    for (const routedLink of [
      'name="R_SENSOR_VDD_LINK" resistance="0"',
      'name="R_SENSOR_GND_LINK" resistance="0"',
      'name="R_SENSOR_SDA_LINK" resistance="0"',
      'name="R_SENSOR_SCL_LINK" resistance="0"',
      "net.SHT_VDD_LOCAL",
      "net.SHT_GND_LOCAL",
      "net.SHT_SDA_LOCAL",
      "net.SHT_SCL_LOCAL",
    ]) {
      expect(sht4x).toContain(routedLink);
    }

    const lis3dh = section(
      source,
      "const Lis3dhCircuit",
      "const Lsm6dsoxCircuit",
    );
    expect(lis3dh).toContain("<LIS3DHTR");
    expect(lis3dh).toContain('name="C_SENSOR_VDD"');
    expect(lis3dh).toContain('name="C_SENSOR_BULK" capacitance="10uF"');
    expect(lis3dh).toContain('name="R_SENSOR_CS"');
    expect(lis3dh).toContain('name="R_SENSOR_ADDR" resistance="2.2k"');
    expect(lis3dh).toContain('port("U_SENSOR", "INT1")');

    const lsm6dsox = section(
      source,
      "const Lsm6dsoxCircuit",
      "const Aht20Circuit",
    );
    expect(lsm6dsox).toContain("<LSM6DSOXTR");
    expect(lsm6dsox).toContain('name="C_SENSOR_VDD"');
    expect(lsm6dsox).toContain('name="C_SENSOR_VDDIO"');
    expect(lsm6dsox).toContain('name="C_SENSOR_BULK"');
    expect(lsm6dsox).toContain('name="R_SENSOR_CS"');
    expect(lsm6dsox).toContain('name="R_SENSOR_ADDR"');
    expect(lsm6dsox).toContain('port("U_SENSOR", "INT1")');
    expect(lsm6dsox).toContain('port("U_SENSOR", "SDX")');
    expect(lsm6dsox).toContain('port("U_SENSOR", "SCX")');

    const aht20 = section(
      source,
      "const Aht20Circuit",
      "const Vl53l4cdCircuit",
    );
    expect(aht20).toContain("<AHT20");
    expect(aht20).toContain('<keepout shape="rect"');
    expect(aht20).toContain('name="C_SENSOR_VDD"');
    expect(aht20).toContain('name="C_SENSOR_BULK"');
    for (const routedLink of [
      'name="R_SENSOR_VDD_LINK" resistance="0"',
      'name="R_SENSOR_GND_LINK" resistance="0"',
      'name="R_SENSOR_SDA_LINK" resistance="0"',
      'name="R_SENSOR_SCL_LINK" resistance="0"',
      "net.AHT_VDD_LOCAL",
      "net.AHT_GND_LOCAL",
      "net.AHT_SDA_LOCAL",
      "net.AHT_SCL_LOCAL",
    ]) {
      expect(aht20).toContain(routedLink);
    }

    const vl53l4cd = section(
      source,
      "const Vl53l4cdCircuit",
      "const Veml7700Circuit",
    );
    expect(vl53l4cd).toContain("<VL53L4CDV0DH_1");
    expect(vl53l4cd).toContain('name="C_SENSOR_VDD"');
    expect(vl53l4cd).toContain('name="C_SENSOR_BULK"');
    expect(vl53l4cd).toContain('name="R_SENSOR_RESET"');
    expect(vl53l4cd).toContain('name="R_SENSOR_INT"');
    expect(vl53l4cd).toContain('port("U_SENSOR", "XSHUT")');
    expect(vl53l4cd).toContain('port("U_SENSOR", "GPIO1")');

    const veml7700 = section(
      source,
      "const Veml7700Circuit",
      "const SensorCircuit",
    );
    expect(veml7700).toContain("<VEML7700_TR");
    expect(veml7700).toContain('name="C_SENSOR_VDD"');
  });

  test("preserves corrected imported pin maps and SHT4x copper rules", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "Mspm0SensorBoard.tsx"),
    ).text();
    const lis3dh = await Bun.file(
      join(projectRoot, "imports", "LIS3DHTR.tsx"),
    ).text();
    const bno055 = await Bun.file(
      join(projectRoot, "imports", "BNO055.tsx"),
    ).text();
    const sht45 = await Bun.file(
      join(projectRoot, "imports", "SHT45_AD1B_R2.tsx"),
    ).text();

    expect(lis3dh).toContain('pin4: ["SCL", "SPC"]');
    expect(lis3dh).toContain('pin6: ["SDA", "SDI", "SDO_3WIRE"]');
    expect(bno055).not.toContain("footprinterPinLabels");
    expect(bno055).toContain("pinLabels={pinLabels}");
    expect(bno055).toContain('pin10: ["BL_IND", "DNC8"]');
    expect(bno055).toContain("pin10: { doNotConnect: true }");
    expect(bno055).toContain("pin15: { doNotConnect: true }");
    expect(bno055).toContain("pin16: { doNotConnect: true }");
    expect(sht45).not.toContain('portHints={["pin5"]}');
    expect(sht45).toContain("pin5: { doNotConnect: true }");
    expect(source).toContain("const sensorNeedsCopperKeepout =");
    expect(source).toContain('sensorId === "aht20"');
    expect(source).toContain(
      "const bottomPourOutline = sensorNeedsCopperKeepout",
    );
    expect(source).toContain("outline={bottomPourOutline}");
  });

  test("keeps every explicit board rotation orthogonal", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "Mspm0SensorBoard.tsx"),
    ).text();
    const rotations = [...source.matchAll(/pcbRotation=\{(-?\d+)\}/g)].map(
      ([, value]) => Number(value),
    );

    expect(rotations.length).toBeGreaterThan(0);
    expect(rotations.every(Number.isFinite)).toBe(true);
    expect(rotations.every((rotation) => rotation % 90 === 0)).toBe(true);
  });
});
