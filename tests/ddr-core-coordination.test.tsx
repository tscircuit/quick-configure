import { createRotatedDdrWindingSolver } from "../src/ddr/rotated-ddr-winding-solver"
import { expect, test } from "bun:test"
import { Circuit } from "@tscircuit/core"
import { Fragment } from "react"
import {
  createDdrFanoutAutorouter,
  createDdrFanoutState,
} from "../src/ddr/latest-fanout-autorouter"
import { createCoordinatedDdrGlobalAutorouter } from "../src/ddr/coordinated-ddr-global-autorouter"

// Exercise the same adapter, preset, and global join used by the rotated layouts. This small
// circuit separates the core handoff contract from the dense AM62L solve.
test.each([90, 180, 270] as const)(
  "%d degree layout uses core's paired exits without global layer changes",
  async (rotation) => {
    const windingSolver = createRotatedDdrWindingSolver(rotation)
    const state = createDdrFanoutState()
    const circuit = new Circuit()
    circuit.add(
      <board
        width={rotation === 180 ? 24 : 12}
        height={rotation === 180 ? 12 : 24}
        layers={8}
        schematicDisabled
        minTraceWidth={0.1}
        defaultTraceWidth={0.1}
        minViaHoleDiameter={0.2}
        minViaPadDiameter={0.5}
      >
        <autoroutingphase
          autorouter={{
            algorithmFn: createCoordinatedDdrGlobalAutorouter(state, rotation),
          }}
        />
        {[-5, 5].map((pcbY, index) => {
          const directions = {
            DATA: (
              {
                90: ["topside_center", "bottomside_center"],
                180: ["leftside_center", "rightside_center"],
                270: ["bottomside_center", "topside_center"],
              } as const
            )[rotation][index]!,
          }
          return (
            <breakout
              key={pcbY}
              name={`FANOUT${index}`}
              pcbX={rotation === 180 ? -pcbY : 0}
              pcbY={rotation === 180 ? 0 : rotation === 90 ? pcbY : -pcbY}
              width={6}
              height={6}
              fanoutRoutingLayers={["bottom"]}
              busFanoutDirections={directions}
              autorouter={{
                preset: "fanout",
                implicitBreakoutPointSolverFn: windingSolver,
                algorithmFn: createDdrFanoutAutorouter(
                  directions,
                  {
                    matchLengths: false,
                    referenceRotation: rotation,
                    referenceFramePrecision: 12,
                  },
                  state,
                ),
              }}
            >
              <chip
                name={`U${index + 1}`}
                pcbRotation={rotation}
                footprint={
                  <footprint>
                    {Array.from({ length: 16 }, (_, padIndex) => (
                      <Fragment key={padIndex}>
                        <smtpad
                          portHints={[`pin${padIndex + 1}`]}
                          shape="circle"
                          radius={0.175}
                          pcbX={(padIndex % 4) * 0.8 - 1.2}
                          pcbY={Math.floor(padIndex / 4) * 0.8 - 1.2}
                        />
                      </Fragment>
                    ))}
                  </footprint>
                }
              />
            </breakout>
          )
        })}
        {[6, 7].map((pin) => (
          <Fragment key={pin}>
            <trace
              name={`DATA${pin}`}
              from={`.U1 > .pin${pin}`}
              to={`.U2 > .pin${pin}`}
            />
          </Fragment>
        ))}
        <bus
          name="DATA"
          connections={["DATA6", "DATA7"]}
          preferredLayers={["bottom"]}
        />
      </board>,
    )
    await circuit.renderUntilSettled()
    expect(
      circuit
        .getCircuitJson()
        .filter((record) => record.type.endsWith("_error")),
    ).toEqual([])
    expect(state.fanouts).toHaveLength(2)
    const cpu = state.fanouts[0]!
    const ram = state.fanouts[1]!
    for (const connection of ram.input.connections) {
      const target =
        ram.input.buses![0]!.connectionExitTargets![connection.name]!
      const cpuConnection = cpu.input.connections.find(
        (candidate) => candidate.source_trace_id === connection.source_trace_id,
      )!
      const cpuTrace = cpu.traces.find(
        (trace) => trace.connection_name === cpuConnection.name,
      )!
      expect(
        cpuTrace.route.some(
          (point) =>
            point.route_type === "wire" &&
            point.layer === target.layer &&
            Math.hypot(point.x - target.x, point.y - target.y) < 1e-6,
        ),
      ).toBe(true)
    }
    expect(state.globalValidation).toMatchObject({
      connectedSignalCount: 2,
      copperErrorCount: 0,
    })
    const exits = circuit.db.pcb_breakout_point.list()
    expect(exits).toHaveLength(4)
    for (const connection of cpu.input.connections) {
      const paired = exits.filter(
        (exit) => exit.source_trace_id === connection.source_trace_id,
      )
      expect(paired.map((point) => point.layer)).toEqual(["bottom", "bottom"])
      const global = circuit.db.pcb_trace
        .list()
        .find(
          (trace) =>
            trace.source_trace_id === connection.source_trace_id &&
            paired.every((exit) =>
              [trace.route[0], trace.route.at(-1)].some(
                (point) =>
                  point?.route_type === "wire" &&
                  Math.hypot(point.x - exit.x, point.y - exit.y) < 1e-6,
              ),
            ),
        )!
      expect(global).toBeDefined()
      expect(
        global.route.every(
          (point) => point.route_type === "wire" && point.layer === "bottom",
        ),
      ).toBe(true)
    }

    const mismatchedInput = {
      ...ram.input,
      connections: ram.input.connections.map((connection) => ({
        ...connection,
        pointsToConnect: exits
          .filter((exit) => exit.source_trace_id === connection.source_trace_id)
          .map((exit, index) => ({
            x: exit.x,
            y: exit.y,
            layer: index === 0 ? "bottom" : "inner4",
          })),
      })),
    }
    const mismatchedRouter = await createCoordinatedDdrGlobalAutorouter(
      state,
      rotation,
    )(mismatchedInput)
    expect(() => mismatchedRouter.solveSync()).toThrow(
      "Uncoordinated fanout layers",
    )
  },
  30_000,
)
