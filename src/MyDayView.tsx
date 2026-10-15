import { useState, type FormEvent } from 'react'
import { parseTaskInput } from './lib/parseTask'
import { planDay, type Appointment, type Task } from './lib/planner'
import { formatDuration, toHHMM, toMinutes } from './lib/time'
import { useStoredState } from './useStoredState'

const PRIORITY_LABEL: Record<Task['priority'], string> = { 3: 'hoch', 2: 'normal', 1: 'niedrig' }

const newId = () => crypto.randomUUID()

export function MyDayView() {
  const [dayStart, setDayStart] = useStoredState('dayStart', '08:00')
  const [dayEnd, setDayEnd] = useStoredState('dayEnd', '18:00')
  const [budgetHours, setBudgetHours] = useStoredState('budgetHours', 4)
  const [appointments, setAppointments] = useStoredState<Appointment[]>('appointments', [])
  const [tasks, setTasks] = useStoredState<Task[]>('tasks', [])

  const [taskInput, setTaskInput] = useState('')
  const [apptTitle, setApptTitle] = useState('')
  const [apptStart, setApptStart] = useState('10:00')
  const [apptEnd, setApptEnd] = useState('11:00')

  const plan = planDay(tasks, appointments, {
    dayStart: toMinutes(dayStart),
    dayEnd: toMinutes(dayEnd),
    budgetMinutes: Math.round(budgetHours * 60),
  })

  const addTask = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseTaskInput(taskInput)
    if (!parsed) return
    setTasks([...tasks, { id: newId(), ...parsed }])
    setTaskInput('')
  }

  const addAppointment = (e: FormEvent) => {
    e.preventDefault()
    const start = toMinutes(apptStart)
    const end = toMinutes(apptEnd)
    if (!apptTitle.trim() || Number.isNaN(start) || Number.isNaN(end) || end <= start) return
    setAppointments([...appointments, { id: newId(), title: apptTitle.trim(), start, end }])
    setApptTitle('')
  }

  const timeline = [
    ...appointments.map((a) => ({ kind: 'appt' as const, id: a.id, title: a.title, start: a.start, end: a.end })),
    ...plan.planned.map((p) => ({ kind: 'task' as const, id: p.task.id, title: p.task.title, start: p.start, end: p.end })),
  ].sort((a, b) => a.start - b.start)

  const budgetMinutes = Math.round(budgetHours * 60)
  const usedShare = budgetMinutes > 0 ? Math.min(1, plan.usedMinutes / budgetMinutes) : 0

  return (
    <div className="grid">
      <section className="card">
        <h2>Dein Tag</h2>
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
            Zeit für Aufgaben (h)
            <input
              type="number"
              min={0}
              max={16}
              step={0.5}
              value={budgetHours}
              onChange={(e) => setBudgetHours(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="budget" aria-label="Verplante Zeit">
          <div className="budget-fill" style={{ width: `${usedShare * 100}%` }} />
        </div>
        <p className="muted">
          {formatDuration(plan.usedMinutes)} von {formatDuration(budgetMinutes)} verplant
        </p>
      </section>

      <section className="card">
        <h2>Aufgabe hinzufügen</h2>
        <form onSubmit={addTask} className="row">
          <input
            className="grow"
            placeholder="z. B. Referat vorbereiten 1,5h !"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button type="submit">Hinzufügen</button>
        </form>
        <p className="muted small">
          Dauer mit „h“ oder „min“ angeben, „!“ = wichtig, „?“ = kann warten. Später versteht das die KI in normaler
          Sprache.
        </p>
        <ul className="list">
          {tasks.map((t) => (
            <li key={t.id}>
              <span className="grow">{t.title}</span>
              <span className="muted small">
                {formatDuration(t.duration)} · {PRIORITY_LABEL[t.priority]}
              </span>
              <button className="link" onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}>
                Erledigt
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Termin eintragen</h2>
        <form onSubmit={addAppointment} className="row">
          <input className="grow" placeholder="z. B. Vorlesung" value={apptTitle} onChange={(e) => setApptTitle(e.target.value)} />
          <input type="time" value={apptStart} onChange={(e) => setApptStart(e.target.value)} />
          <input type="time" value={apptEnd} onChange={(e) => setApptEnd(e.target.value)} />
          <button type="submit">Eintragen</button>
        </form>
      </section>

      <section className="card wide">
        <h2>Vorgeschlagener Plan</h2>
        {timeline.length === 0 ? (
          <p className="muted">Trag Aufgaben und Termine ein, dann verteilt der Planer die Aufgaben auf deine Lücken.</p>
        ) : (
          <ol className="timeline">
            {timeline.map((item) => (
              <li key={item.id} className={item.kind}>
                <span className="time">
                  {toHHMM(item.start)}–{toHHMM(item.end)}
                </span>
                <span className="grow">{item.title}</span>
                {item.kind === 'appt' ? (
                  <button
                    className="link"
                    onClick={() => setAppointments(appointments.filter((a) => a.id !== item.id))}
                  >
                    Entfernen
                  </button>
                ) : (
                  <span className="tag">Aufgabe</span>
                )}
              </li>
            ))}
          </ol>
        )}
        {plan.skipped.length > 0 && (
          <div className="skipped">
            <h3>Passt heute nicht mehr</h3>
            <ul>
              {plan.skipped.map(({ task, reason }) => (
                <li key={task.id}>
                  {task.title} ({formatDuration(task.duration)}):{' '}
                  {reason === 'budget' ? 'deine Zeit für heute ist verplant' : 'keine Lücke ist lang genug'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
