import { supabase } from './supabase'

/*
  Everything the app does with the "applications" table lives here,
  so pages never talk to the database directly. If you ever switch
  databases, this is the only file that changes.
*/

// The columns on the board, in order. `id` matches the database value.
export const STAGES = [
  { id: 'saved', label: 'Saved', hint: 'Jobs you want to apply to' },
  { id: 'applied', label: 'Applied', hint: 'Waiting to hear back' },
  { id: 'interviewing', label: 'Interviewing', hint: 'In conversations' },
  { id: 'offer', label: 'Offer', hint: 'Decisions to make' },
  { id: 'closed', label: 'Closed', hint: 'Rejected, withdrawn, or passed' },
]

// The fields the form can edit. Used to build empty forms and to
// make sure we only send real columns to the database.
export const EMPTY_APPLICATION = {
  company: '',
  role: '',
  status: 'saved',
  job_url: '',
  location: '',
  salary_range: '',
  date_applied: '',
  deadline: '',
  next_step: '',
  next_step_date: '',
  notes: '',
}

// Today's date as "YYYY-MM-DD" in the user's own time zone.
export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Empty strings from the form become null in the database,
// so a blank date is "no date" instead of an error.
function clean(values) {
  const row = {}
  for (const key of [...Object.keys(EMPTY_APPLICATION), 'position']) {
    if (key in values) row[key] = values[key] === '' ? null : values[key]
  }
  return row
}

// Throw database errors so the page can catch them and show a message.
function check({ data, error }) {
  if (error) throw error
  return data
}

export async function listApplications() {
  return check(
    await supabase.from('applications').select('*').order('position', { ascending: true }),
  )
}

export async function createApplication(values, position) {
  return check(
    await supabase
      .from('applications')
      .insert({ ...clean(values), position })
      .select()
      .single(),
  )
}

export async function updateApplication(id, values) {
  return check(
    await supabase.from('applications').update(values).eq('id', id).select().single(),
  )
}

export async function saveApplication(id, values) {
  return updateApplication(id, clean(values))
}

export async function deleteApplication(id) {
  check(await supabase.from('applications').delete().eq('id', id))
}

/*
  Where a card lands when it enters a column: at the top.
  Cards are sorted by `position` from smallest to largest, so the
  new card gets a number one smaller than the current top card.
*/
export function topPosition(applications, status) {
  const positions = applications.filter((a) => a.status === status).map((a) => a.position)
  return positions.length ? Math.min(...positions) - 1 : 0
}

/*
  The changes to make when a card moves to a new stage.
  Moving to "Applied" fills in today's date if it was blank,
  so you don't have to remember to.
*/
export function moveChanges(application, status, allApplications) {
  const changes = { status, position: topPosition(allApplications, status) }
  if (status === 'applied' && !application.date_applied) changes.date_applied = today()
  return changes
}
