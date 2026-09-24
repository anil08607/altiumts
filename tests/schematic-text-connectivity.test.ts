import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "../lib"

test("generic text does not name or merge wires or create standalone nets", () => {
  const source = [
    "|RECORD=31",
    "|RECORD=27|LOCATIONCOUNT=2|X1=10|Y1=10|X2=50|Y2=10",
    "|RECORD=4|TEXT=NOTE|LOCATION.X=50|LOCATION.Y=10",
    "|RECORD=27|LOCATIONCOUNT=2|X1=10|Y1=100|X2=50|Y2=100",
    "|RECORD=4|TEXT=NOTE|LOCATION.X=50|LOCATION.Y=100",
    "|RECORD=4|TEXT=ISOLATED|LOCATION.X=80|LOCATION.Y=80",
  ].join("\n")
  const document = parseAltiumSchDoc(source)
  const graph = document.netGraph

  expect(graph.nets).toHaveLength(2)
  expect(graph.nets.map((net) => net.names)).toEqual([[], []])
  expect(graph.nets.map((net) => net.records)).toEqual(
    document.wires.map((wire) => [wire]),
  )
  expect(document.labels).toHaveLength(3)
  for (const label of document.labels) {
    expect(graph.getNetForRecord(label)).toBeUndefined()
  }
  expect(document.getString()).toBe(source)
})

test("generic text matching a net label does not join a separate wire", () => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31",
      "|RECORD=27|LOCATIONCOUNT=2|X1=10|Y1=10|X2=50|Y2=10",
      "|RECORD=25|TEXT=SIGNAL|LOCATION.X=50|LOCATION.Y=10",
      "|RECORD=27|LOCATIONCOUNT=2|X1=10|Y1=100|X2=50|Y2=100",
      "|RECORD=4|TEXT=SIGNAL|LOCATION.X=50|LOCATION.Y=100",
    ].join("\n"),
  )

  expect(document.netGraph.nets).toHaveLength(2)
  expect(document.netGraph.nets.map((net) => net.names)).toEqual([
    ["SIGNAL"],
    [],
  ])
})

test.each([
  ["net labels", "|RECORD=25|TEXT=SIGNAL"],
  ["ports", "|RECORD=18|NAME=SIGNAL|WIDTH=20|HEIGHT=10"],
  ["power ports", "|RECORD=17|TEXT=SIGNAL|STYLE=2"],
])("matching %s still connect separate wires", (_kind, identifier) => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31",
      "|RECORD=27|LOCATIONCOUNT=2|X1=10|Y1=10|X2=50|Y2=10",
      `${identifier}|LOCATION.X=50|LOCATION.Y=10`,
      "|RECORD=27|LOCATIONCOUNT=2|X1=10|Y1=100|X2=50|Y2=100",
      `${identifier}|LOCATION.X=50|LOCATION.Y=100`,
    ].join("\n"),
  )

  expect(document.netGraph.nets).toHaveLength(1)
  const net = document.netGraph.nets[0]
  expect(net?.names).toEqual(["SIGNAL"])
  for (const wire of document.wires) {
    expect(document.netGraph.getNetForRecord(wire)).toBe(net)
  }
})
