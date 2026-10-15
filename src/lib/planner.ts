import { freeSlots, type Slot } from './time'

export type Appointment = { id: string; title: string; start: number; end: number }
export type Task = { id: string; title: string; duration: number; priority: 1 | 2 | 3 }
export type DaySettings = { dayStart: number; dayEnd: number; budgetMinutes: number }

export type PlannedTask = { task: Task; start: number; end: number }
export type SkippedTask = { task: Task; reason: 'budget' | 'no-gap' }
export type DayPlan = { planned: PlannedTask[]; skipped: SkippedTask[]; usedMinutes: number }

/**
 * Places tasks into the free gaps between appointments, highest priority first,
 * without going over the day's time budget.
 */
export function planDay(tasks: Task[], appointments: Appointment[], settings: DaySettings): DayPlan {
  const gaps: Slot[] = freeSlots(appointments, settings.dayStart, settings.dayEnd)
  const ordered = tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => b.task.priority - a.task.priority || a.index - b.index)
    .map((x) => x.task)

  const planned: PlannedTask[] = []
  const skipped: SkippedTask[] = []
  let usedMinutes = 0

  for (const task of ordered) {
    if (usedMinutes + task.duration > settings.budgetMinutes) {
      skipped.push({ task, reason: 'budget' })
      continue
    }
    const gap = gaps.find((g) => g.end - g.start >= task.duration)
    if (!gap) {
      skipped.push({ task, reason: 'no-gap' })
      continue
    }
    planned.push({ task, start: gap.start, end: gap.start + task.duration })
    gap.start += task.duration
    usedMinutes += task.duration
  }

  planned.sort((a, b) => a.start - b.start)
  return { planned, skipped, usedMinutes }
}
