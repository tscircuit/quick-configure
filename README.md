# tscircuit Quick Configure — Sensor & Display Boards

A local selector and pre-generated tscircuit board family for BPX65 photodiode
acquisition and raw BuyDisplay panels. Every configuration includes an
interactive 3D model, routed PCB, schematic, and downloadable fabrication/EDA
resources.

## Configuration catalog

The original photodiode matrix remains intact:

- Host connectors: USB-C, USB Micro-B, and JST-SH 4-pin
- Controllers: CH552T, MSP430G2553, MSP430FR2433, MSP430FR2355,
  MSP430FR5994, and MSP430F5529
- Sensor: BPX65 photodiode with OPA320 transimpedance amplifier
- Photodiode configurations: 18

Three display reference designs add USB-C power/data and an MSP430F5529 with
four-wire SPI on a two-layer board with a bottom-side ground pour. Each uses the
panel manufacturer's exact recommended mating FPC connector.

| Panel | Controller / resolution | Exact connector | Selection rationale |
| --- | --- | --- | --- |
| [ER-OLED0.96-1.3W](https://www.buydisplay.com/128x64-oled-i2c-0-96-display-white-color-connector-fpc-ssd1306) | SSD1306, 128×64 OLED | [ER-CON30HT-1](https://www.buydisplay.com/30-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 30-pin 0.5 mm top contact | Ultra-budget monochrome option with established buyer reviews |
| [ER-TFT020-3](https://www.buydisplay.com/2-inch-240x320-ips-tft-lcd-display-with-connector-fpc) | ST7789, 240×320 IPS | [ER-CON14HB-1](https://www.buydisplay.com/download/connector/ER-CON14HB-1.pdf), 14-pin 0.5 mm **bottom contact** | Lowest-cost compact color/SPI option in the launch set |
| [ER-TFT028A2-4](https://www.buydisplay.com/2-8-inch-240x320-ips-tft-lcd-display-panel-optional-touch-panel-wide-view) | ILI9341, 240×320 IPS | [ER-CON50HT-1](https://www.buydisplay.com/50-pin-0-5mm-pitch-top-contact-zif-connector-fpc-connector), 50-pin 0.5 mm top contact | Strongest popularity signal and an OEM mechanical model |

This yields **21 selectable configurations**. Display choices intentionally use
one implemented host/controller pairing rather than multiplying partially
validated screen circuits across the full connector/MCU matrix.

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
  board-mounted ZIF connector.

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
used for all three today so the build stays reproducible and uniform.

## Build and verify

Prerequisites are Node.js/npm, Bun (tested with 1.3.2), and
`rsvg-convert` from librsvg (tested with 2.61.2).

```sh
npm install --force
npm test
npm run typecheck
npm run build
```

`npm run models` can be used to regenerate only the three source GLBs. The full
build writes circuit JSON, binary glTF (`3d.glb`), 3D posters, PCB SVGs,
schematic SVGs, Gerbers, schematic PDFs, KiCad projects, and Altium projects to
`dist/`, then assembles the deployable selector in `public/`.

## References

- [ER-OLED0.96-1 series datasheet](https://www.buydisplay.com/download/manual/ER-OLED0.96-1_Series_Datasheet.pdf)
- [ER-TFT020-3 datasheet](https://www.buydisplay.com/download/manual/ER-TFT020-3_Datasheet.pdf)
- [ER-TFT028A2-4 datasheet](https://www.buydisplay.com/download/manual/ER-TFT028A2-4_Datasheet.pdf)
- [MSP430F5529 datasheet](https://www.ti.com/lit/ds/symlink/msp430f5529.pdf)

This is a reference/design artifact. Verify connector orientation, display
revision, backlight current, signal integrity, USB compliance, EMC, thermal
behavior, and manufacturability before fabrication.
