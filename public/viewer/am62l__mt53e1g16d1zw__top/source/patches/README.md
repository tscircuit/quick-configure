# Core fanout coordination patch

This applies the source changes from [tscircuit/core#3610](https://github.com/tscircuit/core/pull/3610), commit `06ccd8bdec20fc7b93a722dfa5d0f1273a7f49d8`, to the pinned `@tscircuit/core@0.0.1830` distribution.

The patch preserves the explicit algorithm in `fanout` and `single_layer_fanout` presets and updates exported breakout-point layers when core synchronizes the solved fanout exits. This allows the normal core fanout handoff to run with the separately pinned fanout solver.

`npm ci --force` applies it through `patch-package` in `postinstall`. Remove the patch and patch-package dependency once the core fix is released and the pinned version includes it.

The fanout-solver patch exports `routeBus` and `buildOutputSimpleRouteJson`.
The fixed-orientation DDR configurations use those public solver stages to keep
the package footprints unchanged while adding the final turn inside each
fanout boundary.
