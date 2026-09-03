import Am62lLpddr4Right, {
  DirectDecoupling,
} from "./am62l__mt53e1g16d1zw__right.circuit"

import { createDdrFanoutState } from "./latest-fanout-autorouter"
import Am62lLpddr4Top from "./am62l__mt53e1g16d1zw__top.circuit"

// Each position owns its placement and fanout configuration in a dedicated TSX.
export const ddrConfigurations = [
  {
    id: "am62l__mt53e1g16d1zw__right",
    cpu: "AM62L",
    ram: "MT53E1G16D1ZW",
    position: "right",
    Board: Am62lLpddr4Right,
    DirectDecoupling,
    routingStatus: "routed" as const,
  },
  {
    id: "am62l__mt53e1g16d1zw__top",
    cpu: "AM62L",
    ram: "MT53E1G16D1ZW",
    position: "top",
    Board: Am62lLpddr4Top,
    DirectDecoupling: undefined,
    routingStatus: "cpu-fanout" as const,
    createRoutingState: createDdrFanoutState,
  },
] as const

export const ddrSourceFilenames = [
  "src/ddr/am62l-lpddr4.tsx",
  "src/ddr/am62l__mt53e1g16d1zw__right.circuit.tsx",
  "src/ddr/am62l__mt53e1g16d1zw__top.circuit.tsx",
  "src/ddr/configurations.ts",
  "src/ddr/direct-ddr-autorouter.ts",
  "src/ddr/latest-fanout-autorouter.ts",
  "src/ddr/validate-ddr-circuit.ts",
  "scripts/build-ddr-artifacts.ts",
  "scripts/write-ddr-source.ts",
  "package.json",
  "package-lock.json",
] as const

export const ddrAssetFilenames = [
  "pcb.svg",
  "circuit.json",
  "source/index.html",
  "source/README.md",
  ...ddrSourceFilenames.map((filename) => `source/${filename}`),
] as const
