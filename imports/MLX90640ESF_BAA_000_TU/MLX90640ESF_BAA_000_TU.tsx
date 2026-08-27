import objPath from "./MLX90640ESF_BAA_000_TU.obj"
import stepPath from "./MLX90640ESF_BAA_000_TU.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SDA"],
  pin2: ["VDD"],
  pin3: ["GND"],
  pin4: ["SCL"]
} as const

const pinAttributes = {
  pin2: {requiresPower: true},
  pin3: {requiresGround: true}
} as const

export const MLX90640ESF_BAA_000_TU = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C17380659"
  ]
}}
      manufacturerPartNumber="MLX90640ESF-BAA-000-TU"
      footprint={<footprint>
        <platedhole  portHints={["pin1"]} pcbX="-2.919984mm" pcbY="-0.000127mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin4"]} pcbX="-2.06502mm" pcbY="2.064893mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="2.919984mm" pcbY="-0.127127mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="2.064766mm" pcbY="-2.064893mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<silkscreenpath route={[{"x":-4.952999999999861,"y":1.015873000000056},{"x":-5.587999999999965,"y":1.2698729999999614},{"x":-5.080000000000041,"y":2.6668730000000096},{"x":-4.444999999999936,"y":2.4128729999999905}]} />
<silkscreenpath route={[{"x":4.999989999999912,"y":-0.00012700000002041634},{"x":4.829619472187119,"y":-1.2942196373221577},{"x":4.330118358668074,"y":-2.500122000000033},{"x":3.5355268348649815,"y":-3.535653834865002},{"x":2.4999950000001263,"y":-4.330245358668094},{"x":1.294092637322251,"y":-4.829746472187026},{"x":1.1368683772161603e-13,"y":-5.000117000000046},{"x":-1.294092637322251,"y":-4.829746472187026},{"x":-2.4999950000000126,"y":-4.330245358668094},{"x":-3.535526834864868,"y":-3.535653834865002},{"x":-4.330118358668074,"y":-2.500122000000033},{"x":-4.829619472187005,"y":-1.2942196373221577},{"x":-4.999989999999912,"y":-0.00012700000002041634},{"x":-4.829619472187005,"y":1.293965637322117},{"x":-4.330118358668074,"y":2.499867999999992},{"x":-3.535526834864868,"y":3.535399834864961},{"x":-2.4999950000000126,"y":4.329991358668053},{"x":-1.294092637322251,"y":4.829492472187098},{"x":1.1368683772161603e-13,"y":4.999863000000005},{"x":1.294092637322251,"y":4.829492472187098},{"x":2.4999950000001263,"y":4.329991358668053},{"x":3.5355268348649815,"y":3.535399834864961},{"x":4.330118358668074,"y":2.499867999999992},{"x":4.829619472187119,"y":1.293965637322117},{"x":4.999989999999912,"y":-0.00012700000002041634}]} />
<silkscreentext text="{NAME}" pcbX="-0.2794mm" pcbY="6.003673mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-5.8252999999998565,"y":5.253672999999935},{"x":5.266500000000065,"y":5.253672999999935},{"x":5.266500000000065,"y":-5.25392700000009},{"x":-5.8252999999998565,"y":-5.25392700000009},{"x":-5.8252999999998565,"y":5.253672999999935}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.016214699999868465, y: 0.000012700000070253736, z: -0.000012800000001256251 },
      }}
      {...props}
    />
  )
}