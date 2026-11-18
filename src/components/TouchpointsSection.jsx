import { useEffect, useState } from 'react'
import { TOUCHPOINT_KINDS, deleteTouchpoint, listTouchpoints, logTouchpoint } from '../lib/contacts'
import { relativeDay, today } from '../lib/dates'
import { DrawerSection } from './Drawer'
import { smallInputClass } from './FormField'

const kindLabel = (id) => TOUCHPOINT_KINDS.find((k) => k.id === id)?.label ?? id

/*
  Inside the contact panel: a running log of every time you've been
  in touch, newest first. Logging one also sets "Last talked".
*/
export default function TouchpointsSection({ contact, onLogged }) {
  const [entries, setEntries] = useState(null)
  const [draft, setDraft] = useState({ kind: 'message', happened_on: today(), summary: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listTouchpoints(contact.id)
      .then(setEntries)
      .catch((err) => setError(err.message))
  }, [contact.id])

  async function handleLog() {
    setSaving(true)
    setError('')
    try {
      const result = await logTouchpoint(contact, draft)
      setEntries((list) =>
        [result.touchpoint, ...list].sort((a, b) => b.happened_on.localeCompare(a.happened_on)),
      )
      setDraft({ kind: draft.kind, happened_on: today(), summary: '' })
      onLogged(result.contact)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    try {
      await deleteTouchpoint(id)
      setEntries((list) => list.filter((e) => e.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <DrawerSection title="Touchpoints">
      <div className="rounded-2xl bg-cloud p-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="tp-kind">Type</label>
          <select id="tp-kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className={smallInputClass}>
            {TOUCHPOINT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="tp-date">Date</label>
          <input id="tp-date" type="date" value={draft.happened_on} onChange={(e) => setDraft({ ...draft, happened_on: e.target.value })} className={smallInputClass} />
        </div>
        <label className="sr-only" htmlFor="tp-summary">What happened</label>
        <input
          id="tp-summary"
          placeholder="Sent a thank-you note, asked about the team…"
          value={draft.summary}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
          onKeyDown={(e) => {
            // Enter logs it, without submitting the contact form
            if (e.key === 'Enter') {
              e.preventDefault()
              handleLog()
            }
          }}
          className={`${smallInputClass} mt-2`}
        />
        <button
          type="button"
          onClick={handleLog}
          disabled={saving}
          className="mt-2 w-full rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Logging…' : 'Log touchpoint'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}

      {entries?.length === 0 && (
        <p className="mt-3 text-sm text-muted">Nothing logged yet. Every message counts, even a quick hello.</p>
      )}

      {entries?.length > 0 && (
        <ol className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="group flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{kindLabel(entry.kind)}</span>
                  <span className="text-muted">, {relativeDay(entry.happened_on)}</span>
                </p>
                {entry.summary && <p className="text-sm text-muted">{entry.summary}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                aria-label={`Delete ${kindLabel(entry.kind)} from ${entry.happened_on}`}
                className="self-start rounded-full px-2 text-xs text-muted opacity-0 group-hover:opacity-100 hover:text-coral focus-visible:opacity-100"
              >
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}
    </DrawerSection>
  )
}
