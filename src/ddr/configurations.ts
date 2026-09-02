import Am62lLpddr4Right, {
  DirectDecoupling,
} from "./am62l__mt53e1g16d1zw__right.circuit"

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
    routingStatus: "unrouted" as const,
  },
] as const

export const ddrAssetFilenames = [
  "pcb.svg",
  "circuit.json",
  "source.zip",
] as const
