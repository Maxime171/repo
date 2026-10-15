import { useState, type FormEvent } from 'react'
import { commonFreeSlots, type Member } from './lib/groupGaps'
import { formatDuration, parseSlotList, toHHMM, toMinutes } from './lib/time'
import { useStoredState } from './useStoredState'

type StoredMember = { id: string; name: string; busyText: string }

export function GroupView() {
  const [members, setMembers] = useStoredState<StoredMember[]>('groupMembers', [
    { id: 'beispiel-1', name: 'Du', busyText: '09:00-11:00, 14:00-15:30' },
    { id: 'beispiel-2', name: 'Lena', busyText: '10:00-12:00, 16:00-17:00' },
  ])
  const [dayStart, setDayStart] = useStoredState('groupDayStart', '08:00')
  const [dayEnd, setDayEnd] = useStoredState('groupDayEnd', '20:00')
  const [minMinutes, setMinMinutes] = useStoredState('groupMinMinutes', 60)
  const [newName, setNewName] = useState('')

  const parsed: Member[] = members.map((m) => ({ id: m.id, name: m.name, busy: parseSlotList(m.busyText) }))
  const gaps = commonFreeSlots(parsed, toMinutes(dayStart), toMinutes(dayEnd), minMinutes)

  const addMember = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setMembers([...members, { id: crypto.randomUUID(), name: newName.trim(), busyText: '' }])
    setNewName('')
  }

  const update = (id: string, busyText: string) =>
    setMembers(members.map((m) => (m.id === id ? { ...m, busyText } : m)))

  return (
    <div className="grid">
      <section className="card wide">
        <h2>Gemeinsame Lücken finden</h2>
        <p className="muted">
          Trag für jede Person ein, wann sie belegt ist. Später liest die App das direkt aus den verbundenen Kalendern,
          und jeder teilt nur frei oder belegt.
        </p>
        <div className="row">
          <label>
            Von
            <input type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value)} />
          </label>
          <label>
            Bis
            <input type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} />
          </label>
          <label>
            Mindestens (min)
            <input
              type="number"
              min={15}
              step={15}
              value={minMinutes}
              onChange={(e) => setMinMinutes(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Gruppe</h2>
        <ul className="list members">
          {members.map((m) => (
            <li key={m.id}>
              <strong>{m.name}</strong>
              <input
                className="grow"
                placeholder="belegt, z. B. 09:00-11:00, 14:00-15:00"
                value={m.busyText}
                onChange={(e) => update(m.id, e.target.value)}
              />
              <button className="link" onClick={() => setMembers(members.filter((x) => x.id !== m.id))}>
                Entfernen
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addMember} className="row">
          <input className="grow" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button type="submit">Person hinzufügen</button>
        </form>
      </section>

      <section className="card">
        <h2>Vorschläge für alle</h2>
        {members.length === 0 ? (
          <p className="muted">Füge mindestens eine Person hinzu.</p>
        ) : gaps.length === 0 ? (
          <p className="muted">Heute gibt es keine gemeinsame Lücke von {formatDuration(minMinutes)}.</p>
        ) : (
          <ol className="timeline">
            {gaps.map((g) => (
              <li key={g.start} className="task">
                <span className="time">
                  {toHHMM(g.start)}–{toHHMM(g.end)}
                </span>
                <span className="grow muted">{formatDuration(g.end - g.start)} frei</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
