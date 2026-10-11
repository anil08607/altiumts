import { expect, test } from "bun:test"
import { parseAltiumPcbDoc, serializeAltiumPcbToSvg } from "../lib"

test.each([false, true])(
  "fits selected layers without off-board fabrication text (fitToContent=%s)",
  (fitToContent) => {
    const copperSource = [
      "|RECORD=Board",
      "|RECORD=Track|LAYER=TOP|X1=100mil|Y1=100mil|X2=500mil|Y2=200mil|WIDTH=10mil",
    ].join("\n")
    const source = [
      copperSource,
      "|RECORD=Text|LAYER=MECHANICAL1|X=10000mil|Y=10000mil|HEIGHT=60mil|TEXT=Fabrication notes",
    ].join("\n")
    const document = parseAltiumPcbDoc(source)
    const copperOnly = parseAltiumPcbDoc(copperSource)
    const options = { layers: ["TOP"], fitToContent }
    const overview = serializeAltiumPcbToSvg(document, options)

    expect(overview).toBe(serializeAltiumPcbToSvg(copperOnly, options))
    expect(serializeAltiumPcbToSvg(document)).toContain("Fabrication notes")
    expect(
      serializeAltiumPcbToSvg(document, { layers: ["MECHANICAL1"] }),
    ).toContain("Fabrication notes")
    expect(
      serializeAltiumPcbToSvg(document, {
        ...options,
        viewBox: { x: 0, y: 0, width: 600, height: 300 },
      }),
    ).toContain('viewBox="0 0 600 300"')
    expect(document.getString()).toBe(source)
  },
)
