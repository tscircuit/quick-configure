import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import {
  mspm0g5117PinLabels,
  mspm0g5117Pins,
} from "../src/MSPM0G5117SPMR";

const projectRoot = join(import.meta.dir, "..");

describe("MSPM0G5117 controller support", () => {
  test("maps native USB and the common board interfaces to the PM package", () => {
    expect(mspm0g5117Pins).toMatchObject({
      swdio: 12,
      swclk: 13,
      vusb: 29,
      usbDm: 30,
      usbDp: 31,
      vcore: 32,
      reset: 38,
      vdd: 40,
      vss: 41,
      rosc: 42,
      i2cScl: 50,
      i2cSda: 51,
      displayCs: 58,
      spiMiso: 59,
      spiMosi: 60,
      spiClock: 61,
    });
    expect(mspm0g5117PinLabels.pin29).toBe("VUSB33");
    expect(mspm0g5117PinLabels.pin30).toContain("USB_DM");
    expect(mspm0g5117PinLabels.pin31).toContain("USB_DP");
  });

  test("uses native USB and the datasheet support network on every board family", async () => {
    const controller = await Bun.file(
      join(projectRoot, "src", "MSPM0G5117SPMR.tsx"),
    ).text();
    expect(controller).toContain('manufacturerPartNumber="MSPM0G5117SPMR"');
    expect(controller).toContain(
      'datasheetUrl="https://www.ti.com/lit/ds/symlink/mspm0g5117.pdf"',
    );

    for (const filename of [
      "Mspm0SensorBoard.tsx",
      "SensorBoard.tsx",
      "ScreenBoard.tsx",
    ]) {
      const source = await Bun.file(join(projectRoot, "src", filename)).text();
      expect(source).toContain("mspm0g5117Pins.usbDp");
      expect(source).toContain("mspm0g5117Pins.usbDm");
      expect(source).toContain('name="R_MCU_ROSC"');
      expect(source).toMatch(/name="C_(?:MCU_)?VUSB"/);
      expect(source).toMatch(/name="C_(?:MCU_)?VCORE"/);
    }
  });

  test("keeps the USB-UART bridge out of MSPM0G5117 render paths", async () => {
    const source = await Bun.file(
      join(projectRoot, "src", "Mspm0SensorBoard.tsx"),
    ).text();
    expect(source).toContain("!isMspm0g5117 &&");
    expect(source).toContain("<CH340N");
    expect(source.toLowerCase()).toContain("native usb");
  });
});
