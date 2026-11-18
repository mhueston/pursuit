import { supabase } from './supabase'
import { check, pick } from './db'
import { today } from './dates'

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

// Each stage's dot color. Tailwind needs to see whole class names in the
// code (it can't build "bg-" + stage.id on the fly), so they're spelled out.
export const STAGE_DOT = {
  saved: 'bg-saved',
  applied: 'bg-applied',
  interviewing: 'bg-interviewing',
  offer: 'bg-offer',
  closed: 'bg-closed',
}

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

// The columns the app is allowed to write.
const FIELDS = [...Object.keys(EMPTY_APPLICATION), 'position']
const clean = (values) => pick(values, FIELDS)

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
