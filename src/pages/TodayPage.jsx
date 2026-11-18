import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listApplications } from '../lib/applications'
import { daysUntil } from '../lib/dates'
import EmptyState from '../components/EmptyState'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// A short, encouraging line based on where the search stands.
function encouragement({ total, interviewing, offers }) {
  if (offers > 0) return 'You have an offer on the table. Take a moment to celebrate.'
  if (interviewing > 0) return `${interviewing} ${interviewing === 1 ? 'company is' : 'companies are'} talking to you. That's real progress.`
  if (total > 0) return 'Every application is a step closer. Keep the momentum going.'
  return "Let's get your search started."
}

// Step 4 will add follow-ups due and upcoming interviews.
export default function TodayPage() {
  const { user } = useAuth()
  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
  const [applications, setApplications] = useState(null)

  useEffect(() => {
    listApplications()
      .then(setApplications)
      .catch(() => setApplications([]))
  }, [])

  const active = (applications ?? []).filter((a) => a.status !== 'closed')
  const stats = {
    total: active.length,
    interviewing: active.filter((a) => a.status === 'interviewing').length,
    offers: active.filter((a) => a.status === 'offer').length,
    thisWeek: active.filter((a) => a.date_applied && daysUntil(a.date_applied) >= -6).length,
  }

  return (
    <>
      <h1 className="text-5xl font-bold sm:text-6xl">
        {greeting()}
        {firstName ? `, ${firstName}.` : '.'}
      </h1>
      <p className="mt-3 text-lg text-muted">{applications ? encouragement(stats) : 'Loading…'}</p>

      {applications && stats.total === 0 && (
        <EmptyState
          title="Add your first application"
          action={
            <Link to="/applications" className="inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">
              Go to Applications
            </Link>
          }
        >
          Save a job you're interested in, even if you haven't applied yet. Your stats will show up here.
        </EmptyState>
      )}

      {applications && stats.total > 0 && (
        <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat value={stats.total} label="Active applications" />
          <Stat value={stats.thisWeek} label="Applied this week" />
          <Stat value={stats.interviewing} label="Interviewing" dot="bg-interviewing" />
          <Stat value={stats.offers} label="Offers" dot="bg-offer" />
        </ul>
      )}
    </>
  )
}

function Stat({ value, label, dot }) {
  return (
    <li className="rounded-3xl bg-cloud px-6 py-7">
      <p className="font-display text-5xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        {dot && <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />}
        {label}
      </p>
    </li>
  )
}
