# tscircuit Quick Configure — TI MSP430 Photodiode Boards

A local selector and tscircuit board family for evaluating a BPX65 photodiode
through an OPA320 transimpedance amplifier with six MCU choices and three host
connectors.

## Matrix

- Connectors: USB-C, USB Micro-B, JST-SH 4-pin
- Controllers: CH552T, MSP430G2553, MSP430FR2433, MSP430FR2355,
  MSP430FR5994, MSP430F5529
- Sensor: BPX65 photodiode with OPA320 TIA
- Total selectable circuits: 18
- Stackup: 4 layers — top signal, inner GND plane, inner 3.3 V plane, bottom signal

For USB-C and USB Micro-B, the CH552T is added as a USB-to-UART bridge when the
selected MSP430 does not include native USB. MSP430F5529 and CH552T variants
connect to USB directly. JST-SH variants expose 3.3 V, ground, TX, and RX.

The shared analog front end uses a 330 kΩ / 10 pF TIA feedback network, a
0.5 V bias reference, and a 100 Ω / 1 nF ADC isolation filter.

## Build

```sh
npm install
npm run typecheck
npm run build
```

The build writes circuit JSON, binary glTF (`3d.glb`), 3D posters, PCB SVGs,
schematic SVGs, and downloadable resources for every configuration in `dist/`.
Resources include Gerbers, a schematic PDF, a KiCad project, and an Altium
project. The product page in `site/index.html` expects `dist/` beside it as
`viewer/` and uses the vendored model-viewer bundle in `site/assets/`.

## TI device references

- MSP430G2553: https://www.ti.com/product/MSP430G2553
- MSP430FR2433: https://www.ti.com/product/MSP430FR2433
- MSP430FR2355: https://www.ti.com/product/MSP430FR2355
- MSP430FR5994: https://www.ti.com/product/MSP430FR5994
- MSP430F5529: https://www.ti.com/product/MSP430F5529

This is a design/demo artifact. Pinout, analog performance, EMC, USB
compliance, and manufacturability require engineering review before fabrication.
