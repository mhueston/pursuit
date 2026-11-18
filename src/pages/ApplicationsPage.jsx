import { useEffect, useMemo, useState } from 'react'
import {
  createApplication,
  deleteApplication,
  listApplications,
  moveChanges,
  saveApplication,
  topPosition,
  updateApplication,
} from '../lib/applications'
import Board from '../components/board/Board'
import ApplicationDrawer from '../components/ApplicationDrawer'

/*
  The Applications page. It owns the list of jobs and passes it down
  to the board. Changes show up on screen right away ("optimistic
  updates") and are saved to Supabase in the background. If a save
  fails, the board goes back to how it was and an error appears.
*/
export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // the job open in the side panel, or null

  useEffect(() => {
    listApplications()
      .then(setApplications)
      .catch((err) => setError(`Couldn't load your applications. ${err.message}`))
      .finally(() => setLoading(false))
  }, [])

  // Only show jobs matching the search box (company, role, or location).
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return applications
    return applications.filter((a) =>
      [a.company, a.role, a.location].some((field) => field?.toLowerCase().includes(q)),
    )
  }, [applications, search])

  // Replace one job in the list with its updated version.
  function replace(updated) {
    setApplications((list) => list.map((a) => (a.id === updated.id ? updated : a)))
  }

  async function handleMove(application, status) {
    const changes = moveChanges(application, status, applications)
    const before = applications

    replace({ ...application, ...changes }) // update the screen first
    setError('')
    try {
      replace(await updateApplication(application.id, changes))
    } catch (err) {
      setApplications(before) // undo on failure
      setError(`Couldn't move ${application.company}. ${err.message}`)
    }
  }

  async function handleSave(values) {
    if (editing.id) {
      // Moving stages from the form also puts the card at the top of its new column.
      const stageChanged = values.status !== editing.status
      const changes = stageChanged ? { ...values, ...moveChanges(editing, values.status, applications) } : values
      // If you typed your own "Date applied", keep yours.
      if (values.date_applied) changes.date_applied = values.date_applied
      replace(await saveApplication(editing.id, changes))
    } else {
      const created = await createApplication(values, topPosition(applications, values.status))
      setApplications((list) => [created, ...list])
    }
    setEditing(null)
  }

  async function handleDelete() {
    await deleteApplication(editing.id)
    setApplications((list) => list.filter((a) => a.id !== editing.id))
    setEditing(null)
  }

  // Sort once so every column shows cards in their saved order.
  const sorted = [...visible].sort((a, b) => a.position - b.position)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold sm:text-6xl">Applications</h1>
          <p className="mt-3 text-lg text-muted">Drag a job to a new stage as things move forward.</p>
        </div>

        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <label className="relative flex-1 sm:w-64 sm:flex-none">
            <span className="sr-only">Search applications</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or role"
              className="w-full rounded-full bg-cloud px-5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary"
            />
          </label>
          <button
            onClick={() => setEditing({ status: 'saved' })}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Add a job
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 px-5 py-3 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      <div className="mt-10">
        {loading ? (
          <p className="text-muted" role="status">
            Loading your board…
          </p>
        ) : (
          <Board
            applications={sorted}
            onMove={handleMove}
            onOpen={setEditing}
            onAdd={(status) => setEditing({ status })}
          />
        )}
      </div>

      {/* key makes React start a fresh form for each job */}
      {editing && (
        <ApplicationDrawer
          key={editing.id ?? `new-${editing.status}`}
          application={editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
