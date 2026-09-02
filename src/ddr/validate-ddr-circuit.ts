import type { AnyCircuitElement } from "circuit-json"
import { AM62L_DIRECT_POWER_BALLS } from "./am62l-lpddr4"

// Match core's reference one-for-one: these 45 processor power balls have
// logical PDN membership, with their segmented power planes left to the host
// board. Every other connectivity, routing, or clearance error is unexpected.
export function validateDdrCircuit(circuitJson: AnyCircuitElement[]) {
  const expectedMessages = new Set(
    AM62L_DIRECT_POWER_BALLS.map(
      (ball) =>
        `Port [U1.${ball.ballName}] is not connected to net [${ball.railNetName}] by a PCB trace.`,
    ),
  )
  const errors = circuitJson.filter((record) => record.type.endsWith("_error"))
  for (const error of errors) {
    if (
      error.type !== "pcb_port_not_connected_error" ||
      !expectedMessages.delete(error.message)
    ) {
      throw new Error(`Unexpected DDR circuit error: ${JSON.stringify(error)}`)
    }
  }
  if (expectedMessages.size) {
    throw new Error(
      `Missing ${expectedMessages.size} expected processor PDN membership diagnostics`,
    )
  }
}
