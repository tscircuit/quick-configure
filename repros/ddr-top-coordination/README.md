# Top DDR paired-fanout investigation

The preview at commit `c0ad87a` has **59 global vias**. **32 of 33 signals** leave
the two fanouts on different copper layers. The custom global channel router
made those disconnected layer assignments physically connect, but that does
not meet the intended no-via routing between coordinated fanouts.

## Core coordination integration

Both Top breakouts now use `autorouter={{ preset: "fanout", algorithmFn }}`.
The explicit solver adapter preserves core's paired `connectionExitTargets`.
The independent RAM bus-layer override, source-projected exits, metadata-only
phase, manual breakout-marker updates, and layer-changing A* global router
have been removed. Global routing uses core's actual endpoints and refuses
layer mismatches. `npm ci --force` applies the unreleased core fix from
`patches/@tscircuit+core+0.0.1826.patch`.

The full build currently stops with `best layer assignment routed 18/33
connections` in the RAM solver. The CPU fanout completed 135/135 first. Run
`npm run build:ddr -- top` for the full integration. No incomplete artifacts
are written. The small vertical regression in
`tests/ddr-top-core-coordination.test.tsx` verifies the real adapter's handoff,
matching exported layers, zero global vias, and rejection of layer mismatches.
It fails without the core patch and passes after applying it.

The previous implementation had independent RAM bus layers and discarded
`connectionExitTargets` in `projectSourceExits`. Its A* global router then
added layer transitions to repair mismatched exits. That caused the 59-via
preview; its connectivity checks did not enforce the no-global-via requirement.
The build now checks emitted global copper separately and rejects that preview
as the result of a coordinated build.

## Core integration defects

[Core PR #3610](https://github.com/tscircuit/core/pull/3610) fixes two reproduced
issues:

- `getPresetAutoroutingConfig` drops `algorithmFn` when combined with a fanout
  preset. Omitting the preset makes the callback run, but then `Group` does not
  synchronize its actual fanout exits into the paired/global routing problem.
- The synchronization updates exported `pcb_breakout_point` coordinates but
  leaves their original copper layers unchanged.

The regression changes initially top-layer exits to bottom in an explicit
fanout algorithm, checks the second fanout's actual target coordinates/layers,
checks the exported points, and requires zero vias in the global connections.
The winding point solver itself does not generate any traces or vias.

## Remaining RAM solve

`input.json` is the RAM phase from the Top board at `c0ad87a`, reduced to its
200 RAM-pad obstacles and 33 DDR signals. Coordinates are board-world mm,
+X right and +Y up. Each bus receives the already solved CPU's exact exit
coordinates and layers. The RAM retains its 90-degree rotation and downward
boundary; each bus may use its CPU layer plus one internal crossover layer.
The solve is bounded to its first layer assignment for a focused reproducer.

Run from the repository root:

```sh
bun repros/ddr-top-coordination/run.ts
```

With `@tscircuit/fanout-solver@0.0.52` (unchanged routing algorithms in 0.0.53), this currently **exits unsuccessfully**:
22/33 connections route, with `DDR_DMI0`, `DDR_BYTE1`, and `DDR_CLOCK` failing.
This reproduces a failing configuration; it does not establish that every
possible RAM fanout configuration is infeasible.

Success requires all 33 RAM signals, matching CPU/RAM exit layers, and direct
global connections with no crossings or vias. The script checks those
conditions if the fanout solves. Restoring core's handoff alone does not make
this RAM configuration pass; its configuration or solver must still be fixed.

This reproducer is intentionally separate from the ordinary passing test
suite. PR #12 remains a draft until the Top board meets the no-global-via
requirement. The currently published artifacts have not been replaced with a
partially routed board.
