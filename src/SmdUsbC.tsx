const pinLabels = {
  1: ["GND1", "A1"],
  2: ["GND2", "B12"],
  3: ["VBUS1", "A4"],
  4: ["VBUS2", "B9"],
  5: ["SBU2", "B8"],
  6: ["CC1", "A5"],
  7: ["DM2", "B7"],
  8: ["DP1", "A6"],
  9: ["DM1", "A7"],
  10: ["DP2", "B6"],
  11: ["SBU1", "A8"],
  12: ["CC2", "B5"],
  13: ["VBUS1", "A9"],
  14: ["VBUS2", "B4"],
  15: ["GND1", "A12"],
  16: ["GND2", "B1"],
} as const

const signalPads = [
  ["B8", -1.75006],
  ["A5", -1.249934],
  ["B7", -0.750062],
  ["A6", -0.249936],
  ["A7", 0.249936],
  ["B6", 0.750062],
  ["A8", 1.24968],
  ["B5", 1.75006],
  ["A1", -3.350006],
  ["B12", -3.050032],
  ["A4", -2.549906],
  ["B9", -2.249932],
  ["B4", 2.249932],
  ["A9", 2.55016],
  ["B1", 3.050032],
  ["A12", 3.350006],
] as const

const PlatedHole = (props: any) => <platedhole {...props} />
const SmtPad = (props: any) => <smtpad {...props} />

export const SmdUsbC = (props: any) => (
  <chip
    {...props}
    cadModel={{
      objUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=2a4bc2358b36497d9ab2a66ab6419ba3&pn=C165948",
      rotationOffset: { x: 0, y: 0, z: 180 },
    }}
    pinLabels={pinLabels}
    supplierPartNumbers={{ jlcpcb: ["C165948"] }}
    schPortArrangement={{
      leftSide: { pins: [], direction: "top-to-bottom" },
      rightSide: {
        pins: [
          "VBUS1",
          "VBUS2",
          "DP1",
          "DP2",
          "DM1",
          "DM2",
          "CC1",
          "CC2",
          "SBU1",
          "SBU2",
        ],
        direction: "top-to-bottom",
      },
      bottomSide: {
        pins: ["GND1", "GND2"],
        direction: "left-to-right",
      },
    }}
    schPinStyle={{
      pin8: { topMargin: 0.4 },
      pin6: { topMargin: 0.4 },
      pin11: { topMargin: 0.2 },
      pin2: { rightMargin: 1 },
    }}
    manufacturerPartNumber="TYPE-C-31-M-12"
    footprint={
      <footprint>
        <hole pcbX={-2.899918} pcbY={1.180611} diameter={0.7500112} />
        <hole pcbX={2.899918} pcbY={1.180611} diameter={0.7500112} />
        <PlatedHole portHints={["alt_2"]} pcbX={4.325112} pcbY={-2.774086} outerHeight={1.7999964} outerWidth={1.1999976} innerHeight={1.3999972} innerWidth={0.7999984} height={1.3999972} shape="pill" />
        <PlatedHole portHints={["alt_1"]} pcbX={4.325112} pcbY={1.405738} outerHeight={1.999996} outerWidth={1.1999976} innerHeight={1.5999968} innerWidth={0.7999984} height={1.5999968} shape="pill" />
        <PlatedHole portHints={["alt_0"]} pcbX={-4.325112} pcbY={1.405738} outerHeight={1.999996} outerWidth={1.1999976} innerHeight={1.5999968} innerWidth={0.7999984} height={1.5999968} shape="pill" />
        <PlatedHole portHints={["alt_3"]} pcbX={-4.325112} pcbY={-2.774086} outerHeight={1.7999964} outerWidth={1.1999976} innerHeight={1.3999972} innerWidth={0.7999984} height={1.3999972} shape="pill" />
        {signalPads.map(([portHint, pcbX]) => (
          <SmtPad
            key={portHint}
            portHints={[portHint]}
            pcbX={pcbX}
            pcbY={2.449087}
            width={0.2999994}
            height={1.2999974}
            shape="rect"
          />
        ))}
        <silkscreenpath route={[{ x: -4.468978, y: -1.400715 }, { x: -4.468978, y: 0.462197 }]} />
        <silkscreenpath route={[{ x: 4.47101, y: -5.119097 }, { x: -4.468978, y: -5.119097 }, { x: -4.468978, y: -3.637794 }]} />
        <silkscreenpath route={[{ x: 4.47101, y: -1.40107 }, { x: 4.47101, y: 0.462553 }]} />
        <silkscreenpath route={[{ x: 4.47101, y: -5.119097 }, { x: 4.47101, y: -3.637439 }]} />
      </footprint>
    }
  />
)
