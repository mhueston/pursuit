import { supabase } from './supabase'
import { check, pick } from './db'
import { today } from './dates'

/*
  Everything the app does with contacts and the touchpoint log
  ("interactions" in the database) lives here.
*/

export const EMPTY_CONTACT = {
  name: '',
  company: '',
  title: '',
  email: '',
  linkedin_url: '',
  where_met: '',
  met_on: '',
  last_contacted: '',
  follow_up_on: '',
  notes: '',
}

const clean = (values) => pick(values, Object.keys(EMPTY_CONTACT))

// The kinds of touchpoints you can log. `id` matches the database value.
export const TOUCHPOINT_KINDS = [
  { id: 'message', label: 'Message' },
  { id: 'email', label: 'Email' },
  { id: 'call', label: 'Call' },
  { id: 'coffee', label: 'Coffee chat' },
  { id: 'event', label: 'Event' },
  { id: 'other', label: 'Other' },
]

export async function listContacts() {
  return check(await supabase.from('contacts').select('*').order('name'))
}

export async function createContact(values) {
  return check(await supabase.from('contacts').insert(clean(values)).select().single())
}

export async function saveContact(id, values) {
  return check(await supabase.from('contacts').update(clean(values)).eq('id', id).select().single())
}

export async function deleteContact(id) {
  check(await supabase.from('contacts').delete().eq('id', id))
}

// ----- Touchpoints -----

export async function listTouchpoints(contactId) {
  return check(
    await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('happened_on', { ascending: false })
      .order('created_at', { ascending: false }),
  )
}

/*
  Logging a touchpoint also updates the contact's "last contacted"
  date, so the two always agree. Returns both new rows.
*/
export async function logTouchpoint(contact, { kind, happened_on, summary }) {
  const touchpoint = check(
    await supabase
      .from('interactions')
      .insert({ contact_id: contact.id, kind, happened_on: happened_on || today(), summary: summary || null })
      .select()
      .single(),
  )

  let updatedContact = contact
  if (!contact.last_contacted || touchpoint.happened_on > contact.last_contacted) {
    updatedContact = check(
      await supabase
        .from('contacts')
        .update({ last_contacted: touchpoint.happened_on })
        .eq('id', contact.id)
        .select()
        .single(),
    )
  }

  return { touchpoint, contact: updatedContact }
}

/*
  "Done" on a follow-up: logs that you reached out today and clears
  the follow-up date, so they drop off your Up next list.
*/
export async function completeFollowUp(contact) {
  const { contact: updated } = await logTouchpoint(contact, { kind: 'message', summary: 'Followed up' })
  return check(
    await supabase.from('contacts').update({ follow_up_on: null }).eq('id', updated.id).select().single(),
  )
}

export async function deleteTouchpoint(id) {
  check(await supabase.from('interactions').delete().eq('id', id))
}

// ----- Small helpers for showing contacts -----

// "Maya Johnson" -> "MJ"
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase()
}

// "UX Engineer at Google", or whichever part exists
export function roleLine({ title, company }) {
  if (title && company) return `${title} at ${company}`
  return title || company || ''
}
