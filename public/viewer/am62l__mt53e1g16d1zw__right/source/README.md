# DDR Breakouts · right

Entry point: src/ddr/am62l__mt53e1g16d1zw__right.circuit.tsx

Install with npm ci --force, then run bun scripts/build-ddr-artifacts.ts right.

All previews are generated from TSX. Top rotates the core Right reference's package placements and bus exit directions by 90 degrees, with CPU at (0, -9.5) and RAM at (-1.81916, 9.616917). Left rotates the reference by 180 degrees, with CPU at (9.5, 0), rotation 180, and RAM at (-9.616917, -1.81916), rotation 270. Bottom rotates the reference by 270 degrees, with CPU at (0, 9.5), rotation 270, and RAM at (1.81916, -9.616917), rotation 0. Top, Left, and Bottom include RAM power/ground fanout and eight DDR capacitors. Right additionally includes the reference's 60 direct processor decouplers.

Top, Left, and Bottom explicitly use @tscircuit/fanout-solver 0.0.54 and core's paired fanout handoff. Winding and fanout planning use the horizontal reference frame; core receives the solved copper and endpoints in board coordinates. npm ci applies the unreleased core handoff fix from patches/.

All 33 DDR signals must connect without global layer changes, and every rotated-layout via must fit inside a CPU or RAM fanout region. PCB SVGs omit debug overlays. ../routing-phases.json contains the captured phase connections, routed traces, and bounds.

No circuit JSON or SVG is used as a routing input.
