import type { AltiumRecord } from "../records/altium-record"

export function getSchematicCoordinate(
  record: AltiumRecord,
  key: string,
  fallback = 0,
): number {
  // SchDoc coordinates are two signed integers, not decimal strings. A
  // fraction of 8000 means 0.08 even without leading zeroes. Do not repair
  // malformed exporter output here: Altium does not accept "258.08" as X2.
  return (
    readSchematicInteger(record.getCaseInsensitive(key), fallback) +
    readSchematicInteger(record.getCaseInsensitive(`${key}_FRAC`), 0) / 100_000
  )
}

export function readSchematicInteger(
  raw: string | undefined,
  fallback: number,
): number {
  if (raw === undefined || !/^[+-]?\d+$/u.test(raw.trim())) return fallback
  const value = Number(raw)
  return Number.isSafeInteger(value) ? value : fallback
}
