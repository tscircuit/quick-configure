# tscircuit Quick Configure — Sensor & Display Boards

A local selector and pre-generated tscircuit board family for photodiode,
environmental, motion, orientation, distance, light, and thermal sensing plus
raw BuyDisplay panels. Every configuration includes an interactive 3D model,
routed PCB, schematic, and downloadable fabrication/EDA resources.

## Configuration catalog

The original photodiode matrix remains intact:

- Host connectors: USB-C, USB Micro-B, and JST-SH 4-pin
- Controllers: CH552T, MSP430G2553, MSP430FR2433, MSP430FR2355,
  MSP430FR5994, and MSP430F5529
- Sensor: BPX65 photodiode with OPA320 transimpedance amplifier
- Photodiode configurations: 18

Three legacy I²C sensor reference designs use USB-C and an MSP430F5529, exact
imported component footprints and 3D models, address straps, local decoupling,
and a shared debug header.

| Sensor | Measurements | Exact part / package | I²C address |
| --- | --- | --- | --- |
| BME280 | Relative humidity, temperature, barometric pressure | Bosch BME280 / LGA-8 2.5×2.5 mm (JLCPCB C92489) | `0x76` |
| MPU-6050 | 3-axis acceleration, 3-axis angular rate | TDK InvenSense MPU-6050 / QFN-24-EP 4×4 mm (JLCPCB C24112) | `0x68` |
| MLX90640 | 32×24-pixel far-infrared thermal image | Melexis MLX90640ESF-BAA-000-TU / TO-39-4 (JLCPCB C17380659) | `0x33` |

### Adafruit store-rank sensor set

Ten additional I²C sensor boards use a fixed USB-C and
[TI MSPM0G3507SPMR](https://www.ti.com/product/MSPM0G3507) pairing. The selected
MCU is available for JLCPCB assembly as
[LCSC/JLCPCB part C22389960](https://jlcpcb.com/partdetail/TexasInstruments-MSPM0G3507SPMR/C22389960);
its [datasheet is available from TI](https://www.ti.com/lit/ds/symlink/mspm0g3507.pdf).

Selected 2026-08-29 from Adafruit's live default Sensors category merchandising
order. Because Adafruit publishes neither unit-sales counts nor a labeled Best
Selling sort, the list is a reproducible store-rank proxy. Filtered to distinct
in-stock I2C sensor breakout boards; skipped loose sensors, actuators, cables,
I2S-only microphones, external-transducer amplifiers, and duplicate board
variants.

Source: [Adafruit Sensors category, default order](https://www.adafruit.com/category/35),
observed 2026-08-29.

| Rank | Adafruit breakout | Sensor / default I²C address | Sensor datasheet |
| ---: | --- | --- | --- |
| 1 | [BNO085 9-DOF Orientation IMU, PID 4754](https://www.adafruit.com/product/4754) | BNO085 / `0x4A` | [BNO080/BNO085](https://www.ceva-ip.com/wp-content/uploads/BNO080_085-Datasheet.pdf) |
| 2 | [MCP9808 High Accuracy Temperature, PID 1782](https://www.adafruit.com/product/1782) | MCP9808T-E/MS / `0x18` | [MCP9808](https://www.adafruit.com/datasheets/MCP9808.pdf) |
| 3 | [BNO055 Absolute Orientation, PID 2472](https://www.adafruit.com/product/2472) | BNO055 / `0x28` | [BNO055](https://cdn-learn.adafruit.com/assets/assets/000/125/776/original/bst-bno055-ds000.pdf?1698865246) |
| 4 | [SHT45 Precision Temperature & Humidity, PID 5665](https://www.adafruit.com/product/5665) | SHT45-AD1B-R2 / `0x44` | [SHT4x](https://cdn-shop.adafruit.com/product-files/5665/5665_Datasheet_SHT4x.pdf) |
| 5 | [SHT41 Temperature & Humidity, PID 5776](https://www.adafruit.com/product/5776) | SHT41-AD1B-R2 / `0x44` | [SHT4x](https://cdn-shop.adafruit.com/product-files/5776/Datasheet_SHT4x.pdf) |
| 6 | [LIS3DH Triple-Axis Accelerometer, PID 2809](https://www.adafruit.com/product/2809) | LIS3DHTR / `0x18` | [LIS3DH](https://cdn-learn.adafruit.com/assets/assets/000/085/846/original/lis3dh.pdf?1576396666) |
| 7 | [LSM6DSOX 6 DoF Accelerometer and Gyroscope, PID 4438](https://www.adafruit.com/product/4438) | LSM6DSOXTR / `0x6A` | [LSM6DSOX](https://www.st.com/resource/en/datasheet/lsm6dsox.pdf) |
| 8 | [AHT20 Temperature & Humidity, PID 4566](https://www.adafruit.com/product/4566) | AHT20 / `0x38` | [AHT20](https://cdn-learn.adafruit.com/assets/assets/000/123/394/original/Data_Sheet_AHT20.pdf?1691532479) |
| 9 | [VL53L4CD Time of Flight Distance, PID 5396](https://www.adafruit.com/product/5396) | VL53L4CDV0DH/1 / `0x29` | [VL53L4CD](https://www.st.com/resource/en/datasheet/vl53l4cd.pdf) |
| 10 | [VEML7700 Lux Sensor, PID 4162](https://www.adafruit.com/product/4162) | VEML7700-TR / `0x10` | [VEML7700](https://www.vishay.com/docs/84286/veml7700.pdf) |

Four display reference designs add USB-C power/data and an MSP430F5529 with
four-wire SPI on a two-layer board with a bottom-side ground pour. Each uses the
panel manufacturer's exact recommended mating FPC connector.

| Panel | Controller / resolution | Exact connector | Selection rationale |
| --- | --- | --- | --- |
| [ER-EPD0213-2B](https://www.buydisplay.com/graphic-2-13-inch-122x250-electronic-paper-display-manufacturers) | UC8251, 122×250 black/white e-paper | [ER-CON24HT-1](https://www.buydisplay.com/24-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 24-pin 0.5 mm top contact | Budget reflective option with image retention at zero display power |
| [ER-OLED0.96-1.3W](https://www.buydisplay.com/128x64-oled-i2c-0-96-display-white-color-connector-fpc-ssd1306) | SSD1306, 128×64 OLED | [ER-CON30HT-1](https://www.buydisplay.com/30-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 30-pin 0.5 mm top contact | Ultra-budget monochrome option with established buyer reviews |
| [ER-TFT020-3](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc) | ST7789, 240×320 IPS | [ER-CON14HB-1](https://www.buydisplay.com/download/connector/ER-CON14HB-1.pdf), 14-pin 0.5 mm **bottom contact** | Lowest-cost compact color/SPI option in the launch set |
| [ER-TFT028A2-4](https://www.buydisplay.com/2-8-inch-240x320-ips-tft-lcd-display-panel-optional-touch-panel-wide-view) | ILI9341, 240×320 IPS | [ER-CON50HT-1](https://www.buydisplay.com/50-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 50-pin 0.5 mm top contact | Strongest popularity signal and an OEM mechanical model |

This yields **35 selectable configurations**: 18 photodiode combinations,
three legacy sensor boards, ten Adafruit-ranked sensor boards, and four display
boards. The legacy sensors and displays retain their validated USB-C/MSP430F5529
pairing; the ten Adafruit additions use USB-C/MSPM0G3507. Fixed configurations
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
- `src/adafruit-sensor-data.ts` is the typed, ordered catalog for the ten
  Adafruit-ranked boards, product IDs, sensor parts, I²C addresses,
  capabilities, and product/datasheet links.
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
npm run build
```

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
- [MSPM0G3507 datasheet](https://www.ti.com/lit/ds/symlink/mspm0g3507.pdf)
- [Adafruit Sensors category](https://www.adafruit.com/category/35)
- [BME280 datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf)
- [MPU-6000/MPU-6050 datasheet](https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet.pdf)
- [MLX90640 datasheet](https://media.melexis.com/-/media/files/documents/datasheets/mlx90640-datasheet-melexis.pdf)

This is a reference/design artifact. Verify sensor revision and orientation,
connector orientation, display revision, backlight current, signal integrity,
USB compliance, EMC, thermal behavior, e-paper booster layout and capacitor
voltage ratings, and
manufacturability before fabrication.
