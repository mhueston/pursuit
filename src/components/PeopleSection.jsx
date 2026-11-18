import { useEffect, useState } from 'react'
import { listContacts, roleLine } from '../lib/contacts'
import { RELATIONSHIPS, linkPerson, listPeopleForApplication, sameCompany, unlinkPerson } from '../lib/links'
import Avatar from './Avatar'
import { DrawerSection } from './Drawer'
import { smallInputClass } from './FormField'

/*
  Inside the job panel: the people connected to this job.
  - Shows who's linked and how (referral, recruiter, and so on)
  - Suggests contacts who work at the same company
  - Lets you link anyone else from your contacts
*/
export default function PeopleSection({ application }) {
  const [linked, setLinked] = useState(null) // [{ relationship, contact }]
  const [contacts, setContacts] = useState([])
  const [choice, setChoice] = useState('')
  const [relationship, setRelationship] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listPeopleForApplication(application.id), listContacts()])
      .then(([links, all]) => {
        setLinked(links)
        setContacts(all)
      })
      .catch((err) => setError(err.message))
  }, [application.id])

  if (!linked) return <DrawerSection title="People">{error || 'Loading…'}</DrawerSection>

  const linkedIds = new Set(linked.map((l) => l.contact.id))
  const available = contacts.filter((c) => !linkedIds.has(c.id))
  const suggestions = available.filter((c) => sameCompany(c.company, application.company))

  async function link(contact, rel) {
    setError('')
    try {
      await linkPerson(application.id, contact.id, rel)
      setLinked((list) => [...list, { relationship: rel || null, contact }])
      setChoice('')
      setRelationship('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function unlink(contact) {
    setError('')
    try {
      await unlinkPerson(application.id, contact.id)
      setLinked((list) => list.filter((l) => l.contact.id !== contact.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <DrawerSection title="People">
      {linked.length === 0 && suggestions.length === 0 && (
        <p className="text-sm text-muted">No one linked yet. A referral or a recruiter contact can make all the difference.</p>
      )}

      {linked.length > 0 && (
        <ul className="space-y-2">
          {linked.map(({ contact, relationship: rel }) => (
            <li key={contact.id} className="flex items-center gap-3 rounded-2xl bg-cloud px-3 py-2.5">
              <Avatar name={contact.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{contact.name}</p>
                <p className="truncate text-xs text-muted">{[rel, roleLine(contact)].filter(Boolean).join(', ')}</p>
              </div>
              <button
                type="button"
                onClick={() => unlink(contact)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-muted hover:bg-white hover:text-coral"
                aria-label={`Unlink ${contact.name}`}
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
            You know {suggestions.length} {suggestions.length === 1 ? 'person' : 'people'} at {application.company}
          </p>
          <ul className="mt-2 space-y-1.5">
            {suggestions.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <Avatar name={c.name} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {c.name}
                  {c.title && <span className="text-muted">, {c.title}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => link(c, 'Works there')}
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
          <label className="sr-only" htmlFor="link-person">Person</label>
          <select id="link-person" value={choice} onChange={(e) => setChoice(e.target.value)} className={smallInputClass}>
            <option value="">Link someone else…</option>
            {available
              .filter((c) => !suggestions.includes(c))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ''}
                </option>
              ))}
          </select>
          <label className="sr-only" htmlFor="link-relationship">How they're connected</label>
          <select id="link-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={smallInputClass}>
            <option value="">Connection</option>
            {RELATIONSHIPS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!choice}
            onClick={() => link(contacts.find((c) => c.id === choice), relationship)}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
          >
            Link
          </button>
        </div>
      )}

      {contacts.length === 0 && (
        <p className="mt-2 text-sm text-muted">Add people on the Contacts page, then link them here.</p>
      )}

      {error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}
    </DrawerSection>
  )
}
