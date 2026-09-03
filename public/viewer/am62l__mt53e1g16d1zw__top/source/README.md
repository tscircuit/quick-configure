# DDR Breakouts · top

Entry point: src/ddr/am62l__mt53e1g16d1zw__top.circuit.tsx

Install with npm ci --force, then run bun scripts/build-ddr-artifacts.ts top.

Routing status: coordination-pending.

Right preserves the routed core reference. Top uses core fanout coordination with the explicit @tscircuit/fanout-solver 0.0.53. npm ci applies the unreleased core fix from patches/. The current full Top build fails at RAM fanout (18/33); the page still shows the previous preview, which contains global vias. New builds require all 33 signals and zero global vias. Length matching remains pending. Its capacitor footprints only reserve placement space.
