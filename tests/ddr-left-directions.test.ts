import { expect, test } from "bun:test"
import {
  socBusFanoutDirections,
  dramBusFanoutDirections,
} from "../src/ddr/am62l__mt53e1g16d1zw__left.circuit"
import { DDR_SIGNAL_CONNECTIONS } from "../src/ddr/am62l-lpddr4"
import { rotateDdrExitDirections } from "../src/ddr/rotate-ddr-routing"

test("Left declares all nine facing bus exits with the half-turn track order", () => {
  const busNames = [
    ...new Set(DDR_SIGNAL_CONNECTIONS.map((s) => s.busName)),
  ].sort()
  expect(Object.keys(socBusFanoutDirections).sort()).toEqual(busNames)
  expect(Object.keys(dramBusFanoutDirections).sort()).toEqual(busNames)
  expect(
    Object.values(socBusFanoutDirections).every((side) =>
      side.startsWith("leftside_"),
    ),
  ).toBe(true)
  expect(
    Object.values(dramBusFanoutDirections).every((side) =>
      side.startsWith("rightside_"),
    ),
  ).toBe(true)
  // In the normalized frame these must match core's proven Right bus exits,
  // including top/bottom ordering within an edge, not merely the facing side.
  expect(rotateDdrExitDirections(socBusFanoutDirections, 180)).toEqual({
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
  expect(rotateDdrExitDirections(dramBusFanoutDirections, 180)).toEqual({
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
})
