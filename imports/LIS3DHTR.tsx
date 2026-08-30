import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VDD_IO"],
  pin2: ["NC1"],
  pin3: ["NC2"],
  pin4: ["SCL", "SPC"],
  pin5: ["GND1"],
  pin6: ["SDA", "SDI", "SDO_3WIRE"],
  pin7: ["SDO", "SA0"],
  pin8: ["CS"],
  pin9: ["INT2"],
  pin10: ["RES", "GND3"],
  pin11: ["INT1"],
  pin12: ["GND2"],
  pin13: ["ADC3"],
  pin14: ["VDD"],
  pin15: ["ADC2"],
  pin16: ["ADC1"],
} as const

const pinAttributes = {
  pin2: { doNotConnect: true },
  pin3: { doNotConnect: true },
  pin5: { requiresGround: true },
  pin10: { requiresGround: true },
  pin12: { requiresGround: true },
  pin14: { requiresPower: true },
  pin1: { requiresPower: true },
} as const

export const LIS3DHTR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C15134"],
      }}
      manufacturerPartNumber="LIS3DHTR"
      footprint="lga16_grid5x3_pillpads_p0.4999mm_w3.6001mm_h3.5998mm_pl0.8mm"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C15134.obj?uuid=c4b5277f94624e3ba038828676140c3b",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C15134.step?uuid=c4b5277f94624e3ba038828676140c3b",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
