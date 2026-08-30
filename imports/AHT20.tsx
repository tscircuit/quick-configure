import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["NC1"],
  pin2: ["VDD"],
  pin3: ["SCL"],
  pin4: ["SDA"],
  pin5: ["GND"],
  pin6: ["NC2"],
} as const

const pinAttributes = {
  pin1: { doNotConnect: true },
  pin2: { requiresPower: true },
  pin5: { requiresGround: true },
  pin6: { doNotConnect: true },
} as const

export const AHT20 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C2757850"],
      }}
      manufacturerPartNumber="AHT20"
      footprint="dfn6_p1mm_w2.8mm_pw0.5mm_pl0.8mm_pin1location(rightside,bottom)"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C2757850.obj?uuid=a308fd17fbe8498ab74fbda4bd74586a",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C2757850.step?uuid=a308fd17fbe8498ab74fbda4bd74586a",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0, y: 0, z: -0.01 },
      }}
      {...props}
    />
  )
}
