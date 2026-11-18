import { supabase } from './supabase'
import { check } from './db'

/*
  Links between people and jobs (the "application_contacts" table).
  One person can help with many jobs, and one job can have many people.

  The select strings below use Supabase "embedding": because the link
  table points at both contacts and applications, we can ask for the
  linked row's details in the same request.
*/

export const RELATIONSHIPS = ['Referral', 'Recruiter', 'Hiring manager', 'Interviewer', 'Works there', 'Other']

// People linked to one job: [{ relationship, contact: {...} }]
export async function listPeopleForApplication(applicationId) {
  return check(
    await supabase
      .from('application_contacts')
      .select('relationship, contact:contacts(*)')
      .eq('application_id', applicationId),
  )
}

// Jobs linked to one person: [{ relationship, application: {...} }]
export async function listJobsForContact(contactId) {
  return check(
    await supabase
      .from('application_contacts')
      .select('relationship, application:applications(*)')
      .eq('contact_id', contactId),
  )
}

export async function linkPerson(applicationId, contactId, relationship) {
  check(
    await supabase
      .from('application_contacts')
      .insert({ application_id: applicationId, contact_id: contactId, relationship: relationship || null }),
  )
}

export async function unlinkPerson(applicationId, contactId) {
  check(
    await supabase
      .from('application_contacts')
      .delete()
      .eq('application_id', applicationId)
      .eq('contact_id', contactId),
  )
}

// Compare company names loosely: "Google" matches "google " and "Google LLC".
export function sameCompany(a, b) {
  const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(inc|llc|corp|co)$/, '')
  const x = norm(a)
  const y = norm(b)
  if (!x || !y) return false
  if (x === y) return true
  // Allow "Capital One" to match "Capital One Bank", but not "Meta" to match "Metal"
  const [shorter, longer] = x.length < y.length ? [x, y] : [y, x]
  return shorter.length >= 5 && longer.startsWith(shorter)
}
