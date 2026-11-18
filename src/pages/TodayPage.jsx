import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  STAGES,
  STAGE_DOT,
  deleteApplication,
  listApplications,
  moveChanges,
  saveApplication,
  updateApplication,
} from '../lib/applications'
import { completeFollowUp, deleteContact, listContacts, saveContact } from '../lib/contacts'
import { buildAgenda, groupAgenda } from '../lib/agenda'
import { addDays, daysUntil, isThisWeek, relativeDay, today } from '../lib/dates'
import { BellIcon, CalendarIcon, PeopleIcon } from '../components/Icons'
import ApplicationDrawer from '../components/ApplicationDrawer'
import ContactDrawer from '../components/ContactDrawer'
import EmptyState from '../components/EmptyState'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// A short, encouraging line based on where the search stands.
function encouragement({ total, interviewing, offers, dueToday }) {
  if (offers > 0) return 'You have an offer on the table. Take a moment to celebrate.'
  if (dueToday > 0) return `${dueToday} ${dueToday === 1 ? 'thing needs' : 'things need'} you today. You've got this.`
  if (interviewing > 0) return `${interviewing} ${interviewing === 1 ? 'company is' : 'companies are'} talking to you. That's real progress.`
  if (total > 0) return 'Every application is a step closer. Keep the momentum going.'
  return "Let's get your search started."
}

/*
  Today: your daily home base. Everything with a date (follow-ups,
  interviews, deadlines) in one list, plus your weekly goal and pipeline.
*/
export default function TodayPage() {
  const { user } = useAuth()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
  const [applications, setApplications] = useState(null)
  const [contacts, setContacts] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(null) // { type: 'application' | 'contact', record }

  useEffect(() => {
    Promise.all([listApplications(), listContacts()])
      .then(([apps, people]) => {
        setApplications(apps)
        setContacts(people)
      })
      .catch((err) => setError(`Couldn't load your day. ${err.message}`))
  }, [])

  const loaded = applications && contacts
  if (!loaded) {
    return <Greeting firstName={firstName} line={error || 'Loading…'} />
  }

  const replaceApp = (updated) => setApplications((list) => list.map((a) => (a.id === updated.id ? updated : a)))
  const replaceContact = (updated) => setContacts((list) => list.map((c) => (c.id === updated.id ? updated : c)))

  const agenda = buildAgenda(applications, contacts)
  const groups = groupAgenda(agenda)
  const active = applications.filter((a) => a.status !== 'closed')
  const stats = {
    total: active.length,
    interviewing: active.filter((a) => a.status === 'interviewing').length,
    offers: active.filter((a) => a.status === 'offer').length,
    dueToday: agenda.filter((item) => daysUntil(item.date) <= 0).length,
  }

  // ----- Quick actions on an agenda item -----

  async function act(item, action) {
    setError('')
    try {
      if (action === 'done') await markDone(item)
      if (action === 'snooze') await snooze(item)
    } catch (err) {
      setError(err.message)
    }
  }

  async function markDone(item) {
    const record = item.record
    if (item.kind === 'followup') {
      replaceContact(await completeFollowUp(record))
      setNotice(`Nice. Logged your follow-up with ${record.name.split(' ')[0]}.`)
    } else if (item.kind === 'step') {
      replaceApp(await updateApplication(record.id, { next_step: null, next_step_date: null }))
      setNotice(`Done. Add the next step for ${record.company} when you know it.`)
    } else if (item.kind === 'deadline') {
      replaceApp(await updateApplication(record.id, moveChanges(record, 'applied', applications)))
      setNotice(`You applied to ${record.company}. That's one more door knocked on.`)
    }
  }

  // Push the date 3 days out (from today if it's already overdue).
  async function snooze(item) {
    const record = item.record
    const newDate = addDays(daysUntil(item.date) < 0 ? today() : item.date, 3)
    if (item.kind === 'followup') replaceContact(await saveContact(record.id, { follow_up_on: newDate }))
    if (item.kind === 'step') replaceApp(await updateApplication(record.id, { next_step_date: newDate }))
    if (item.kind === 'deadline') replaceApp(await updateApplication(record.id, { deadline: newDate }))
    setNotice(`Moved to ${relativeDay(newDate)}.`)
  }

  // ----- Saving from the side panels -----

  async function saveApp(values) {
    const original = editing.record
    const changes = values.status !== original.status ? { ...values, ...moveChanges(original, values.status, applications) } : values
    if (values.date_applied) changes.date_applied = values.date_applied
    replaceApp(await saveApplication(original.id, changes))
    setEditing(null)
  }

  async function removeApp() {
    await deleteApplication(editing.record.id)
    setApplications((list) => list.filter((a) => a.id !== editing.record.id))
    setEditing(null)
  }

  async function saveContactValues(values) {
    replaceContact(await saveContact(editing.record.id, values))
    setEditing(null)
  }

  async function removeContact() {
    await deleteContact(editing.record.id)
    setContacts((list) => list.filter((c) => c.id !== editing.record.id))
    setEditing(null)
  }

  // ----- Page -----

  const brandNew = applications.length === 0 && contacts.length === 0

  return (
    <>
      <Greeting firstName={firstName} line={encouragement(stats)} />

      {error && (
        <p className="mt-6 rounded-2xl bg-coral/10 px-5 py-3 text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      {brandNew ? (
        <EmptyState
          title="Start with one job"
          action={
            <Link to="/applications" className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">
              Add your first job
            </Link>
          }
        >
          Save a job you're interested in, even if you haven't applied yet. Then add the people you've met. Your day will come together here.
        </EmptyState>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <section aria-labelledby="up-next">
            <h2 id="up-next" className="text-2xl font-bold">Up next</h2>

            {/* Confirmation after Done or Snooze. Always in the page so screen readers announce it. */}
            <p
              className={notice ? 'mt-3 rounded-2xl bg-offer/10 px-4 py-2.5 text-sm font-medium text-ink' : 'sr-only'}
              role="status"
              aria-live="polite"
            >
              {notice}
            </p>

            {groups.length === 0 ? (
              <div className="mt-2 rounded-3xl bg-cloud px-6 py-12 text-center">
                <p className="font-display text-xl font-semibold">You're all caught up.</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  Nothing due in the next two weeks. Set a follow-up on a contact or a next step on a job to see it here.
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="mt-4 first:mt-2">
                  <h3 className={`text-sm font-semibold ${group.id === 'overdue' ? 'text-coral' : 'text-muted'}`}>
                    {group.label}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((item) => (
                      <AgendaItem
                        key={item.key}
                        item={item}
                        onOpen={() =>
                          setEditing({ type: item.kind === 'followup' ? 'contact' : 'application', record: item.record })
                        }
                        onDone={() => act(item, 'done')}
                        onSnooze={() => act(item, 'snooze')}
                      />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>

          <aside className="space-y-4">
            <WeeklyGoal applications={applications} />
            <Pipeline applications={applications} />
          </aside>
        </div>
      )}

      {editing?.type === 'application' && (
        <ApplicationDrawer
          key={editing.record.id}
          application={editing.record}
          onSave={saveApp}
          onDelete={removeApp}
          onClose={() => setEditing(null)}
        />
      )}
      {editing?.type === 'contact' && (
        <ContactDrawer
          key={editing.record.id}
          contact={editing.record}
          onSave={saveContactValues}
          onDelete={removeContact}
          onClose={() => setEditing(null)}
          onContactChanged={replaceContact}
        />
      )}
    </>
  )
}

function Greeting({ firstName, line }) {
  return (
    <>
      <h1 className="text-5xl font-bold sm:text-6xl">
        {greeting()}
        {firstName ? `, ${firstName}.` : '.'}
      </h1>
      <p className="mt-3 text-lg text-muted">{line}</p>
    </>
  )
}

// What each kind of item looks like and what its main button says.
const KIND = {
  followup: { Icon: PeopleIcon, tile: 'bg-applied/15 text-applied', done: 'Done' },
  step: { Icon: CalendarIcon, tile: 'bg-interviewing/20 text-interviewing', done: 'Done' },
  deadline: { Icon: BellIcon, tile: 'bg-saved/15 text-saved', done: 'Applied' },
}

function AgendaItem({ item, onOpen, onDone, onSnooze }) {
  const { Icon, tile, done } = KIND[item.kind]
  const days = daysUntil(item.date)
  const urgent = days <= 0

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl bg-cloud p-4 sm:flex-nowrap">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tile}`}>
        <Icon width="22" height="22" />
      </span>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate font-semibold">{item.title}</span>
        <span className="block truncate text-sm text-muted">{item.detail}</span>
      </button>

      <span className={`text-sm font-medium whitespace-nowrap ${urgent ? 'text-coral' : 'text-muted'}`}>
        {relativeDay(item.date)}
      </span>

      <div className="flex w-full gap-2 sm:w-auto">
        <button
          type="button"
          onClick={onSnooze}
          title="Snooze 3 days"
          aria-label={`Snooze ${item.title} 3 days`}
          className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-muted hover:text-ink sm:flex-none"
        >
          Snooze
        </button>
        <button
          type="button"
          onClick={onDone}
          aria-label={`${done}: ${item.title}`}
          className="flex-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/85 sm:flex-none"
        >
          {done}
        </button>
      </div>
    </li>
  )
}

/*
  A weekly application goal. It's saved on your account (not in a table),
  so it follows you to any device.
*/
function WeeklyGoal({ applications }) {
  const { user, updateSettings } = useAuth()
  const goal = user?.user_metadata?.weekly_goal ?? 5
  const count = applications.filter((a) => a.date_applied && isThisWeek(a.date_applied)).length
  const percent = Math.min(100, Math.round((count / goal) * 100))
  const met = count >= goal

  function changeGoal(by) {
    const next = Math.min(50, Math.max(1, goal + by))
    if (next !== goal) updateSettings({ weekly_goal: next })
  }

  return (
    <section className="rounded-3xl bg-cloud p-6" aria-labelledby="goal-title">
      <div className="flex items-center justify-between">
        <h2 id="goal-title" className="text-lg font-semibold">This week</h2>
        <div className="flex items-center gap-1" role="group" aria-label="Weekly goal">
          <button type="button" onClick={() => changeGoal(-1)} aria-label="Lower goal" className="grid size-8 place-items-center rounded-full bg-white text-muted hover:text-ink">
            −
          </button>
          <span className="w-16 text-center text-xs text-muted">Goal {goal}</span>
          <button type="button" onClick={() => changeGoal(1)} aria-label="Raise goal" className="grid size-8 place-items-center rounded-full bg-white text-muted hover:text-ink">
            +
          </button>
        </div>
      </div>

      <p className="mt-5 font-display text-5xl font-bold tracking-tight">
        {count}
        <span className="text-2xl text-muted"> of {goal}</span>
      </p>
      <p className="mt-1 text-sm text-muted">applications sent</p>

      <div
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-label="Weekly goal progress"
      >
        <div className={`h-full rounded-full transition-all ${met ? 'bg-offer' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
      </div>

      <p className="mt-3 text-sm">
        {met
          ? 'You hit your goal this week. Be proud of that.'
          : `${goal - count} to go. One at a time.`}
      </p>
    </section>
  )
}

// How many jobs are in each stage, as one colored bar.
function Pipeline({ applications }) {
  const counts = STAGES.map((s) => ({ ...s, count: applications.filter((a) => a.status === s.id).length }))
  const total = applications.length

  return (
    <section className="rounded-3xl bg-cloud p-6" aria-labelledby="pipeline-title">
      <div className="flex items-baseline justify-between">
        <h2 id="pipeline-title" className="text-lg font-semibold">Pipeline</h2>
        <Link to="/applications" className="text-sm font-semibold text-primary hover:underline">
          Open board
        </Link>
      </div>

      {total > 0 && (
        <div className="mt-5 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
          {counts
            .filter((s) => s.count > 0)
            .map((s) => (
              <div key={s.id} className={STAGE_DOT[s.id]} style={{ flexGrow: s.count }} />
            ))}
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {counts.map((s) => (
          <li key={s.id} className="flex items-center gap-2.5 text-sm">
            <span className={`size-2.5 rounded-full ${STAGE_DOT[s.id]}`} aria-hidden="true" />
            <span className="flex-1">{s.label}</span>
            <span className="font-semibold">{s.count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
