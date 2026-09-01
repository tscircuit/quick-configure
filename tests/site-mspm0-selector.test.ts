import { describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { expectedConfigurationIds } from "../scripts/configuration-ids";
import { mspm0SensorIds, mspm0Sensors } from "../src/mspm0-sensor-data";

const projectRoot = join(import.meta.dir, "..");

describe("MSPM0 sensor selector", () => {
  test("exposes the ten sensor boards in catalog order", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text();
    const positions = mspm0SensorIds.map((id) => {
      const marker = `<option value="${id}">`;
      expect(html).toContain(marker);
      return html.indexOf(marker);
    });

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain("72 selectable designs");
    expect(html).toContain("BNO085 MSPM0 Orientation Sensor Board");
    expect(html).toContain("TI MSPM0G5117 — native USB 2.0 FS");
    expect(html).toContain("TI MSPM0G5187 — native USB + TinyEngine NPU");
    expect(html).toContain('breadcrumb:["Sensors","MSPM0 Sensors"');
    for (const id of mspm0SensorIds) {
      expect(html).toContain(mspm0Sensors[id].displayName);
      expect(html).toContain(`datasheetUrl:"${mspm0Sensors[id].datasheetUrl}"`);
    }
  });

  test("keeps each controller family on generated configurations only", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text();

    expect(html).toContain('<option value="mspm0g3507">TI MSPM0G3507');
    expect(html).toContain('<option value="mspm0g5117">TI MSPM0G5117');
    expect(html).toContain('<option value="mspm0g5187">TI MSPM0G5187');
    expect(html).toContain(
      'const mspm0PeripheralControllerIds=["mspm0g3507","mspm0g5117","mspm0g5187"]',
    );
    expect(html).toContain(
      'const legacyPeripheralControllerIds=["msp430f5529","mspm0g5117","mspm0g5187"]',
    );
    expect(html).toContain(
      "mspm0SensorIds.map(sensor=>`usb-c__mspm0g3507__${sensor}`)",
    );
    expect(html).toContain(
      "mspm0SensorIds.map(sensor=>`usb-c__mspm0g5117__${sensor}`)",
    );
    expect(html).toContain(
      "mspm0SensorIds.map(sensor=>`usb-c__mspm0g5187__${sensor}`)",
    );
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__msp430f5529__${sensor}`)",
    );
    expect(html).toContain(
      "screenIds.map(screen=>`usb-c__msp430f5529__${screen}`)",
    );
    expect(html).toContain(
      "screenIds.map(screen=>`usb-c__mspm0g5117__${screen}`)",
    );
    expect(html).toContain(
      "screenIds.map(screen=>`usb-c__mspm0g5187__${screen}`)",
    );
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__mspm0g5117__${sensor}`)",
    );
    expect(html).toContain(
      "sensorIds.map(sensor=>`usb-c__mspm0g5187__${sensor}`)",
    );
    expect(html).toContain(
      "option.disabled=!allowedControllers.includes(option.value)",
    );
    expect(html).toContain("photodiodeControllerIds.includes(mcuSelect.value)");
    expect(html).not.toContain(
      "Object.keys(controllers).map(controller=>`${connector}__${controller}__photodiode`)",
    );
  });

  test("rejects an unavailable key before constructing viewer URLs", async () => {
    const html = await Bun.file(join(projectRoot, "site", "index.html")).text();
    const start = html.indexOf("function loadBoard()");
    const end = html.indexOf("function setView", start);
    const loadBoard = html.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(
      loadBoard.indexOf("if(!availableConfigurations.has(key))"),
    ).toBeLessThan(loadBoard.indexOf("base=`./viewer/${key}`"));
    expect(loadBoard).toContain("return}");
    expect(loadBoard).toContain("link.download=`${boardKey()}.glb`");
  });
});

describe("MSPM0 sensor documentation", () => {
  test("documents the sensor set and stocked controller", async () => {
    const readme = await Bun.file(join(projectRoot, "README.md")).text();

    expect(readme).toContain("### Additional MSPM0 sensor boards");
    expect(readme).toContain("MSPM0G3507SPMR");
    expect(readme).toContain("C22389960");
    expect(readme).toContain("**72 selectable configurations**");
    expect(readme).toContain("MSPM0G5117SPMR");
    expect(readme).toContain("MSPM0G5187SPMR");
    expect(readme).toContain(
      "https://www.ti.com/lit/ds/symlink/mspm0g5117.pdf",
    );
    expect(readme).toContain(
      "https://www.ti.com/lit/ds/symlink/mspm0g5187.pdf",
    );
    for (const id of mspm0SensorIds) {
      expect(readme).toContain(mspm0Sensors[id].sensorPartNumber);
      expect(readme).toContain(mspm0Sensors[id].datasheetUrl);
    }
  });
});

describe("Static deployment assets", () => {
  test("publishes every selectable board and its downloads", async () => {
    const siteIndex = await Bun.file(
      join(projectRoot, "site", "index.html"),
    ).text();
    const publicIndex = await Bun.file(
      join(projectRoot, "public", "index.html"),
    ).text();
    expect(publicIndex).toBe(siteIndex);

    const viewerRoot = join(projectRoot, "public", "viewer");
    const deployedBoardIds = (
      await readdir(viewerRoot, { withFileTypes: true })
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(deployedBoardIds).toEqual([...expectedConfigurationIds].sort());

    const requiredFiles = [
      "3d.glb",
      "3d.png",
      "pcb.svg",
      "schematic.svg",
      "resources/gerbers.zip",
      "resources/schematic.pdf",
      "resources/kicad-project.zip",
      "resources/altium-project.zip",
    ];
    for (const boardId of expectedConfigurationIds) {
      for (const requiredFile of requiredFiles) {
        const artifact = Bun.file(join(viewerRoot, boardId, requiredFile));
        expect(await artifact.exists()).toBe(true);
        expect(artifact.size).toBeGreaterThan(0);
      }
    }
  });
});
