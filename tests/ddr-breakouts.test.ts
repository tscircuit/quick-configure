import { describe, expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { join } from "node:path"
import {
  ddrAssetFilenames,
  ddrConfigurations,
  ddrSourceFilenames,
} from "../src/ddr/configurations"
import {
  validateDdrCircuit,
  validateCoordinatedDdrCircuit,
  validateDdrGlobalRouting,
  validateDdrViaLocations,
} from "../src/ddr/validate-ddr-circuit"

const projectRoot = join(import.meta.dir, "..")
const boardId = ddrConfigurations[0].id
const viewerDir = join(projectRoot, "public", "viewer", boardId)
const circuit: AnyCircuitElement[] = await Bun.file(
  join(viewerDir, "circuit.json"),
).json()

describe("DDR breakout artifacts", () => {
  test("preserves the reference packages and places LPDDR4 to the right", () => {
    const components = circuit.filter(
      (record) => record.type === "source_component",
    )
    const cpu = components.find((component) => component.name === "U1")!
    const ram = components.find((component) => component.name === "U2")!
    expect(cpu.manufacturer_part_number).toBe("AM62L32BOGHAANBR")
    expect(ram.manufacturer_part_number).toBe("MT53E1G16D1ZW")
    const pcbComponents = circuit.filter(
      (record) => record.type === "pcb_component",
    )
    const cpuPcb = pcbComponents.find(
      (component) => component.source_component_id === cpu.source_component_id,
    )!
    const ramPcb = pcbComponents.find(
      (component) => component.source_component_id === ram.source_component_id,
    )!
    expect(ramPcb.center.x).toBeGreaterThan(cpuPcb.center.x)
    expect(ramPcb.rotation).toBe(90)
    const pads = circuit.filter((record) => record.type === "pcb_smtpad")
    expect(
      pads.filter((pad) => pad.pcb_component_id === cpuPcb.pcb_component_id),
    ).toHaveLength(373)
    expect(
      pads.filter((pad) => pad.pcb_component_id === ramPcb.pcb_component_id),
    ).toHaveLength(200)
    expect(
      components.filter((component) => component.ftype === "simple_capacitor"),
    ).toHaveLength(68)
    const board = circuit.find((record) => record.type === "pcb_board")!
    expect([board.width, board.height, board.num_layers]).toEqual([40, 20, 8])
  })

  test("routes all 33 DDR signals through both fanouts and preserves pair skew", () => {
    const signalNames = [
      ...Array.from({ length: 16 }, (_, index) => `DQ${index}`),
      ...Array.from({ length: 6 }, (_, index) => `CA${index}`),
      "CS",
      "CKE",
      "CK_t",
      "CK_c",
      "DQS0_t",
      "DQS0_c",
      "DQS1_t",
      "DQS1_c",
      "RESET_n",
      "DMI0",
      "DMI1",
    ]
    const sourceTraces = circuit.filter(
      (record) => record.type === "source_trace",
    )
    const pcbTraces = circuit.filter((record) => record.type === "pcb_trace")
    const lengths = new Map<string, number>()
    for (const name of signalNames) {
      const sourceTrace = sourceTraces.find((trace) => trace.name === name)!
      expect(sourceTrace.connected_source_port_ids).toHaveLength(2)
      const routes = pcbTraces.filter(
        (trace) => trace.source_trace_id === sourceTrace.source_trace_id,
      )
      expect(routes).toHaveLength(3)
      let length = 0
      for (const trace of routes) {
        for (const [index, point] of trace.route.entries()) {
          if (point.route_type === "wire")
            expect(["inner1", "inner2", "inner3"]).not.toContain(point.layer)
          const previous = trace.route[index - 1]
          if (previous && "x" in previous && "x" in point)
            length += Math.hypot(point.x - previous.x, point.y - previous.y)
        }
      }
      lengths.set(name, length)
    }
    for (const pair of ["CK", "DQS0", "DQS1"]) {
      expect(
        Math.abs(lengths.get(`${pair}_t`)! - lengths.get(`${pair}_c`)!),
      ).toBeLessThanOrEqual(0.5)
    }
    expect(() => validateDdrCircuit(circuit)).not.toThrow()
  })

  test("rejects an unrouted DDR signal rather than hiding it with expected PDN notices", () => {
    const existing = circuit.find(
      (record) => record.type === "pcb_port_not_connected_error",
    )!
    expect(() =>
      validateDdrCircuit([
        ...circuit,
        { ...existing, message: "Port [U1.F4] is not connected to U2.DQ0" },
      ]),
    ).toThrow("Unexpected DDR circuit error")
  })

  test("publishes the DDR page, shared assets, and reproducible source files", async () => {
    for (const path of [
      "index.html",
      "ddr-breakouts/index.html",
      "assets/site.css",
      "assets/ddr-breakouts.js",
    ]) {
      expect(await Bun.file(join(projectRoot, "public", path)).text()).toBe(
        await Bun.file(join(projectRoot, "site", path)).text(),
      )
    }
    for (const filename of ddrAssetFilenames)
      expect(Bun.file(join(viewerDir, filename)).size).toBeGreaterThan(0)
    for (const filename of ddrSourceFilenames) {
      expect(await Bun.file(join(viewerDir, "source", filename)).text()).toBe(
        await Bun.file(join(projectRoot, filename)).text(),
      )
    }
    expect(await Bun.file(join(viewerDir, "source.zip")).exists()).toBe(false)
    const page = await Bun.file(
      join(projectRoot, "site", "ddr-breakouts", "index.html"),
    ).text()
    expect(page.match(/<select\b/g)).toHaveLength(3)
    expect(page).not.toMatch(/<option[^>]*\bdisabled\b/)
    expect(page).toContain(">Bottom</option>")
    for (const position of ["top", "left", "bottom"])
      expect(page).toContain(
        `value="${position}" data-board-id="am62l__mt53e1g16d1zw__${position}"`,
      )
    expect(page).toContain('data-routing-status="routed"')
    expect(page).toContain("All four RAM positions are routed")
  })

  test("omits routing debug objects from every PCB drawing", async () => {
    for (const configuration of ddrConfigurations) {
      const svg = await Bun.file(
        join(projectRoot, "public", "viewer", configuration.id, "pcb.svg"),
      ).text()
      const records = (await Bun.file(
        join(projectRoot, "public", "viewer", configuration.id, "circuit.json"),
      ).json()) as Array<{ type: string; label?: string }>
      const debugLabels = records
        .filter((record) => record.type === "pcb_debug_object")
        .map((record) => record.label)
        .filter((label): label is string => Boolean(label))
      expect(debugLabels.length).toBeGreaterThan(0)
      for (const label of debugLabels) expect(svg).not.toContain(label)
    }
  })
})

describe.each(["top", "left", "bottom"] as const)(
  "%s DDR reference",
  (position) => {
    const configuration = ddrConfigurations.find(
      (config) => config.position === position,
    )!
    const layout = {
      top: {
        dimensions: [32, 54, 8],
        cpu: { x: 0, y: -9.5 },
        ram: { x: -1.81916, y: 9.616917 },
        cpuRotation: 90,
        ramRotation: 180,
      },
      left: {
        dimensions: [54, 32, 8],
        cpu: { x: 9.5, y: 0 },
        ram: { x: -9.616917, y: -1.81916 },
        cpuRotation: 180,
        ramRotation: 270,
      },
      bottom: {
        dimensions: [32, 54, 8],
        cpu: { x: 0, y: 9.5 },
        ram: { x: 1.81916, y: -9.616917 },
        cpuRotation: 270,
        ramRotation: 0,
      },
    }[position]
    const topViewerDir = join(projectRoot, "public", "viewer", configuration.id)

    test("routes both fanouts with exits facing the other package", async () => {
      const top: AnyCircuitElement[] = await Bun.file(
        join(topViewerDir, "circuit.json"),
      ).json()
      const board = top.find((record) => record.type === "pcb_board")!
      expect([board.width, board.height, board.num_layers]).toEqual(
        layout.dimensions,
      )
      expect(board.min_via_hole_diameter).toBe(0.15)
      const parts = top.filter((record) => record.type === "pcb_component")
      expect(parts).toHaveLength(10)
      const cpuSource = top
        .filter((record) => record.type === "source_component")
        .find(
          (record) =>
            record.type === "source_component" && record.name === "U1",
        )!
      const ramSource = top
        .filter((record) => record.type === "source_component")
        .find(
          (record) =>
            record.type === "source_component" && record.name === "U2",
        )!
      const cpu = parts.find(
        (part) => part.source_component_id === cpuSource.source_component_id,
      )!
      const ram = parts.find(
        (part) => part.source_component_id === ramSource.source_component_id,
      )!
      expect(cpu.center).toEqual(layout.cpu)
      expect(ram.center).toEqual(layout.ram)
      expect(cpu.rotation).toBe(layout.cpuRotation)
      expect(ram.rotation).toBe(layout.ramRotation)
      const pads = top.filter((record) => record.type === "pcb_smtpad")
      expect(
        pads.filter((pad) => pad.pcb_component_id === cpu.pcb_component_id),
      ).toHaveLength(373)
      expect(
        pads.filter((pad) => pad.pcb_component_id === ram.pcb_component_id),
      ).toHaveLength(200)

      const traces = top.filter((record) => record.type === "source_trace")
      expect(traces).toHaveLength(261)
      expect(
        traces.filter((trace) => trace.name?.startsWith("U1_VSS_")),
      ).toHaveLength(97)
      expect(
        traces.filter((trace) => trace.name?.startsWith("U1_VDDS_DDR_")),
      ).toHaveLength(5)
      const signals = traces.filter(
        (trace) => trace.connected_source_port_ids.length === 2,
      )
      expect(signals).toHaveLength(33)
      const ports = top.filter((record) => record.type === "source_port")
      const exits = top.filter((record) => record.type === "pcb_breakout_point")
      expect(exits).toHaveLength(66)
      for (const signal of signals) {
        expect(
          signal.connected_source_port_ids
            .map(
              (id) =>
                ports.find((port) => port.source_port_id === id)!
                  .source_component_id,
            )
            .sort(),
        ).toEqual([cpu.source_component_id, ram.source_component_id].sort())
        const signalExits = exits.filter(
          (exit) => exit.source_trace_id === signal.source_trace_id,
        )
        expect(signalExits).toHaveLength(2)
        const cpuExit = signalExits.find(
          (exit) => exit.pcb_group_id === cpu.pcb_group_id,
        )!
        const ramExit = signalExits.find(
          (exit) => exit.pcb_group_id === ram.pcb_group_id,
        )!
        if (position === "top") {
          expect(cpuExit.y).toBeGreaterThan(cpu.center.y + cpu.height / 2)
          expect(ramExit.y).toBeLessThan(ram.center.y - ram.height / 2)
          expect(cpuExit.y).toBeLessThan(ramExit.y)
        } else if (position === "bottom") {
          expect(cpuExit.y).toBeLessThan(cpu.center.y - cpu.height / 2)
          expect(ramExit.y).toBeGreaterThan(ram.center.y + ram.height / 2)
          expect(cpuExit.y).toBeGreaterThan(ramExit.y)
        } else {
          expect(cpuExit.x).toBeLessThan(cpu.center.x - cpu.width / 2)
          expect(ramExit.x).toBeGreaterThan(ram.center.x + ram.width / 2)
          expect(cpuExit.x).toBeGreaterThan(ramExit.x)
          expect(cpuExit.layer).toBe(ramExit.layer)
        }
      }
      expect(() => validateCoordinatedDdrCircuit(top)).not.toThrow()
      expect(() => validateDdrGlobalRouting(top)).not.toThrow()
      expect(() => validateDdrViaLocations(top)).not.toThrow()
      const withOutsideVia = structuredClone(top)
      const displacedVia = withOutsideVia.find(
        (record) => record.type === "pcb_via",
      )!
      displacedVia.x = position === "left" ? 0 : 14
      displacedVia.y = position === "left" ? 14 : 0
      expect(() => validateDdrViaLocations(withOutsideVia)).toThrow(
        "outside the fanouts",
      )
      const phases = top.filter((record) => record.type === "pcb_debug_object")
      expect(phases).toHaveLength(3)
      const pcbTraces = top.filter((record) => record.type === "pcb_trace")
      expect(pcbTraces).toHaveLength(327)
      for (const signal of signals) {
        const routes = pcbTraces.filter(
          (trace) => trace.source_trace_id === signal.source_trace_id,
        )
        expect(routes).toHaveLength(3)
        for (const part of [cpu, ram]) {
          const exit = exits.find(
            (exit) =>
              exit.source_trace_id === signal.source_trace_id &&
              exit.pcb_group_id === part.pcb_group_id,
          )!
          // Both a local fanout and the global trace must meet at this same
          // coordinate on the same copper layer, regardless of trace IDs.
          const endsAtExit = routes.filter((trace) =>
            [trace.route[0], trace.route.at(-1)].some(
              (point) =>
                point?.route_type === "wire" &&
                point.layer === exit.layer &&
                Math.hypot(point.x - exit.x, point.y - exit.y) < 1e-6,
            ),
          )
          expect(endsAtExit).toHaveLength(2)
        }
        for (const trace of routes)
          for (const point of trace.route) {
            if (point.route_type === "wire")
              expect(["inner1", "inner2", "inner3"]).not.toContain(point.layer)
          }
      }
      expect(
        top.filter((record) => record.type.endsWith("_error")),
      ).toHaveLength(0)
      expect(
        top.find((record) => record.type === "pcb_note_text")!.text,
      ).toContain("Coordinated fanouts")
      const withBrokenJoin = structuredClone(top)
      const globalTrace = withBrokenJoin.find(
        (record) =>
          record.type === "pcb_trace" &&
          record.pcb_trace_id.includes("ddr_coordinated_global"),
      )!
      if (globalTrace.type !== "pcb_trace")
        throw new Error("Missing global trace")
      // Move the entire global segment off the board. Moving only one endpoint
      // along a horizontal trace can leave it overlapping its fanout copper.
      for (const point of globalTrace.route) {
        if (point.route_type !== "wire")
          throw new Error("Expected a global wire")
        point.x += 100
        point.y += 100
      }
      expect(() => validateCoordinatedDdrCircuit(withBrokenJoin)).toThrow(
        "Disconnected DDR copper",
      )
      const unexpected = circuit.find(
        (record) => record.type === "pcb_port_not_connected_error",
      )!
      expect(() => validateCoordinatedDdrCircuit([...top, unexpected])).toThrow(
        "Unexpected coordinated DDR circuit error",
      )
    })

    test("ships browsable source files instead of a ZIP", async () => {
      for (const filename of ddrAssetFilenames)
        expect(Bun.file(join(topViewerDir, filename)).size).toBeGreaterThan(0)
      const entry = `src/ddr/${configuration.id}.circuit.tsx`
      expect(await Bun.file(join(topViewerDir, "source", entry)).text()).toBe(
        await Bun.file(join(projectRoot, entry)).text(),
      )
      const index = await Bun.file(
        join(topViewerDir, "source", "index.html"),
      ).text()
      expect(index).toContain(encodeURIComponent(entry))
      expect(index).toContain("Download file")
      expect(await Bun.file(join(topViewerDir, "source.zip")).exists()).toBe(
        false,
      )
    })
  },
)

test("all references publish the three captured routing phases", async () => {
  for (const configuration of ddrConfigurations) {
    const phases = await Bun.file(
      join(
        projectRoot,
        "public",
        "viewer",
        configuration.id,
        "routing-phases.json",
      ),
    ).json()
    expect(
      phases.map((phase: { connectionCount: number }) => phase.connectionCount),
    ).toEqual([135, 143, 49])
    for (const phase of phases) {
      expect(phase.outputTraces.length).toBeGreaterThanOrEqual(
        phase.connectionCount,
      )
      expect(phase.bounds.maxX).toBeGreaterThan(phase.bounds.minX)
      expect(phase.bounds.maxY).toBeGreaterThan(phase.bounds.minY)
    }
  }
})
