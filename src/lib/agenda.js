import { daysUntil } from './dates'

/*
  The "Up next" list on the Today page. It pulls dated items from
  everywhere in the app into one list:

  - followup: a contact's "Follow up on" date
  - step:     a job's next step (interview, phone screen, decision…)
  - deadline: an "Apply by" date on a job you haven't applied to yet

  Each item keeps a reference to the original job or contact
  (`record`) so the page can open it or update it.
*/

// How far ahead to look. Anything later shows up once it gets closer.
const LOOKAHEAD_DAYS = 14

export function buildAgenda(applications, contacts) {
  const items = []

  for (const contact of contacts) {
    if (!contact.follow_up_on) continue
    items.push({
      key: `followup-${contact.id}`,
      kind: 'followup',
      date: contact.follow_up_on,
      title: `Follow up with ${contact.name}`,
      detail: [contact.title, contact.company].filter(Boolean).join(' at ') || contact.where_met || '',
      record: contact,
    })
  }

  for (const app of applications) {
    if (app.status === 'closed') continue

    if (app.next_step_date) {
      items.push({
        key: `step-${app.id}`,
        kind: 'step',
        date: app.next_step_date,
        title: app.next_step || 'Next step',
        detail: `${app.role} at ${app.company}`,
        record: app,
      })
    }

    if (app.status === 'saved' && app.deadline) {
      items.push({
        key: `deadline-${app.id}`,
        kind: 'deadline',
        date: app.deadline,
        title: `Apply to ${app.company}`,
        detail: app.role,
        record: app,
      })
    }
  }

  return items
    .filter((item) => daysUntil(item.date) <= LOOKAHEAD_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Split the list into labeled groups, skipping any that are empty.
export function groupAgenda(items) {
  const groups = [
    { id: 'overdue', label: 'Overdue', test: (d) => d < 0 },
    { id: 'today', label: 'Today', test: (d) => d === 0 },
    { id: 'week', label: 'This week', test: (d) => d >= 1 && d <= 7 },
    { id: 'later', label: 'Coming up', test: (d) => d > 7 },
  ]
  return groups
    .map((g) => ({ ...g, items: items.filter((item) => g.test(daysUntil(item.date))) }))
    .filter((g) => g.items.length > 0)
}
