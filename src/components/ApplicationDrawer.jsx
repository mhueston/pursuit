import { EMPTY_APPLICATION, STAGES } from '../lib/applications'
import { toFormValues } from '../lib/db'
import useDrawerForm from '../lib/useDrawerForm'
import Drawer, { closeDrawer } from './Drawer'
import Field, { DrawerButtons, inputClass } from './FormField'
import PeopleSection from './PeopleSection'

/*
  The side panel for adding or editing a job.

  Props:
  - application: the job to edit, or a partial one (like { status: 'applied' }) for a new job
  - onSave(values), onDelete(), onClose()
*/
export default function ApplicationDrawer({ application, onSave, onDelete, onClose }) {
  const isNew = !application?.id
  const form = useDrawerForm(() => toFormValues(application, EMPTY_APPLICATION))
  const { values, update } = form

  return (
    <Drawer
      title={isNew ? 'Add a job' : application.company}
      subtitle={isNew ? null : application.role}
      onClose={onClose}
      footer={
        <DrawerButtons
          formId="application-form"
          isNew={isNew}
          saving={form.saving}
          error={form.error}
          confirmingDelete={form.confirmingDelete}
          onDelete={form.remove(onDelete)}
          onCancel={closeDrawer}
          saveLabel={isNew ? 'Add job' : 'Save changes'}
        />
      }
    >
      <form id="application-form" onSubmit={form.submit(onSave)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" id="company">
            <input id="company" required autoFocus={isNew} value={values.company} onChange={update('company')} className={inputClass} />
          </Field>
          <Field label="Role" id="role">
            <input id="role" required value={values.role} onChange={update('role')} className={inputClass} />
          </Field>
        </div>

        <Field label="Stage" id="status">
          <select id="status" value={values.status} onChange={update('status')} className={inputClass}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Job posting link" id="job_url" optional>
          <input id="job_url" type="url" placeholder="https://" value={values.job_url} onChange={update('job_url')} className={inputClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Location" id="location" optional>
            <input id="location" placeholder="Remote, DC, hybrid…" value={values.location} onChange={update('location')} className={inputClass} />
          </Field>
          <Field label="Salary range" id="salary_range" optional>
            <input id="salary_range" placeholder="$85k to $100k" value={values.salary_range} onChange={update('salary_range')} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Apply by" id="deadline" optional>
            <input id="deadline" type="date" value={values.deadline} onChange={update('deadline')} className={inputClass} />
          </Field>
          <Field label="Date applied" id="date_applied" optional>
            <input id="date_applied" type="date" value={values.date_applied} onChange={update('date_applied')} className={inputClass} />
          </Field>
        </div>

        <fieldset className="rounded-2xl bg-cloud p-4">
          <legend className="sr-only">Next step</legend>
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Field label="Next step" id="next_step" optional>
              <input id="next_step" placeholder="Phone screen with recruiter" value={values.next_step} onChange={update('next_step')} className={inputClass} />
            </Field>
            <Field label="When" id="next_step_date" optional>
              <input id="next_step_date" type="date" value={values.next_step_date} onChange={update('next_step_date')} className={inputClass} />
            </Field>
          </div>
        </fieldset>

        <Field label="Notes" id="notes" optional>
          <textarea id="notes" rows={4} value={values.notes} onChange={update('notes')} className={`${inputClass} resize-y`} />
        </Field>

        {values.job_url && (
          <a href={values.job_url} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-primary hover:underline">
            Open job posting
          </a>
        )}
      </form>

      {/* People can only be linked once the job exists in the database */}
      {isNew ? (
        <p className="mt-8 rounded-2xl bg-cloud px-4 py-3 text-sm text-muted">
          After you add this job, you can link the people you know there.
        </p>
      ) : (
        <PeopleSection application={application} />
      )}
    </Drawer>
  )
}
