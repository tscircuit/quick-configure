export type ScreenId =
  | "er-oled096-1-3w"
  | "er-tft020-3"
  | "er-tft028a2-4"
  | "er-epd0213-2b"

export interface ScreenModelSpec {
  id: ScreenId
  outputFilename: `${ScreenId}.glb`
  connectorModel: string
  flexScreenModel: string
  dimensions: {
    width: number
    height: number
    thickness: number
    activeWidth: number
    activeHeight: number
  }
  flex: {
    length: number
    width: number
    thickness: number
    conductorCount: number
    conductorPitch: number
    conductorWidth: number
    cableEntryY: number
    cableEntryZ: number
  }
}

const model = (
  spec: Omit<ScreenModelSpec, "outputFilename">,
): ScreenModelSpec => ({
  ...spec,
  outputFilename: `${spec.id}.glb`,
})

/**
 * Datasheet-derived dimensions for the generated display + connector models.
 *
 * Each FlexScreen starts at the mouth of its matching FPC connector.
 * The model and PCB footprint therefore share the same origin and rotation.
 */
export const screenModelSpecs: Record<ScreenId, ScreenModelSpec> = {
  "er-epd0213-2b": model({
    id: "er-epd0213-2b",
    connectorModel:
      "fpc24_p0.5mm_pw0.3mm_pl1.25mm_mpx14.58mm_mpy2.325mm_mpw2mm_mpl3mm_mounttop",
    flexScreenModel:
      "flexscreen_w29.2mm_h59.2mm_screenthickness1.14mm_bezelinset1mm_bezeldepth0.35mm_activew23.7mm_activeh48.55mm_flex8.35mm_flexwidth12.5mm_flexthickness0.3mm_conductors24_conductorpitch0.5mm_conductorwidth0.35mm_edgemargin0.325mm_contactlength3.65mm_stiffenerlength6mm_stiffenerthickness0.12mm_sitsflat_cablestarty4.285mm_cablestartz1.1mm_hideconductors_screencolor(#e7e2d5)_bezelcolor(#d8d4c8)",
    dimensions: {
      width: 29.2,
      height: 59.2,
      thickness: 1.14,
      activeWidth: 23.7,
      activeHeight: 48.55,
    },
    flex: {
      length: 8.35,
      width: 12.5,
      thickness: 0.3,
      conductorCount: 24,
      conductorPitch: 0.5,
      conductorWidth: 0.35,
      cableEntryY: 4.285,
      cableEntryZ: 1.1,
    },
  }),
  "er-oled096-1-3w": model({
    id: "er-oled096-1-3w",
    connectorModel:
      "fpc30_p0.5mm_pw0.3mm_pl1.25mm_mpx17.58mm_mpy2.325mm_mpw2mm_mpl3mm_mounttop",
    flexScreenModel:
      "flexscreen_w26.7mm_h19.26mm_screenthickness1.45mm_bezelinset1mm_bezeldepth0.5mm_activew21.744mm_activeh10.864mm_flex12mm_flexwidth15.5mm_flexthickness0.3mm_conductors30_conductorpitch0.5mm_conductorwidth0.3mm_edgemargin0.35mm_contactlength4mm_stiffenerlength4.5mm_stiffenerthickness0.12mm_sitsflat_cablestarty4.285mm_cablestartz1.1mm_hideconductors_screencolor(#071c18)_bezelcolor(#171a1d)",
    dimensions: {
      width: 26.7,
      height: 19.26,
      thickness: 1.45,
      activeWidth: 21.744,
      activeHeight: 10.864,
    },
    flex: {
      length: 12,
      width: 15.5,
      thickness: 0.3,
      conductorCount: 30,
      conductorPitch: 0.5,
      conductorWidth: 0.3,
      cableEntryY: 4.285,
      cableEntryZ: 1.1,
    },
  }),
  "er-tft020-3": model({
    id: "er-tft020-3",
    connectorModel:
      "fpc14_p0.5mm_pw0.3mm_pl1.25mm_mpx9.58mm_mpy2.325mm_mpw2mm_mpl3mm_mounttop",
    flexScreenModel:
      "flexscreen_w34.6mm_h47.8mm_screenthickness2mm_bezelinset1mm_bezeldepth0.55mm_activew30.6mm_activeh40.8mm_flex5mm_flexwidth7.5mm_flexthickness0.3mm_conductors14_conductorpitch0.5mm_conductorwidth0.3mm_edgemargin0.35mm_contactlength2.5mm_stiffenerlength2.5mm_stiffenerthickness0.12mm_sitsflat_cablestarty4.285mm_cablestartz1.1mm_hideconductors_screencolor(#102839)_bezelcolor(#171a1d)",
    dimensions: {
      width: 34.6,
      height: 47.8,
      thickness: 2,
      activeWidth: 30.6,
      activeHeight: 40.8,
    },
    flex: {
      length: 5,
      width: 7.5,
      thickness: 0.3,
      conductorCount: 14,
      conductorPitch: 0.5,
      conductorWidth: 0.3,
      cableEntryY: 4.285,
      cableEntryZ: 1.1,
    },
  }),
  "er-tft028a2-4": model({
    id: "er-tft028a2-4",
    connectorModel:
      "fpc50_p0.5mm_pw0.3mm_pl1.25mm_mpx27.58mm_mpy2.325mm_mpw2mm_mpl3mm_mounttop",
    flexScreenModel:
      "flexscreen_w50.2mm_h69.3mm_screenthickness2.8mm_bezelinset1mm_bezeldepth0.65mm_activew43.2mm_activeh57.6mm_flex26.7mm_flexwidth25.5mm_flexthickness0.3mm_conductors50_conductorpitch0.5mm_conductorwidth0.35mm_edgemargin0.3mm_contactlength4.5mm_stiffenerlength5.5mm_stiffenerthickness0.12mm_sitsflat_cablestarty4.285mm_cablestartz1.1mm_hideconductors_screencolor(#102839)_bezelcolor(#171a1d)",
    dimensions: {
      width: 50.2,
      height: 69.3,
      thickness: 2.8,
      activeWidth: 43.2,
      activeHeight: 57.6,
    },
    flex: {
      length: 26.7,
      width: 25.5,
      thickness: 0.3,
      conductorCount: 50,
      conductorPitch: 0.5,
      conductorWidth: 0.35,
      cableEntryY: 4.285,
      cableEntryZ: 1.1,
    },
  }),
}
