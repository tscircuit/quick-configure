import Am62lLpddr4Right, {
  DirectDecoupling,
} from "./am62l__mt53e1g16d1zw__right.circuit"

// Add a dedicated TSX file here when a new position has been routed.
export const ddrConfigurations = [
  {
    id: "am62l__mt53e1g16d1zw__right",
    cpu: "AM62L",
    ram: "MT53E1G16D1ZW",
    position: "right",
    Board: Am62lLpddr4Right,
    DirectDecoupling,
  },
] as const

export const ddrAssetFilenames = [
  "pcb.svg",
  "circuit.json",
  "source.zip",
] as const
