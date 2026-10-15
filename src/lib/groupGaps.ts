import { freeSlots, type Slot } from './time'

export type Member = { id: string; name: string; busy: Slot[] }

/** Times when every member is free, at least minDuration minutes long. */
export function commonFreeSlots(
  members: Member[],
  dayStart: number,
  dayEnd: number,
  minDuration: number,
): Slot[] {
  const allBusy = members.flatMap((m) => m.busy)
  return freeSlots(allBusy, dayStart, dayEnd).filter((s) => s.end - s.start >= minDuration)
}
