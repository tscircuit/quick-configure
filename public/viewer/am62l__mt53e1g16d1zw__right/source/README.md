# DDR Breakouts · right

Entry point: src/ddr/am62l__mt53e1g16d1zw__right.circuit.tsx

Install with npm ci --force, then run bun scripts/build-ddr-artifacts.ts right.

All previews are generated from TSX. Every position keeps the AM62L at 0 degrees and the MT53E1G16D1ZW at 90 degrees. Top places the CPU at (0, -70) and RAM at (-1.81916, 70). Left places the CPU at (70, 0) and RAM at (-70, -1.81916). Bottom places the CPU at (0, 70) and RAM at (1.81916, -70). Top, Left, and Bottom include RAM power/ground fanout and eight DDR capacitors. Right additionally includes the reference's 60 direct processor decouplers.

Top, Left, and Bottom explicitly use @tscircuit/fanout-solver 0.0.54 and core's paired fanout handoff. The local fanout planner routes the unchanged package footprints toward the requested facing edges, then core receives exact paired endpoints for the via-free global handoff. npm ci applies the unreleased core handoff fix and the fanout-solver stage exports from patches/.

All 33 DDR signals must connect without global layer changes, and every via must fit inside a CPU or RAM fanout region. PCB SVGs omit debug overlays. ../routing-phases.json contains the captured phase connections, routed traces, and bounds.

No circuit JSON or SVG is used as a routing input.
