import { useEffect, useRef, useState } from 'react'
import { EMPTY_APPLICATION, STAGES } from '../lib/applications'

/*
  The side panel for adding or editing a job.
  It uses the browser's built-in <dialog> element, which handles
  focus, the Escape key, and the dimmed background for free.

  Props:
  - application: the job to edit, or a partial one (like { status: 'applied' }) for a new job
  - onSave(values), onDelete(), onClose()
*/
export default function ApplicationDrawer({ application, onSave, onDelete, onClose }) {
  const dialogRef = useRef(null)
  const isNew = !application?.id
  const [values, setValues] = useState(() => toFormValues(application))
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  // Open as a modal as soon as the component appears.
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  function update(field) {
    return (e) => setValues({ ...values, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(values)
    } catch (err) {
      setError(err.message || 'Could not save. Check your connection and try again.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) return setConfirmingDelete(true)
    setSaving(true)
    try {
      await onDelete()
    } catch (err) {
      setError(err.message || 'Could not delete. Try again.')
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicking the dimmed background (the dialog itself, outside the panel) closes it
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      aria-labelledby="drawer-title"
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-lg bg-white p-0 text-ink backdrop:bg-ink/30 backdrop:backdrop-blur-sm sm:rounded-l-3xl"
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 px-7 pt-7 pb-2">
          <div>
            <h2 id="drawer-title" className="text-3xl font-bold">
              {isNew ? 'Add a job' : application.company}
            </h2>
            {!isNew && <p className="mt-1 text-muted">{application.role}</p>}
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            aria-label="Close"
            className="-mr-2 rounded-full p-2 text-muted hover:bg-cloud hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-7 py-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company" id="company">
              <input id="company" required autoFocus value={values.company} onChange={update('company')} className={inputClass} />
            </Field>
            <Field label="Role" id="role">
              <input id="role" required value={values.role} onChange={update('role')} className={inputClass} />
            </Field>
          </div>

          <Field label="Stage" id="status">
            <select id="status" value={values.status} onChange={update('status')} className={inputClass}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Job posting link" id="job_url" optional>
            <input id="job_url" type="url" placeholder="https://" value={values.job_url} onChange={update('job_url')} className={inputClass} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Location" id="location" optional>
              <input id="location" placeholder="Remote, DC, hybrid…" value={values.location} onChange={update('location')} className={inputClass} />
            </Field>
            <Field label="Salary range" id="salary_range" optional>
              <input id="salary_range" placeholder="$85k to $100k" value={values.salary_range} onChange={update('salary_range')} className={inputClass} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Apply by" id="deadline" optional>
              <input id="deadline" type="date" value={values.deadline} onChange={update('deadline')} className={inputClass} />
            </Field>
            <Field label="Date applied" id="date_applied" optional>
              <input id="date_applied" type="date" value={values.date_applied} onChange={update('date_applied')} className={inputClass} />
            </Field>
          </div>

          <fieldset className="rounded-2xl bg-cloud p-4">
            <legend className="sr-only">Next step</legend>
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field label="Next step" id="next_step" optional>
                <input id="next_step" placeholder="Phone screen with recruiter" value={values.next_step} onChange={update('next_step')} className={inputClass} />
              </Field>
              <Field label="When" id="next_step_date" optional>
                <input id="next_step_date" type="date" value={values.next_step_date} onChange={update('next_step_date')} className={inputClass} />
              </Field>
            </div>
          </fieldset>

          <Field label="Notes" id="notes" optional>
            <textarea id="notes" rows={4} value={values.notes} onChange={update('notes')} className={`${inputClass} resize-y`} />
          </Field>

          {values.job_url && (
            <a href={values.job_url} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-primary hover:underline">
              Open job posting
            </a>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-line px-7 py-5">
          {error && (
            <p className="w-full text-sm text-coral" role="alert">
              {error}
            </p>
          )}

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                confirmingDelete ? 'bg-coral text-white' : 'text-coral hover:bg-coral/10'
              }`}
            >
              {confirmingDelete ? 'Yes, delete it' : 'Delete'}
            </button>
          )}

          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            className="ml-auto rounded-full px-5 py-2.5 text-sm font-semibold text-muted hover:bg-cloud hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isNew ? 'Add job' : 'Save changes'}
          </button>
        </footer>
      </form>
    </dialog>
  )
}

// The database uses null for "empty"; form inputs need empty strings.
function toFormValues(application) {
  const values = { ...EMPTY_APPLICATION }
  for (const key of Object.keys(values)) {
    if (application?.[key] != null) values[key] = application[key]
  }
  return values
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-primary'

function Field({ label, id, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
    </div>
  )
}
