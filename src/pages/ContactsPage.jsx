import EmptyState from '../components/EmptyState'

// Step 3 turns this into your networking CRM.
export default function ContactsPage() {
  return (
    <>
      <h1 className="text-5xl font-bold sm:text-6xl">Contacts</h1>
      <p className="mt-3 text-lg text-muted">The people who can open doors, and when to reach back out.</p>

      <EmptyState title="Add someone you've met">
        A classmate, a recruiter from a career fair, a speaker at a conference. Set a follow-up date so you don't lose touch.
      </EmptyState>
    </>
  )
}
