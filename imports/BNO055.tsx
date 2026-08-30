import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["DNC1"],
  pin2: ["GND1"],
  pin3: ["VDD"],
  pin4: ["nBOOT_LOAD_PIN", "BOOT_N"],
  pin5: ["PS1"],
  pin6: ["PS0"],
  pin7: ["SWDIO"],
  pin8: ["SWCLK"],
  pin9: ["CAP"],
  pin10: ["BL_IND", "DNC8"],
  pin11: ["nRESET", "RESET_N"],
  pin12: ["DNC2"],
  pin13: ["DNC3"],
  pin14: ["INT"],
  pin15: ["DNC9"],
  pin16: ["DNC10"],
  pin17: ["COM3", "I2C_ADDR"],
  pin18: ["COM2", "GND_I2C"],
  pin19: ["COM1", "SCL", "RX"],
  pin20: ["COM0", "SDA", "TX"],
  pin21: ["DNC4"],
  pin22: ["DNC5"],
  pin23: ["DNC6"],
  pin24: ["DNC7"],
  pin25: ["GNDIO", "GND5"],
  pin26: ["XOUT32"],
  pin27: ["XIN32"],
  pin28: ["VDDIO"],
} as const

const pinAttributes = {
  pin1: { doNotConnect: true },
  pin2: { requiresGround: true },
  pin3: { requiresPower: true },
  pin7: { doNotConnect: true },
  pin8: { doNotConnect: true },
  pin10: { doNotConnect: true },
  pin12: { doNotConnect: true },
  pin13: { doNotConnect: true },
  pin15: { doNotConnect: true },
  pin16: { doNotConnect: true },
  pin18: { requiresGround: true },
  pin21: { doNotConnect: true },
  pin22: { doNotConnect: true },
  pin23: { doNotConnect: true },
  pin24: { doNotConnect: true },
  pin25: { requiresGround: true },
  pin28: { requiresPower: true },
} as const

export const BNO055 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C93216"],
      }}
      manufacturerPartNumber="BNO055"
      footprint="lga28_grid10x4_p0.4999mm_w3.626mm_h4.9999mm_pw0.25mm_pl0.5mm"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C93216.obj?uuid=52c0611456944fcd8f3e784a5fb52235",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C93216.step?uuid=52c0611456944fcd8f3e784a5fb52235",
        pcbRotationOffset: 90,
        modelOriginPosition: {
          x: 0.000025399999913133797,
          y: -0.00010160000010728254,
          z: 0,
        },
      }}
      {...props}
    />
  )
}
