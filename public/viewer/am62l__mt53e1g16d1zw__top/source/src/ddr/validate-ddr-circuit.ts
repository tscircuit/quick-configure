import type { AnyCircuitElement } from "circuit-json"
import {
  AM62L_DIRECT_POWER_BALLS,
  DDR_SIGNAL_CONNECTIONS,
} from "./am62l-lpddr4"

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

// Top is a CPU fanout reference. Its only expected errors are the 33
// deliberately unfinished connections to RAM; keep them in Circuit JSON.
export function validateDdrCpuFanoutCircuit(circuitJson: AnyCircuitElement[]) {
  const sourceTraces = circuitJson.filter(
    (record) => record.type === "source_trace",
  )
  const pcbTraces = circuitJson.filter((record) => record.type === "pcb_trace")
  if (sourceTraces.length !== 135 || pcbTraces.length !== 135)
    throw new Error("Expected all 135 CPU fanout traces")
  for (const source of sourceTraces) {
    if (
      pcbTraces.filter(
        (trace) => trace.source_trace_id === source.source_trace_id,
      ).length !== 1
    )
      throw new Error(`Missing CPU fanout trace for ${source.name}`)
  }
  const expected = new Map(
    DDR_SIGNAL_CONNECTIONS.map((connection) => {
      const source = sourceTraces.find(
        (trace) => trace.name === connection.traceName,
      )!
      const pcbTrace = pcbTraces.find(
        (trace) => trace.source_trace_id === source.source_trace_id,
      )!
      return [
        source.source_trace_id,
        {
          pcbTraceId: pcbTrace.pcb_trace_id,
          suffix: `is missing a connection to smtpad[.U2 > .pin${connection.memoryPinNumber}]`,
        },
      ]
    }),
  )
  for (const error of circuitJson.filter((record) =>
    record.type.endsWith("_error"),
  )) {
    const notice =
      error.type === "pcb_trace_error" && expected.get(error.source_trace_id)
    if (
      !notice ||
      error.type !== "pcb_trace_error" ||
      error.pcb_trace_id !== notice.pcbTraceId ||
      !error.message.endsWith(notice.suffix)
    )
      throw new Error(`Unexpected Top circuit error: ${JSON.stringify(error)}`)
    expected.delete(error.source_trace_id)
  }
  if (expected.size)
    throw new Error(`Missing ${expected.size} expected RAM routing diagnostics`)
}
