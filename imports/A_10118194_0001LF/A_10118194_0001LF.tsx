import objPath from "./A_10118194_0001LF.obj"
import stepPath from "./A_10118194_0001LF.step"
import type { ConnectorProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VBUS"],
  pin2: ["Data_NEG"],
  pin3: ["Data_POS"],
  pin4: ["ID"],
  pin5: ["GND"],
  pin6: ["S1"],
  pin7: ["pin6_alt1"],
  pin8: ["pin6_alt1"],
  pin9: ["pin6_alt1"]
} as const

export const A_10118194_0001LF = (props: ConnectorProps) => {
  return (
    <connector
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C132563"
  ]
}}
      manufacturerPartNumber="10118194-0001LF"
      footprint={<footprint>
        <platedhole  portHints={["pin6"]} pcbX="2.499995mm" pcbY="1.0375075mm" holeWidth="0.8500364mm" holeHeight="0.5500116mm" outerWidth="1.2500102mm" outerHeight="0.9499854mm" shape="pill" />
<platedhole  portHints={["pin7"]} pcbX="-2.499995mm" pcbY="1.0375075mm" holeWidth="0.8500364mm" holeHeight="0.5500116mm" outerWidth="1.2500102mm" outerHeight="0.9499854mm" shape="pill" />
<platedhole  portHints={["pin8"]} pcbX="-3.499993mm" pcbY="-1.6625125mm" holeWidth="0.4999736mm" holeHeight="1.0499852mm" outerWidth="0.999998mm" outerHeight="1.5500096mm" shape="pill" />
<platedhole  portHints={["pin9"]} pcbX="3.499993mm" pcbY="-1.6625125mm" holeWidth="0.4999736mm" holeHeight="1.0499852mm" outerWidth="0.999998mm" outerHeight="1.5500096mm" shape="pill" />
<smtpad portHints={["pin3"]} pcbX="-0.000127mm" pcbY="1.0375075mm" width="0.3999992mm" height="1.35001mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.650113mm" pcbY="1.0375075mm" width="0.3999992mm" height="1.35001mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="1.300353mm" pcbY="1.0375075mm" width="0.3999992mm" height="1.35001mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.650367mm" pcbY="1.0375075mm" width="0.3999992mm" height="1.35001mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-1.300607mm" pcbY="1.0375075mm" width="0.3999992mm" height="1.35001mm" shape="rect" />
<silkscreenpath route={[{"x":4.099433000000005,"y":-1.1295188999999937},{"x":4.099433000000005,"y":0.5879275000000064}]} />
<silkscreenpath route={[{"x":4.099433000000005,"y":-3.811352499999998},{"x":4.099433000000005,"y":-2.195506100000003}]} />
<silkscreenpath route={[{"x":-3.3503869999999836,"y":1.286427500000002},{"x":-3.799966999999981,"y":1.286427500000002},{"x":-4.099686999999989,"y":0.9384475000000094},{"x":-4.099686999999989,"y":0.6387275000000017}]} />
<silkscreenpath route={[{"x":-4.099686999999989,"y":-1.1301284999999837},{"x":-4.099686999999989,"y":0.6387275000000017}]} />
<silkscreenpath route={[{"x":-4.099686999999989,"y":-3.8621525000000076},{"x":-4.099686999999989,"y":-2.1948964999999987}]} />
<silkscreenpath route={[{"x":-3.449446999999978,"y":-4.413332499999996},{"x":3.8100000000000023,"y":-4.413332499999996}]} />
<silkscreenpath route={[{"x":-4.099686999999989,"y":-3.8621525000000076},{"x":-4.099686999999989,"y":-4.413332499999996},{"x":-3.449446999999978,"y":-4.413332499999996}]} />
<silkscreenpath route={[{"x":4.099433000000005,"y":-3.811352499999998},{"x":4.099433000000005,"y":-4.413332499999996},{"x":3.700653000000017,"y":-4.413332499999996}]} />
<silkscreenpath route={[{"x":3.5990530000000263,"y":1.286427500000002},{"x":4.099433000000005,"y":1.286427500000002},{"x":4.099433000000005,"y":0.5879275000000064}]} />
<silkscreentext text="{NAME}" pcbX="0.012573mm" pcbY="2.7233075mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-4.33952699999999,"y":1.9733075000000042},{"x":4.364673000000025,"y":1.9733075000000042},{"x":4.364673000000025,"y":-4.648092500000018},{"x":-4.33952699999999,"y":-4.648092500000018},{"x":-4.33952699999999,"y":1.9733075000000042}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 1.3024910999999981, z: -1.2250012 },
      }}
      {...props}
    />
  )
}