import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SDA"],
  pin2: ["SCL"],
  pin3: ["Alert"],
  pin4: ["GND"],
  pin5: ["A2"],
  pin6: ["A1"],
  pin7: ["A0"],
  pin8: ["VDD"],
} as const

const pinAttributes = {
  pin4: { requiresGround: true },
  pin8: { requiresPower: true },
} as const

export const MCP9808T_E_MS = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C129490"],
      }}
      manufacturerPartNumber="MCP9808T-E/MS"
      footprint={
        <footprint>
          <smtpad
            portHints={["pin1"]}
            pcbX="-0.975106mm"
            pcbY="-2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin2"]}
            pcbX="-0.32512mm"
            pcbY="-2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin3"]}
            pcbX="0.32512mm"
            pcbY="-2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin4"]}
            pcbX="0.975106mm"
            pcbY="-2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin5"]}
            pcbX="0.975106mm"
            pcbY="2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin6"]}
            pcbX="0.32512mm"
            pcbY="2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin7"]}
            pcbX="-0.32512mm"
            pcbY="2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <smtpad
            portHints={["pin8"]}
            pcbX="-0.975106mm"
            pcbY="2.29997mm"
            width="0.4059936mm"
            height="1.397mm"
            shape="rect"
          />
          <silkscreenpath
            route={[
              { x: -1.4784070000000042, y: -0.6477000000000004 },
              { x: -1.4784070000000042, y: -1.2999974000000094 },
              { x: 1.4999970000000076, y: -1.2999974000000094 },
              { x: 1.4999970000000076, y: 1.2999973999999952 },
              { x: -1.4784070000000042, y: 1.2999973999999952 },
              { x: -1.4784070000000042, y: 0.6477000000000004 },
            ]}
          />
          <silkscreenpath
            route={[
              { x: -1.4784070000000042, y: 0.6477000000000004 },
              { x: -1.4784070000000042, y: -0.6477000000000004 },
            ]}
          />
          <silkscreenpath
            route={[
              { x: -1.5300960000000146, y: -2.1998940000000005 },
              { x: -1.534181084537849, y: -2.2309232976792543 },
              { x: -1.546157946391105, y: -2.259838000000002 },
              { x: -1.5652103822171028, y: -2.284667617782887 },
              { x: -1.5900399999999877, y: -2.303720053608899 },
              { x: -1.6189547023207496, y: -2.3156969154621407 },
              { x: -1.6499840000000034, y: -2.3197819999999894 },
              { x: -1.6810132976792431, y: -2.3156969154621407 },
              { x: -1.7099279999999908, y: -2.303720053608899 },
              { x: -1.7347576177828898, y: -2.284667617782887 },
              { x: -1.7538100536089019, y: -2.259838000000002 },
              { x: -1.7657869154621437, y: -2.2309232976792543 },
              { x: -1.7698719999999923, y: -2.1998940000000005 },
              { x: -1.7657869154621437, y: -2.1688647023207466 },
              { x: -1.7538100536089019, y: -2.139949999999999 },
              { x: -1.7347576177828898, y: -2.1151203822171 },
              { x: -1.7099279999999908, y: -2.096067946391088 },
              { x: -1.6810132976792431, y: -2.084091084537846 },
              { x: -1.6499840000000034, y: -2.0800059999999974 },
              { x: -1.6189547023207496, y: -2.084091084537846 },
              { x: -1.5900399999999877, y: -2.096067946391088 },
              { x: -1.5652103822171028, y: -2.1151203822171 },
              { x: -1.546157946391105, y: -2.139949999999999 },
              { x: -1.534181084537849, y: -2.1688647023207466 },
              { x: -1.5300960000000146, y: -2.1998940000000005 },
            ]}
          />
          <silkscreentext
            text="{NAME}"
            pcbX="-0.124714mm"
            pcbY="4.0099mm"
            anchorAlignment="center"
            fontSize="1mm"
          />
          <courtyardoutline
            outline={[
              { x: -2.0130139999999983, y: 3.259900000000002 },
              { x: 1.7635860000000037, y: 3.259900000000002 },
              { x: 1.7635860000000037, y: -3.2345000000000113 },
              { x: -2.0130139999999983, y: -3.2345000000000113 },
              { x: -2.0130139999999983, y: 3.259900000000002 },
            ]}
          />
        </footprint>
      }
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C129490.obj?uuid=ad9a0033bb724b3cb918db51ef2b8c4f",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C129490.step?uuid=ad9a0033bb724b3cb918db51ef2b8c4f",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0.000012699999999199463, z: 0 },
      }}
      {...props}
    />
  )
}
