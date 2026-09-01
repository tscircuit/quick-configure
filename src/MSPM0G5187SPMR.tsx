import {
  mspm0UsbLqfp64PinLabels,
  mspm0UsbLqfp64Pins,
} from "./MSPM0G5117SPMR";

export const mspm0g5187Pins = mspm0UsbLqfp64Pins;
export const mspm0g5187PinLabels = mspm0UsbLqfp64PinLabels;

export const MSPM0G5187SPMR = (props: any) => (
  <chip
    manufacturerPartNumber="MSPM0G5187SPMR"
    datasheetUrl="https://www.ti.com/lit/ds/symlink/mspm0g5187.pdf"
    footprint="lqfp64_w10_h10_p0.5mm"
    cadModel={{ glbUrl: "./src/models/mspm0g3507spmr.glb" }}
    pinLabels={mspm0g5187PinLabels}
    schPinArrangement={{
      leftSide: {
        direction: "top-to-bottom",
        pins: ["VDD", "VSS", "VCORE", "VUSB33", "NRST"],
      },
      rightSide: {
        direction: "top-to-bottom",
        pins: [
          "USB_DP",
          "USB_DM",
          "ROSC",
          "SWDIO",
          "SWCLK",
          "PB2",
          "PB3",
          "PB6",
          "PB7",
          "PB8",
          "PB9",
        ],
      },
    }}
    schPinStyle={{
      VSS: { marginTop: 0.3 },
      VCORE: { marginTop: 0.3 },
      VUSB33: { marginTop: 0.3 },
      NRST: { marginTop: 0.3 },
    }}
    schHeight={2.4}
    {...props}
  />
);
