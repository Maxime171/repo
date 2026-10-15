import type { Task } from './planner'

const DEFAULT_DURATION = 30

/**
 * Reads quick input like "Steuererklärung 2h", "Einkaufen 45 min" or "Referat 1,5 Std !".
 * A trailing "!" marks high priority, "?" low priority.
 * Stand-in until the AI input is connected.
 */
export function parseTaskInput(input: string): Omit<Task, 'id'> | null {
  let text = input.trim()
  if (!text) return null

  let priority: Task['priority'] = 2
  if (/!\s*$/.test(text)) priority = 3
  else if (/\?\s*$/.test(text)) priority = 1
  text = text.replace(/[!?]+\s*$/, '').trim()

  let duration = DEFAULT_DURATION
  const match = /(\d+(?:[.,]\d+)?)\s*(h|std\.?|stunden?|min\.?|minuten)\s*$/i.exec(text)
  if (match) {
    const value = Number(match[1].replace(',', '.'))
    duration = /^m/i.test(match[2]) ? Math.round(value) : Math.round(value * 60)
    text = text.slice(0, match.index).trim()
  }

  if (!text || duration <= 0) return null
  return { title: text, duration, priority }
}
