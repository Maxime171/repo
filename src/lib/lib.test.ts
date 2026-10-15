import { describe, expect, it } from 'vitest'
import { commonFreeSlots } from './groupGaps'
import { parseTaskInput } from './parseTask'
import { planDay, type Task } from './planner'
import { freeSlots, parseSlotList, toMinutes } from './time'

const t = toMinutes

describe('freeSlots', () => {
  it('finds gaps between overlapping appointments', () => {
    const busy = [
      { start: t('10:00'), end: t('11:00') },
      { start: t('10:30'), end: t('12:00') },
      { start: t('14:00'), end: t('15:00') },
    ]
    expect(freeSlots(busy, t('08:00'), t('18:00'))).toEqual([
      { start: t('08:00'), end: t('10:00') },
      { start: t('12:00'), end: t('14:00') },
      { start: t('15:00'), end: t('18:00') },
    ])
  })

  it('ignores appointments outside the day', () => {
    const busy = [{ start: t('06:00'), end: t('07:00') }, { start: t('19:00'), end: t('20:00') }]
    expect(freeSlots(busy, t('08:00'), t('18:00'))).toEqual([{ start: t('08:00'), end: t('18:00') }])
  })
})

describe('planDay', () => {
  const task = (id: string, duration: number, priority: Task['priority'] = 2): Task => ({
    id,
    title: id,
    duration,
    priority,
  })
  const settings = { dayStart: t('08:00'), dayEnd: t('12:00'), budgetMinutes: 120 }
  const meeting = [{ id: 'm', title: 'Vorlesung', start: t('09:00'), end: t('10:00') }]

  it('places tasks into gaps around appointments', () => {
    const plan = planDay([task('a', 60), task('b', 30)], meeting, settings)
    expect(plan.planned.map((p) => [p.task.id, p.start])).toEqual([
      ['a', t('08:00')],
      ['b', t('10:00')],
    ])
    expect(plan.usedMinutes).toBe(90)
  })

  it('stops at the time budget and plans high priority first', () => {
    const plan = planDay([task('low', 60, 1), task('high', 90, 3)], [], settings)
    expect(plan.planned.map((p) => p.task.id)).toEqual(['high'])
    expect(plan.skipped).toEqual([{ task: task('low', 60, 1), reason: 'budget' }])
  })

  it('skips tasks that fit no gap', () => {
    const plan = planDay([task('long', 130)], meeting, { ...settings, budgetMinutes: 600 })
    expect(plan.skipped[0].reason).toBe('no-gap')
  })
})

describe('commonFreeSlots', () => {
  it('finds times when everyone is free', () => {
    const members = [
      { id: '1', name: 'Anna', busy: parseSlotList('09:00-11:00') },
      { id: '2', name: 'Ben', busy: parseSlotList('12:00-13:00, 15:00-16:00') },
    ]
    expect(commonFreeSlots(members, t('09:00'), t('17:00'), 60)).toEqual([
      { start: t('11:00'), end: t('12:00') },
      { start: t('13:00'), end: t('15:00') },
      { start: t('16:00'), end: t('17:00') },
    ])
  })

  it('drops gaps shorter than the minimum', () => {
    const members = [{ id: '1', name: 'Anna', busy: parseSlotList('09:30-17:00') }]
    expect(commonFreeSlots(members, t('09:00'), t('17:00'), 60)).toEqual([])
  })
})

describe('parseTaskInput', () => {
  it('reads hours, minutes and priority', () => {
    expect(parseTaskInput('Steuererklärung 2h')).toEqual({ title: 'Steuererklärung', duration: 120, priority: 2 })
    expect(parseTaskInput('Referat 1,5 Std !')).toEqual({ title: 'Referat', duration: 90, priority: 3 })
    expect(parseTaskInput('Einkaufen 45 min?')).toEqual({ title: 'Einkaufen', duration: 45, priority: 1 })
  })

  it('defaults to 30 minutes and rejects empty input', () => {
    expect(parseTaskInput('Mails beantworten')).toEqual({ title: 'Mails beantworten', duration: 30, priority: 2 })
    expect(parseTaskInput('  ')).toBeNull()
  })
})
