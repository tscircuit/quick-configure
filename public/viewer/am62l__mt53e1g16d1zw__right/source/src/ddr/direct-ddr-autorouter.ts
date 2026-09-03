import type {
  AutorouterCompleteEvent,
  AutorouterErrorEvent,
  AutorouterProgressEvent,
  GenericLocalAutorouter,
  SimpleRouteJson,
  SimplifiedPcbTrace,
} from "@tscircuit/core"
import { AM62L_DDR_DECOUPLING_CAPACITORS } from "./am62l-lpddr4"

// The Right configuration's paired fanouts are aligned for straight global
// connections, as in core's progressive-fanout fixture. The eight DDR capacitors
// have authored bottom-layer legs to their power/ground plane vias.
export function routeDirectDdrConnections(
  input: SimpleRouteJson,
): SimplifiedPcbTrace[] {
  return input.connections.map((connection, index) => {
    const startPoint = connection.pointsToConnect[0]!
    const capacitor = AM62L_DDR_DECOUPLING_CAPACITORS.find((capacitor) =>
      connection.pointsToConnect.some((point) =>
        point.port_selector?.startsWith(`${capacitor.name}.`),
      ),
    )
    const width = connection.nominalTraceWidth ?? input.minTraceWidth
    const route: SimplifiedPcbTrace["route"] = connection.pointsToConnect.map(
      (point) => ({
        route_type: "wire",
        x: point.x,
        y: point.y,
        layer: point.layer,
        width,
      }),
    )
    if (capacitor) {
      const isPower = startPoint.port_selector?.endsWith(".pin1")
      const offset = isPower
        ? capacitor.vddViaOffset
        : capacitor.groundViaOffset
      const angle = (capacitor.pcbRotation * Math.PI) / 180
      route.push({
        route_type: "via",
        x:
          -9.5 +
          capacitor.pcbX +
          offset.x * Math.cos(angle) -
          offset.y * Math.sin(angle),
        y:
          capacitor.pcbY +
          offset.x * Math.sin(angle) +
          offset.y * Math.cos(angle),
        from_layer: "bottom",
        to_layer: isPower ? "inner2" : "inner1",
        via_diameter: 0.24,
        via_hole_diameter: 0.15,
      })
    }
    return {
      type: "pcb_trace",
      pcb_trace_id: `ddr_global_${index}`,
      connection_name: connection.source_trace_id ?? connection.name,
      route,
    }
  })
}

export async function directDdrAutorouter(
  input: SimpleRouteJson,
): Promise<GenericLocalAutorouter> {
  const handlers = {
    complete: [] as Array<(event: AutorouterCompleteEvent) => void>,
    error: [] as Array<(event: AutorouterErrorEvent) => void>,
    progress: [] as Array<(event: AutorouterProgressEvent) => void>,
  }
  const autorouter: GenericLocalAutorouter = {
    input,
    isRouting: false,
    start() {
      this.isRouting = true
      queueMicrotask(() => {
        if (!this.isRouting) return
        try {
          const traces = routeDirectDdrConnections(input)
          this.isRouting = false
          for (const handler of handlers.complete)
            handler({ type: "complete", traces })
        } catch (error) {
          this.isRouting = false
          for (const handler of handlers.error)
            handler({
              type: "error",
              error: error instanceof Error ? error : new Error(String(error)),
            })
        }
      })
    },
    stop() {
      this.isRouting = false
    },
    on(event, callback) {
      if (event === "complete")
        handlers.complete.push(
          callback as (event: AutorouterCompleteEvent) => void,
        )
      if (event === "error")
        handlers.error.push(callback as (event: AutorouterErrorEvent) => void)
      if (event === "progress")
        handlers.progress.push(
          callback as (event: AutorouterProgressEvent) => void,
        )
    },
    solveSync() {
      return routeDirectDdrConnections(input)
    },
  }
  return autorouter
}
