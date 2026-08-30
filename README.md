# tscircuit Quick Configure — Sensor & Display Boards

A local selector and pre-generated tscircuit board family for photodiode,
environmental, motion, orientation, distance, light, and thermal sensing plus
raw BuyDisplay panels. Every configuration includes an interactive 3D model,
routed PCB, schematic, and downloadable fabrication/EDA resources.

## Configuration catalog

The photodiode matrix supports:

- Host connectors: USB-C, USB Micro-B, and JST-SH 4-pin
- Controllers: CH552T, MSP430G2553, MSP430FR2433, MSP430FR2355,
  MSP430FR5994, MSP430F5529, and MSPM33C321A
- Sensor: BPX65 photodiode with OPA320 transimpedance amplifier
- Photodiode configurations: 21

The MSPM33 target uses the 48-pin RGZ variant of the MSPM33C321A, pairing its
160 MHz Arm Cortex-M33 core with the photodiode front end through ADC0 channel
0. Its three connector variants include TI's recommended VDD, VBAT, VCORE,
external ADC-reference, reset, and bootloader-invoke support circuits, and
expose SWD on the debug header. The exposed pad is stitched to the inner ground
plane with four 0.2 mm thermal vias. This RGZ device is currently a
product-preview part; confirm availability before fabrication.

Three legacy I²C sensor reference designs use USB-C and an MSP430F5529, exact
imported component footprints and 3D models, address straps, local decoupling,
and a shared debug header.

| Sensor   | Measurements                                        | Exact part / package                                        | I²C address |
| -------- | --------------------------------------------------- | ----------------------------------------------------------- | ----------- |
| BME280   | Relative humidity, temperature, barometric pressure | Bosch BME280 / LGA-8 2.5×2.5 mm (JLCPCB C92489)             | `0x76`      |
| MPU-6050 | 3-axis acceleration, 3-axis angular rate            | TDK InvenSense MPU-6050 / QFN-24-EP 4×4 mm (JLCPCB C24112)  | `0x68`      |
| MLX90640 | 32×24-pixel far-infrared thermal image              | Melexis MLX90640ESF-BAA-000-TU / TO-39-4 (JLCPCB C17380659) | `0x33`      |

### Additional MSPM0 sensor boards

Ten additional I²C sensor boards use a fixed USB-C and TI
MSPM0G3507SPMR configuration. The controller is available for JLCPCB assembly
as part `C22389960`; see the
[MSPM0G3507 datasheet](https://www.ti.com/lit/ds/symlink/mspm0g3507.pdf).

| Sensor         | Function                                             | Interface / address                     | Datasheet                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BNO085         | 9-axis orientation and fused rotation vectors        | I²C / `0x4A` (`0x4B` selectable)        | [BNO08X](https://www.ceva-ip.com/wp-content/uploads/BNO080_085-Datasheet.pdf)                                                                                                             |
| MCP9808T-E/MS  | High-accuracy temperature with alert output          | I²C / `0x18` (`0x19`–`0x1F` selectable) | [MCP9808](https://ww1.microchip.com/downloads/aemDocuments/documents/OTH/ProductDocuments/DataSheets/MCP9808-0.5C-Maximum-Accuracy-Digital-Temperature-Sensor-Data-Sheet-DS20005095B.pdf) |
| BNO055         | 9-axis absolute orientation with sensor fusion       | I²C / `0x28` (`0x29` selectable)        | [BNO055](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bno055-ds000.pdf)                                                                                  |
| SHT45-AD1B-R2  | Precision temperature and relative humidity          | I²C / `0x44`                            | [SHT4x](https://sensirion.com/resource/datasheet/sht4x)                                                                                                                                   |
| SHT41-AD1B-R2  | Temperature and relative humidity                    | I²C / `0x44`                            | [SHT4x](https://sensirion.com/resource/datasheet/sht4x)                                                                                                                                   |
| LIS3DHTR       | Low-power 3-axis acceleration with motion interrupts | I²C / `0x18` (`0x19` selectable)        | [LIS3DH](https://www.st.com/resource/en/datasheet/lis3dh.pdf)                                                                                                                             |
| LSM6DSOXTR     | 3-axis acceleration and 3-axis angular rate          | I²C / `0x6A` (`0x6B` selectable)        | [LSM6DSOX](https://www.st.com/resource/en/datasheet/lsm6dsox.pdf)                                                                                                                         |
| AHT20          | Temperature and relative humidity                    | I²C / `0x38`                            | [AHT20](https://www.aosong.com/userfiles/files/media/AHT20%20%E8%8B%B1%E6%96%87%E7%89%88%E8%AF%B4%E6%98%8E%E4%B9%A6%20A0%2020201222.pdf)                                                  |
| VL53L4CDV0DH/1 | Short-range time-of-flight distance                  | I²C / `0x29`                            | [VL53L4CD](https://www.st.com/resource/en/datasheet/vl53l4cd.pdf)                                                                                                                         |
| VEML7700-TR    | 16-bit ambient-light measurement                     | I²C / `0x10`                            | [VEML7700](https://www.vishay.com/docs/84286/veml7700.pdf)                                                                                                                                |

Four display reference designs add USB-C power/data and an MSP430F5529 with
four-wire SPI on a two-layer board with a bottom-side ground pour. Each uses the
panel manufacturer's exact recommended mating FPC connector.

| Panel                                                                                                                 | Controller / resolution             | Exact connector                                                                                                                  | Selection rationale                                                 |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [ER-EPD0213-2B](https://www.buydisplay.com/graphic-2-13-inch-122x250-electronic-paper-display-manufacturers)          | UC8251, 122×250 black/white e-paper | [ER-CON24HT-1](https://www.buydisplay.com/24-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 24-pin 0.5 mm top contact | Budget reflective option with image retention at zero display power |
| [ER-OLED0.96-1.3W](https://www.buydisplay.com/128x64-oled-i2c-0-96-display-white-color-connector-fpc-ssd1306)         | SSD1306, 128×64 OLED                | [ER-CON30HT-1](https://www.buydisplay.com/30-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 30-pin 0.5 mm top contact | Ultra-budget monochrome option with established buyer reviews       |
| [ER-TFT020-3](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc)                       | ST7789, 240×320 IPS                 | [ER-CON14HB-1](https://www.buydisplay.com/download/connector/ER-CON14HB-1.pdf), 14-pin 0.5 mm **bottom contact**                 | Lowest-cost compact color/SPI option in the launch set              |
| [ER-TFT028A2-4](https://www.buydisplay.com/2-8-inch-240x320-ips-tft-lcd-display-panel-optional-touch-panel-wide-view) | ILI9341, 240×320 IPS                | [ER-CON50HT-1](https://www.buydisplay.com/50-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 50-pin 0.5 mm top contact | Strongest popularity signal and an OEM mechanical model             |

This yields **38 selectable configurations**: 21 photodiode combinations,
three legacy sensor boards, ten MSPM0 sensor boards, and four display boards.
The legacy sensors and displays retain their validated USB-C/MSP430F5529
pairing; the ten additional sensor boards use USB-C/MSPM0G3507. Fixed configurations
are not multiplied across the full connector/MCU matrix.

## Sensor implementation

- `src/sensor-data.ts` is the typed catalog for capabilities, exact manufacturer
  and supplier part numbers, I²C addresses, and manufacturer references.
- `src/SensorBoard.tsx` contains the shared USB-C/MSP430F5529 reference design,
  datasheet-selected I²C pull-ups, exposed debug/test points, and
  sensor-specific support circuits.
- `imports/BME280`, `imports/MPU_6050`, and
  `imports/MLX90640ESF_BAA_000_TU` contain exact EasyEDA-derived footprints and
  locally downloaded component models. The BME280 is strapped for I²C and
  address `0x76`; the MPU-6050 uses address `0x68` and exposes its interrupt;
  the wide-angle MLX90640 BAA variant uses its fixed `0x33` address.
- `src/mspm0-sensor-data.ts` is the typed, ordered catalog for the ten MSPM0
  sensor boards, sensor parts, I²C addresses, capabilities, and manufacturer
  datasheet links.
- `src/Mspm0SensorBoard.tsx` contains the shared USB-C/MSPM0G3507 reference
  design: an MSPM0G3507SPMR, turnkey CH340N USB-to-UART bridge
  ([JLCPCB C506813](https://jlcpcb.com/partdetail/wch_jiangsu_Qin_heng-CH340N/C506813)), USBLC6-2SC6 USB ESD
  protection, TLV75533PDBVR 3.3 V regulator, 4.7 kΩ I²C pull-ups, and a 10-pin
  SWD/reset header. The MSPM0 support network includes the TI-recommended
  VCORE, reset, and precision ROSC components. Sensor-specific support includes local decoupling,
  interrupt/reset/address straps where available, BNO085/BNO055 crystal and
  reset circuits, and VL53L4CD XSHUT/GPIO pull-ups.

The e-paper panel already integrates its UC8251 timing controller and
high-voltage display driver in chip-on-glass form. Its board still implements
the manufacturer's external booster network, including the switching MOSFET,
inductor, Schottky diodes, current-sense resistor, and high-voltage capacitors;
it does not need a second display-controller IC.

E-paper firmware must put the UC8251 into deep sleep or otherwise disable its
high-voltage rails after each refresh. The panel datasheet warns that leaving
the charge pumps active can cause image sticking and permanently damage the
display.

## Display implementation

- `src/screen-data.ts` is the hard-coded panel catalog, including complete FPC
  pin labels, exact connector MPN, contact side, footprint, and model URL.
- `src/ScreenBoard.tsx` contains the shared USB-C/MSP430F5529 reference design
  and panel-specific power, interface-strap, charge-pump, and backlight circuits.
  Its explicit component placements are restricted to 0/90/180/270-degree
  rotations, with a regression test enforcing that rule.
- `src/screen-model-specs.ts` holds datasheet-derived panel, active-area, flex,
  and connector dimensions.
- `scripts/generate-screen-models.ts` combines the matching connector and a
  `flexscreen_...` jscad-electronics model into a GLB whose origin matches the
  connector footprint. The rendered screen therefore appears inserted into its
  board-mounted ZIF connector. The e-paper model uses a warm off-white active
  surface to distinguish its reflective appearance from the emissive displays.

The display bodies are dimensioned visualization models, not
manufacturer-authoritative mechanical CAD. `connector.contactSide` in
`src/screen-data.ts` is the contact-face authority; `_mounttop` in the
procedural footprint string describes the body/anchor side and does not mean
“top-contact.”

The procedural GLBs are generated ahead of tscircuit evaluation because the
current `@tscircuit/core` version does not resolve string-valued
`cadModel="flexscreen_..."` declarations. The board instead imports the generated
asset and passes `cadModel={{ glbUrl }}`. The 2.8-inch panel also has an
[OEM Parasolid model](https://www.buydisplay.com/download/3D/ER-TFT028-4.2.zip),
which is a good future higher-fidelity replacement; the procedural approach is
used for all four today so the build stays reproducible and uniform.

## Build and verify

Prerequisites are Node.js/npm, Bun (tested with 1.3.2), and
`rsvg-convert` from librsvg (tested with 2.61.2).

```sh
npm install --force
npm test
npm run typecheck
npm run check:schematic-placement
npm run build
```

The schematic-placement gate checks all 38 circuit entry files with four-way
concurrency and fails on either a nonzero `tsci` exit or any emitted placement
issue block.

`npm run models` can be used to regenerate only the five source GLBs. The full
build writes circuit JSON, binary glTF (`3d.glb`), 3D posters, PCB SVGs,
schematic SVGs, Gerbers, schematic PDFs, KiCad projects, and Altium projects to
`dist/`, then assembles the deployable selector in `public/`.

## References

- [ER-OLED0.96-1 series datasheet](https://www.buydisplay.com/download/manual/ER-OLED0.96-1_Series_Datasheet.pdf)
- [ER-EPD0213-2 datasheet](https://www.buydisplay.com/download/manual/ER-EPD0213-2_Datasheet.pdf)
- [UC8251 controller datasheet](https://www.buydisplay.com/download/ic/UC8251.pdf)
- [ER-CON24HT-1 connector](https://www.buydisplay.com/24-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector)
- [ER-TFT020-3 datasheet](https://www.buydisplay.com/download/manual/ER-TFT020-3_Datasheet.pdf)
- [ER-TFT028A2-4 datasheet](https://www.buydisplay.com/download/manual/ER-TFT028A2-4_Datasheet.pdf)
- [MSP430F5529 datasheet](https://www.ti.com/lit/ds/symlink/msp430f5529.pdf)
- [MSPM33C321A datasheet](https://www.ti.com/lit/ds/symlink/mspm33c321a.pdf)
- [MSPM33 C-Series hardware development guide](https://www.ti.com/lit/an/sdaa132/sdaa132.pdf)
- [MSPM0G3507 datasheet](https://www.ti.com/lit/ds/symlink/mspm0g3507.pdf)
- [BME280 datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf)
- [MPU-6000/MPU-6050 datasheet](https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet.pdf)
- [MLX90640 datasheet](https://media.melexis.com/-/media/files/documents/datasheets/mlx90640-datasheet-melexis.pdf)

This is a reference/design artifact. Verify sensor revision and orientation,
connector orientation, display revision, backlight current, signal integrity,
USB compliance, EMC, thermal behavior, e-paper booster layout and capacitor
voltage ratings, MSPM33 package availability, under-pad via filling or tenting,
and manufacturability before fabrication.
