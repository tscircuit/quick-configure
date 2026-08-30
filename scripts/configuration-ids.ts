import { connectors, mcus } from "../src/board-data";
import { mspm0Sensors } from "../src/mspm0-sensor-data";
import { screenModelSpecs } from "../src/screen-model-specs";
import { sensors } from "../src/sensor-data";

export const expectedConfigurationIds = [
  ...Object.keys(connectors).flatMap((connector) =>
    Object.keys(mcus).map((mcu) => `${connector}__${mcu}__photodiode`),
  ),
  ...Object.keys(screenModelSpecs).map(
    (screen) => `usb-c__msp430f5529__${screen}`,
  ),
  ...Object.keys(sensors).map((sensor) => `usb-c__msp430f5529__${sensor}`),
  ...Object.keys(mspm0Sensors).map((sensor) => `usb-c__mspm0g3507__${sensor}`),
].sort();

export const expectedBoardAssetFilenames = [
  "circuit.json",
  "3d.glb",
  "3d.png",
  "pcb.svg",
  "schematic.svg",
] as const;

export const expectedResourceFilenames = [
  "gerbers.zip",
  "schematic.pdf",
  "kicad-project.zip",
  "altium-project.zip",
] as const;
