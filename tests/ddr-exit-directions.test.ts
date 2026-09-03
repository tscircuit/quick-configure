import { expect, test } from "bun:test"
import {
  socBusFanoutDirections as leftCpuDirections,
  dramBusFanoutDirections as leftRamDirections,
} from "../src/ddr/am62l__mt53e1g16d1zw__left.circuit"
import {
  socBusFanoutDirections as belowCpuDirections,
  dramBusFanoutDirections as belowRamDirections,
} from "../src/ddr/am62l__mt53e1g16d1zw__bottom.circuit"
import { DDR_SIGNAL_CONNECTIONS } from "../src/ddr/am62l-lpddr4"
import { rotateDdrExitDirections } from "../src/ddr/rotate-ddr-routing"

test.each([
  {
    position: "Left",
    rotation: 180,
    socBusFanoutDirections: leftCpuDirections,
    dramBusFanoutDirections: leftRamDirections,
    cpuSide: "leftside_",
    ramSide: "rightside_",
  },
  {
    position: "Bottom",
    rotation: 270,
    socBusFanoutDirections: belowCpuDirections,
    dramBusFanoutDirections: belowRamDirections,
    cpuSide: "bottomside_",
    ramSide: "topside_",
  },
] as const)(
  "$position declares all nine facing bus exits with the reference track order",
  ({
    rotation,
    socBusFanoutDirections,
    dramBusFanoutDirections,
    cpuSide,
    ramSide,
  }) => {
    const busNames = [
      ...new Set(DDR_SIGNAL_CONNECTIONS.map((s) => s.busName)),
    ].sort()
    expect(Object.keys(socBusFanoutDirections).sort()).toEqual(busNames)
    expect(Object.keys(dramBusFanoutDirections).sort()).toEqual(busNames)
    expect(
      Object.values(socBusFanoutDirections).every((side) =>
        side.startsWith(cpuSide),
      ),
    ).toBe(true)
    expect(
      Object.values(dramBusFanoutDirections).every((side) =>
        side.startsWith(ramSide),
      ),
    ).toBe(true)
    // In the normalized frame these must match core's proven Right bus exits,
    // including top/bottom ordering within an edge, not merely the facing side.
    expect(rotateDdrExitDirections(socBusFanoutDirections, rotation)).toEqual({
      DDR_BYTE0: "rightside_top",
      DDR_BYTE1: "rightside_bottom",
      DDR_ADDR_CTRL: "rightside_center",
      DDR_CLOCK: "rightside_top",
      DDR_DQS0: "rightside_top",
      DDR_DQS1: "rightside_center",
      DDR_RESET: "rightside_center",
      DDR_DMI0: "rightside_top",
      DDR_DMI1: "rightside_bottom",
    })
    expect(rotateDdrExitDirections(dramBusFanoutDirections, rotation)).toEqual({
      DDR_BYTE0: "leftside_center",
      DDR_BYTE1: "leftside_center",
      DDR_ADDR_CTRL: "leftside_center",
      DDR_CLOCK: "leftside_top",
      DDR_DQS0: "leftside_top",
      DDR_DQS1: "leftside_center",
      DDR_RESET: "leftside_top",
      DDR_DMI0: "leftside_top",
      DDR_DMI1: "leftside_center",
    })
  },
)
