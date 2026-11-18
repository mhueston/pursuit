import { useEffect, useMemo, useState } from 'react'
import { createContact, deleteContact, listContacts, roleLine, saveContact } from '../lib/contacts'
import { daysUntil, relativeDay, shortDate } from '../lib/dates'
import Avatar from '../components/Avatar'
import ContactDrawer from '../components/ContactDrawer'
import EmptyState from '../components/EmptyState'

// Follow-ups due today or overdue
const isDue = (c) => c.follow_up_on && daysUntil(c.follow_up_on) <= 0

/*
  The Contacts page: everyone in your network, with the people you
  need to follow up with sorted to the top.
*/
export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' or 'due'
  const [editing, setEditing] = useState(null) // the contact open in the side panel, or null

  useEffect(() => {
    listContacts()
      .then(setContacts)
      .catch((err) => setError(`Couldn't load your contacts. ${err.message}`))
      .finally(() => setLoading(false))
  }, [])

  const dueCount = contacts.filter(isDue).length

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts
      .filter((c) => filter === 'all' || isDue(c))
      .filter((c) => !q || [c.name, c.company, c.title, c.where_met].some((f) => f?.toLowerCase().includes(q)))
      .sort((a, b) => {
        // Soonest follow-up first, people with no follow-up date last, then by name
        if (a.follow_up_on && b.follow_up_on) return a.follow_up_on.localeCompare(b.follow_up_on)
        if (a.follow_up_on) return -1
        if (b.follow_up_on) return 1
        return a.name.localeCompare(b.name)
      })
  }, [contacts, search, filter])

  function replace(updated) {
    setContacts((list) => list.map((c) => (c.id === updated.id ? updated : c)))
    setEditing((current) => (current?.id === updated.id ? updated : current))
  }

  async function handleSave(values) {
    if (editing.id) {
      replace(await saveContact(editing.id, values))
    } else {
      const created = await createContact(values)
      setContacts((list) => [...list, created])
    }
    setEditing(null)
  }

  async function handleDelete() {
    await deleteContact(editing.id)
    setContacts((list) => list.filter((c) => c.id !== editing.id))
    setEditing(null)
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold sm:text-6xl">Contacts</h1>
          <p className="mt-3 text-lg text-muted">The people who can open doors, and when to reach back out.</p>
        </div>

        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <label className="relative flex-1 sm:w-64 sm:flex-none">
            <span className="sr-only">Search contacts</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, event"
              className="w-full rounded-full bg-cloud px-5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary"
            />
          </label>
          <button
            onClick={() => setEditing({})}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Add a contact
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 px-5 py-3 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      {!loading && contacts.length > 0 && (
        <div className="mt-10 flex gap-2" role="group" aria-label="Filter contacts">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            Everyone <span className="opacity-60">{contacts.length}</span>
          </FilterPill>
          <FilterPill active={filter === 'due'} onClick={() => setFilter('due')}>
            Follow up now <span className={filter === 'due' ? 'opacity-60' : 'text-coral'}>{dueCount}</span>
          </FilterPill>
        </div>
      )}

      {loading && <p className="mt-10 text-muted" role="status">Loading your contacts…</p>}

      {!loading && contacts.length === 0 && (
        <EmptyState
          title="Add someone you've met"
          action={
            <button onClick={() => setEditing({})} className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">
              Add a contact
            </button>
          }
        >
          A classmate, a recruiter from a career fair, a speaker at a conference. Set a follow-up date so you don't lose touch.
        </EmptyState>
      )}

      {!loading && contacts.length > 0 && visible.length === 0 && (
        <p className="mt-8 text-muted">
          {filter === 'due' && !search ? "You're all caught up. Nobody needs a follow-up right now." : 'No contacts match your search.'}
        </p>
      )}

      {visible.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((contact) => (
            <li key={contact.id}>
              <ContactTile contact={contact} onOpen={() => setEditing(contact)} />
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ContactDrawer
          key={editing.id ?? 'new'}
          contact={editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
          onContactChanged={replace}
        />
      )}
    </>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-ink text-white' : 'bg-cloud text-ink hover:bg-line'
      }`}
    >
      {children}
    </button>
  )
}

function ContactTile({ contact, onOpen }) {
  const line = roleLine(contact)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-full w-full flex-col rounded-3xl bg-cloud p-5 text-left transition-colors hover:bg-line/60"
    >
      <div className="flex items-center gap-4">
        <Avatar name={contact.name} />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold">{contact.name}</p>
          {line && <p className="truncate text-sm text-muted">{line}</p>}
        </div>
      </div>

      {contact.where_met && <p className="mt-4 text-sm text-ink">Met at {contact.where_met}</p>}

      <div className="mt-auto pt-4">
        <FollowUpSignal contact={contact} />
      </div>
    </button>
  )
}

function FollowUpSignal({ contact }) {
  const { follow_up_on, last_contacted } = contact

  if (follow_up_on) {
    const days = daysUntil(follow_up_on)
    const due = days <= 0
    return (
      <p
        className={`flex items-baseline justify-between gap-3 rounded-lg px-3 py-1.5 text-xs font-medium ${
          due ? 'bg-coral/10 text-coral' : 'bg-white text-ink'
        }`}
      >
        <span>{days < 0 ? 'Follow-up overdue' : 'Follow up'}</span>
        <span className="font-normal">{relativeDay(follow_up_on)}</span>
      </p>
    )
  }

  if (last_contacted) return <p className="text-xs text-muted">Last talked {shortDate(last_contacted)}</p>

  return <p className="text-xs text-muted">No follow-up set</p>
}
