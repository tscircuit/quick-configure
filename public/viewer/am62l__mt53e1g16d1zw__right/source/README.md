# DDR Breakouts · right

Entry point: src/ddr/am62l__mt53e1g16d1zw__right.circuit.tsx

Install with npm ci --force, then run bun scripts/build-ddr-artifacts.ts right.

Routing status: routed.

Right preserves the routed core reference. Top routes the CPU fanout with @tscircuit/fanout-solver 0.0.52; RAM/global routing and length matching are pending. Its capacitor footprints only reserve placement space.
