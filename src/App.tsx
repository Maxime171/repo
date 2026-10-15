import { useState } from 'react'
import './App.css'
import { GroupView } from './GroupView'
import { MyDayView } from './MyDayView'

type Tab = 'day' | 'group'

export default function App() {
  const [tab, setTab] = useState<Tab>('day')

  return (
    <div className="app">
      <header className="header">
        <h1>KI-Kalender</h1>
        <nav className="tabs">
          <button className={tab === 'day' ? 'active' : ''} onClick={() => setTab('day')}>
            Mein Tag
          </button>
          <button className={tab === 'group' ? 'active' : ''} onClick={() => setTab('group')}>
            Gruppe
          </button>
        </nav>
      </header>
      <main>{tab === 'day' ? <MyDayView /> : <GroupView />}</main>
    </div>
  )
}
