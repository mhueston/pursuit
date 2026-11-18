import { EMPTY_CONTACT, roleLine } from '../lib/contacts'
import { toFormValues } from '../lib/db'
import useDrawerForm from '../lib/useDrawerForm'
import Drawer, { closeDrawer } from './Drawer'
import Field, { DrawerButtons, inputClass } from './FormField'
import TouchpointsSection from './TouchpointsSection'
import JobsSection from './JobsSection'

/*
  The side panel for adding or editing a contact.

  Props:
  - contact: the person to edit, or {} for a new one
  - onSave(values), onDelete(), onClose()
  - onContactChanged(contact): called when logging a touchpoint updates them
*/
export default function ContactDrawer({ contact, onSave, onDelete, onClose, onContactChanged }) {
  const isNew = !contact?.id
  const form = useDrawerForm(() => toFormValues(contact, EMPTY_CONTACT))
  const { values, update, setValues } = form

  // Logging a touchpoint changes "last contacted" in the database,
  // so we update the form and the page to match.
  function handleTouchpointLogged(updated) {
    setValues((v) => ({ ...v, last_contacted: updated.last_contacted ?? '' }))
    onContactChanged(updated)
  }

  return (
    <Drawer
      title={isNew ? 'Add a contact' : contact.name}
      subtitle={isNew ? null : roleLine(contact)}
      onClose={onClose}
      footer={
        <DrawerButtons
          formId="contact-form"
          isNew={isNew}
          saving={form.saving}
          error={form.error}
          confirmingDelete={form.confirmingDelete}
          onDelete={form.remove(onDelete)}
          onCancel={closeDrawer}
          saveLabel={isNew ? 'Add contact' : 'Save changes'}
        />
      }
    >
      <form id="contact-form" onSubmit={form.submit(onSave)} className="space-y-5">
        <Field label="Name" id="name">
          <input id="name" required autoFocus={isNew} autoComplete="off" value={values.name} onChange={update('name')} className={inputClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" id="company" optional>
            <input id="company" value={values.company} onChange={update('company')} className={inputClass} />
          </Field>
          <Field label="Title" id="title" optional>
            <input id="title" placeholder="Recruiter, UX Engineer…" value={values.title} onChange={update('title')} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Where you met" id="where_met" optional>
            <input id="where_met" placeholder="AfroTech, career fair, class…" value={values.where_met} onChange={update('where_met')} className={inputClass} />
          </Field>
          <Field label="When you met" id="met_on" optional>
            <input id="met_on" type="date" value={values.met_on} onChange={update('met_on')} className={inputClass} />
          </Field>
        </div>

        <fieldset className="rounded-2xl bg-cloud p-4">
          <legend className="sr-only">Staying in touch</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Follow up on" id="follow_up_on" optional>
              <input id="follow_up_on" type="date" value={values.follow_up_on} onChange={update('follow_up_on')} className={inputClass} />
            </Field>
            <Field label="Last talked" id="last_contacted" optional>
              <input id="last_contacted" type="date" value={values.last_contacted} onChange={update('last_contacted')} className={inputClass} />
            </Field>
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" id="email" optional>
            <input id="email" type="email" value={values.email} onChange={update('email')} className={inputClass} />
          </Field>
          <Field label="LinkedIn" id="linkedin_url" optional>
            <input id="linkedin_url" type="url" placeholder="https://linkedin.com/in/…" value={values.linkedin_url} onChange={update('linkedin_url')} className={inputClass} />
          </Field>
        </div>

        <Field label="Notes" id="notes" optional>
          <textarea
            id="notes"
            rows={3}
            placeholder="What you talked about, what they offered to help with…"
            value={values.notes}
            onChange={update('notes')}
            className={`${inputClass} resize-y`}
          />
        </Field>

        {(values.email || values.linkedin_url) && (
          <div className="flex gap-5 text-sm font-semibold">
            {values.email && <a href={`mailto:${values.email}`} className="text-primary hover:underline">Email {values.name.split(' ')[0]}</a>}
            {values.linkedin_url && <a href={values.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open LinkedIn</a>}
          </div>
        )}
      </form>

      {isNew ? (
        <p className="mt-8 rounded-2xl bg-cloud px-4 py-3 text-sm text-muted">
          After you add this contact, you can log conversations and link them to jobs.
        </p>
      ) : (
        <>
          <TouchpointsSection contact={{ ...contact, last_contacted: values.last_contacted || null }} onLogged={handleTouchpointLogged} />
          <JobsSection contact={contact} />
        </>
      )}
    </Drawer>
  )
}
