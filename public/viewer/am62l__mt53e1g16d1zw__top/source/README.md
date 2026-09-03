# DDR Breakouts · top

Entry point: src/ddr/am62l__mt53e1g16d1zw__top.circuit.tsx

Install with npm ci --force, then run bun scripts/build-ddr-artifacts.ts top.

Routing status: routed-unmatched.

Right preserves the routed core reference. Top uses @tscircuit/fanout-solver 0.0.52 for both fanouts and joins all 33 DDR signals with a clearance-checked global channel router. Length matching remains pending. Its capacitor footprints only reserve placement space.
