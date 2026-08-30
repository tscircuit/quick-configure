import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SCL"],
  pin2: ["VDD"],
  pin3: ["GND"],
  pin4: ["SDA"],
} as const

const pinAttributes = {
  pin2: { requiresPower: true },
  pin3: { requiresGround: true },
} as const

export const VEML7700_TR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C504893"],
      }}
      manufacturerPartNumber="VEML7700-TR"
      footprint="smdpads4_p1.27mm_pw0.8mm_ph1.8mm_pin1location(rightside,top)"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C504893.obj?uuid=9ed0f271771b49f39e6267a2e00848fb",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C504893.step?uuid=9ed0f271771b49f39e6267a2e00848fb",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.44399789999990846, z: -1.491251 },
      }}
      {...props}
    />
  )
}
