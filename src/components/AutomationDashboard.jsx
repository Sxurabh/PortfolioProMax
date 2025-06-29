import { useState } from 'react'
import { SimpleLayout } from '@/components/SimpleLayout'

const ACTION = {
  key: 'loginCheck',
  name: 'Run Login Check',
  api: '/api/automations/loginCheck',
}

export default function AutomationDashboard() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  async function trigger() {
    setLoading(true)
    try {
      const res = await fetch(ACTION.api, { method: 'POST' })
      const json = await res.json()
      const time = new Date().toLocaleTimeString()
      setLogs(prev => [{ name: ACTION.name, status: json.status, time }, ...prev])
    } catch {
      const time = new Date().toLocaleTimeString()
      setLogs(prev => [{ name: ACTION.name, status: 'Error', time }, ...prev])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SimpleLayout
      title="Automations"
      intro="Check your login status with a single click."
    >
      <div className="space-y-12">
        {/* Quick Action */}
        <div className="bg-white/90 dark:bg-zinc-800/90 p-6 rounded-2xl shadow-lg ring-1 ring-zinc-900/5 dark:ring-white/10 flex items-center justify-center">
          <button
            onClick={trigger}
            disabled={loading}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition disabled:opacity-50"
          >
            {loading ? 'Checking...' : ACTION.name}
          </button>
        </div>

        {/* Activity Log */}
        <div className="bg-white/90 dark:bg-zinc-800/90 p-6 rounded-2xl shadow-lg ring-1 ring-zinc-900/5 dark:ring-white/10">
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500">No activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((e, i) => (
                <li key={i} className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300">
                  <span>[{e.time}] {e.name}</span>
                  <span className={e.status === 'Error' ? 'text-red-500' : 'text-green-500'}>
                    {e.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SimpleLayout>
  )
}
