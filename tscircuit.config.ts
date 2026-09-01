const buildScope = process.env.QUICK_CONFIGURE_TSCIRCUIT_BUILD_SCOPE;

export default buildScope === "legacy"
  ? {
      includeBoardFiles: [
        "*.circuit.tsx",
        "!usb-c__mspm0g3507__*.circuit.tsx",
        "!usb-c__mspm0g5117__*.circuit.tsx",
        "!usb-c__mspm0g5187__*.circuit.tsx",
      ],
    }
  : {};
