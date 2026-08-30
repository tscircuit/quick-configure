import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SDO", "SA0"],
  pin2: ["SDX"],
  pin3: ["SCX"],
  pin4: ["INT1"],
  pin5: ["VDDIO"],
  pin6: ["GND1"],
  pin7: ["GND2"],
  pin8: ["VDD"],
  pin9: ["INT2"],
  pin10: ["OCS_AUX"],
  pin11: ["SDO_AUX"],
  pin12: ["CS"],
  pin13: ["SCL"],
  pin14: ["SDA"],
} as const

const pinAttributes = {
  pin2: { requiresGround: true },
  pin3: { requiresGround: true },
  pin5: { requiresPower: true },
  pin6: { requiresGround: true },
  pin7: { requiresGround: true },
  pin8: { requiresPower: true },
  pin9: { doNotConnect: true },
  pin10: { doNotConnect: true },
  pin11: { doNotConnect: true },
} as const

export const LSM6DSOXTR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C481766"],
      }}
      manufacturerPartNumber="LSM6DSOXTR"
      footprint="lga_p0.5001mm_w2.8499mm_h2.35mm_pl0.5mm"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C481766.obj?uuid=f43373e142124ec98babb70d58d97864",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C481766.step?uuid=f43373e142124ec98babb70d58d97864",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: 0 },
      }}
      {...props}
    />
  )
}
