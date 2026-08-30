import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SDA"],
  pin2: ["SCL"],
  pin3: ["VDD"],
  pin4: ["VSS"],
} as const

const pinAttributes = {
  pin3: { requiresPower: true },
  pin4: { requiresGround: true },
} as const

export const SHT41_AD1B_R2 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C7461861"],
      }}
      manufacturerPartNumber="SHT41-AD1B-R2"
      footprint="dfn4_p0.8001mm_w1.9mm_pw0.3mm_pl0.5mm"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C7461861.obj?uuid=d740bd0688d14669b1c87f9602af067d",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C7461861.step?uuid=d740bd0688d14669b1c87f9602af067d",
        pcbRotationOffset: 0,
        modelOriginPosition: {
          x: -0.000012700000070253736,
          y: 0.000012700000070253736,
          z: -0.02,
        },
      }}
      {...props}
    />
  )
}
