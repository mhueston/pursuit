import { useEffect, useState } from 'react'
import { STAGES, STAGE_DOT as DOT, listApplications } from '../lib/applications'
import { RELATIONSHIPS, linkPerson, listJobsForContact, sameCompany, unlinkPerson } from '../lib/links'
import { DrawerSection } from './Drawer'
import { smallInputClass } from './FormField'

const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label ?? id

/*
  Inside the contact panel: the jobs this person is connected to.
  The mirror image of the People section in the job panel.
*/
export default function JobsSection({ contact }) {
  const [linked, setLinked] = useState(null) // [{ relationship, application }]
  const [applications, setApplications] = useState([])
  const [choice, setChoice] = useState('')
  const [relationship, setRelationship] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listJobsForContact(contact.id), listApplications()])
      .then(([links, all]) => {
        setLinked(links)
        setApplications(all)
      })
      .catch((err) => setError(err.message))
  }, [contact.id])

  if (!linked) return <DrawerSection title="Jobs">{error || 'Loading…'}</DrawerSection>

  const linkedIds = new Set(linked.map((l) => l.application.id))
  const available = applications.filter((a) => !linkedIds.has(a.id))
  const suggestions = available.filter((a) => sameCompany(a.company, contact.company))

  async function link(application, rel) {
    setError('')
    try {
      await linkPerson(application.id, contact.id, rel)
      setLinked((list) => [...list, { relationship: rel || null, application }])
      setChoice('')
      setRelationship('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function unlink(application) {
    setError('')
    try {
      await unlinkPerson(application.id, contact.id)
      setLinked((list) => list.filter((l) => l.application.id !== application.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <DrawerSection title="Jobs">
      {linked.length === 0 && suggestions.length === 0 && (
        <p className="text-sm text-muted">Not linked to any jobs yet.</p>
      )}

      {linked.length > 0 && (
        <ul className="space-y-2">
          {linked.map(({ application, relationship: rel }) => (
            <li key={application.id} className="flex items-center gap-3 rounded-2xl bg-cloud px-4 py-2.5">
              <span className={`size-2.5 shrink-0 rounded-full ${DOT[application.status]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {application.role} at {application.company}
                </p>
                <p className="truncate text-xs text-muted">
                  {[stageLabel(application.status), rel].filter(Boolean).join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => unlink(application)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-muted hover:bg-white hover:text-coral"
                aria-label={`Unlink ${application.company} ${application.role}`}
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-primary/40 p-3">
          <p className="text-sm font-medium">
            {suggestions.length === 1 ? 'A job' : `${suggestions.length} jobs`} on your board {suggestions.length === 1 ? 'is' : 'are'} at {contact.company}
          </p>
          <ul className="mt-2 space-y-1.5">
            {suggestions.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className={`size-2.5 shrink-0 rounded-full ${DOT[a.status]}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm">{a.role}</span>
                <button
                  type="button"
                  onClick={() => link(a, 'Works there')}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-dark"
                >
                  Link
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {available.length > suggestions.length && (
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
          <label className="sr-only" htmlFor="link-job">Job</label>
          <select id="link-job" value={choice} onChange={(e) => setChoice(e.target.value)} className={smallInputClass}>
            <option value="">Link a job…</option>
            {available
              .filter((a) => !suggestions.includes(a))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company}, {a.role}
                </option>
              ))}
          </select>
          <label className="sr-only" htmlFor="link-job-relationship">How they're connected</label>
          <select id="link-job-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={smallInputClass}>
            <option value="">Connection</option>
            {RELATIONSHIPS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!choice}
            onClick={() => link(applications.find((a) => a.id === choice), relationship)}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
          >
            Link
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}
    </DrawerSection>
  )
}
