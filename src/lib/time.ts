export type Slot = { start: number; end: number }

export function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return NaN
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 24 || min > 59) return NaN
  return h * 60 + min
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

/** Sorts and merges overlapping or touching slots. */
export function mergeSlots(slots: Slot[]): Slot[] {
  const sorted = slots.filter((s) => s.end > s.start).sort((a, b) => a.start - b.start)
  const merged: Slot[] = []
  for (const s of sorted) {
    const last = merged[merged.length - 1]
    if (last && s.start <= last.end) last.end = Math.max(last.end, s.end)
    else merged.push({ ...s })
  }
  return merged
}

/** Free time between dayStart and dayEnd that no busy slot covers. */
export function freeSlots(busy: Slot[], dayStart: number, dayEnd: number): Slot[] {
  const free: Slot[] = []
  let cursor = dayStart
  for (const b of mergeSlots(busy)) {
    if (b.end <= cursor) continue
    if (b.start >= dayEnd) break
    if (b.start > cursor) free.push({ start: cursor, end: b.start })
    cursor = Math.max(cursor, b.end)
  }
  if (cursor < dayEnd) free.push({ start: cursor, end: dayEnd })
  return free
}

/** Parses "09:00-11:00, 14:00-15:30" into slots; invalid parts are skipped. */
export function parseSlotList(text: string): Slot[] {
  return text
    .split(/[,;\n]/)
    .map((part) => part.split(/[-–]/))
    .filter((p) => p.length === 2)
    .map(([a, b]) => ({ start: toMinutes(a), end: toMinutes(b) }))
    .filter((s) => !Number.isNaN(s.start) && !Number.isNaN(s.end) && s.end > s.start)
}
