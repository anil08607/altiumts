import { expect, test } from "bun:test"
import { parseAltiumPcbDoc, serializeAltiumPcbToSvg } from "../../lib"

test("distinguishes layer-specific keepout arcs from copper arcs", async () => {
  const source = [
    "|RECORD=Board|VX0=0mil|VY0=0mil|VX1=500mil|VY1=0mil|VX2=500mil|VY2=300mil|VX3=0mil|VY3=300mil|VX4=0mil|VY4=0mil",
    "|RECORD=Arc|LAYER=TOP|KEEPOUT=FALSE|LOCATION.X=150mil|LOCATION.Y=150mil|RADIUS=80mil|STARTANGLE=0|ENDANGLE=360|WIDTH=12mil",
    "|RECORD=Arc|LAYER=TOP|KEEPOUT=TRUE|LOCATION.X=350mil|LOCATION.Y=150mil|RADIUS=80mil|STARTANGLE=0|ENDANGLE=360|WIDTH=12mil",
  ].join("\n")
  const svg = serializeAltiumPcbToSvg(parseAltiumPcbDoc(source), {
    title: "Copper and keepout arcs",
  })

  expect(svg).toContain('data-record="Arc" data-layer="TOP" points=')
  expect(svg).toContain('stroke="#ef4444" stroke-width="12"')
  expect(svg).toContain(
    'data-record="Arc" data-layer="TOP" data-keepout="true"',
  )
  expect(svg).toContain('stroke="#a855f7" stroke-width="12"')
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
