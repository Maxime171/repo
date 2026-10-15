import { useEffect, useState } from 'react'

/** useState that is saved in the browser, so data survives a reload. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable (private mode); the app still works without it.
    }
  }, [key, value])

  return [value, setValue] as const
}
