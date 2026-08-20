import objPath from "./MSP430FR2433IRGER.obj"
import stepPath from "./MSP430FR2433IRGER.step"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"],
  pin5: ["pin5"],
  pin6: ["pin6"],
  pin7: ["pin7"],
  pin8: ["pin8"],
  pin9: ["pin9"],
  pin10: ["pin10"],
  pin11: ["pin11"],
  pin12: ["pin12"],
  pin13: ["pin13"],
  pin14: ["pin14"],
  pin15: ["pin15"],
  pin16: ["pin16"],
  pin17: ["pin17"],
  pin18: ["DVSS2"],
  pin19: ["pin19"],
  pin20: ["pin20"],
  pin21: ["pin21"],
  pin22: ["pin22"],
  pin23: ["DVSS1"],
  pin24: ["DVCC"],
  pin25: ["EP"]
} as const

export const MSP430FR2433IRGER = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C191026"
  ]
}}
      manufacturerPartNumber="MSP430FR2433IRGER"
      footprint={<footprint>
        <smtpad portHints={["pin25"]} pcbX="-0.001016mm" pcbY="-0.000889mm" width="2.7999944mm" height="2.7999944mm" shape="rect" />
<smtpad portHints={["pin24"]} pcbX="-1.250188mm" pcbY="2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin23"]} pcbX="-0.750316mm" pcbY="2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin22"]} pcbX="-0.25019mm" pcbY="2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin21"]} pcbX="0.249682mm" pcbY="2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin20"]} pcbX="0.749808mm" pcbY="2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin19"]} pcbX="1.24968mm" pcbY="2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin18"]} pcbX="2.041652mm" pcbY="1.250061mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin17"]} pcbX="2.041652mm" pcbY="0.749935mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin16"]} pcbX="2.041652mm" pcbY="0.250063mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin15"]} pcbX="2.041652mm" pcbY="-0.250063mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin14"]} pcbX="2.041652mm" pcbY="-0.749935mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin13"]} pcbX="2.041652mm" pcbY="-1.250061mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="1.24968mm" pcbY="-2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="0.749808mm" pcbY="-2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="0.249682mm" pcbY="-2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="-0.25019mm" pcbY="-2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.750316mm" pcbY="-2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-1.250188mm" pcbY="-2.048129mm" width="0.299974mm" height="0.7999984mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-2.041652mm" pcbY="-1.249807mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="-2.041652mm" pcbY="-0.749935mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-2.041652mm" pcbY="-0.249809mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-2.041652mm" pcbY="0.250063mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-2.041652mm" pcbY="0.750189mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-2.041652mm" pcbY="1.250061mm" width="0.7999984mm" height="0.2999994mm" shape="rect" />
<silkscreenpath route={[{"x":-2.104491600000074,"y":1.7001743999999235},{"x":-2.104491600000074,"y":2.1001481999999214},{"x":-1.7001743999999235,"y":2.1000212000000147}]} />
<silkscreenpath route={[{"x":-2.1001990000000887,"y":-1.6998696000000564},{"x":-2.1001990000000887,"y":-2.099970399999961},{"x":-1.7001743999999235,"y":-2.099970399999961}]} />
<silkscreenpath route={[{"x":2.0997926000000007,"y":-1.5999460000000454},{"x":2.0997926000000007,"y":-2.099970399999961},{"x":1.699818799999889,"y":-2.099970399999961}]} />
<silkscreenpath route={[{"x":1.6954753999999639,"y":2.1001481999999214},{"x":2.095449199999962,"y":2.1001481999999214},{"x":2.095449199999962,"y":1.7001743999999235}]} />
<silkscreenpath route={[{"x":-2.4132540000000517,"y":1.9051269999999931},{"x":-2.417581420061424,"y":1.872256981271903},{"x":-2.43026877371949,"y":1.8416270000000168},{"x":-2.4504514387894005,"y":1.8153244387893892},{"x":-2.476754000000028,"y":1.7951417737193651},{"x":-2.507383981272028,"y":1.782454420061299},{"x":-2.5402540000000045,"y":1.7781270000000404},{"x":-2.5731240187280946,"y":1.782454420061299},{"x":-2.603753999999981,"y":1.7951417737193651},{"x":-2.6300565612108358,"y":1.8153244387893892},{"x":-2.6502392262806325,"y":1.8416270000000168},{"x":-2.662926579938812,"y":1.872256981271903},{"x":-2.667253999999957,"y":1.9051269999999931},{"x":-2.662926579938812,"y":1.9379970187279696},{"x":-2.6502392262806325,"y":1.9686269999999695},{"x":-2.6300565612108358,"y":1.9949295612107107},{"x":-2.603753999999981,"y":2.0151122262805075},{"x":-2.5731240187280946,"y":2.027799579938687},{"x":-2.5402540000000045,"y":2.032126999999946},{"x":-2.507383981272028,"y":2.027799579938687},{"x":-2.476754000000028,"y":2.0151122262805075},{"x":-2.4504514387894005,"y":1.9949295612107107},{"x":-2.43026877371949,"y":1.9686269999999695},{"x":-2.417581420061424,"y":1.9379970187279696},{"x":-2.4132540000000517,"y":1.9051269999999931}]} />
<silkscreentext text="{NAME}" pcbX="-0.126238mm" pcbY="3.448687mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.9289380000000165,"y":2.69868699999995},{"x":2.6764619999999013,"y":2.69868699999995},{"x":2.6764619999999013,"y":-2.7035130000001573},{"x":-2.9289380000000165,"y":-2.7035130000001573},{"x":-2.9289380000000165,"y":2.69868699999995}]} />
      </footprint>}
      cadModel={{
        objUrl: objPath,
        stepUrl: stepPath,
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.00013970000009067007, y: -0.00005079999993995443, z: -0.02 },
      }}
      {...props}
    />
  )
}