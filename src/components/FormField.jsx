// Shared form pieces so every form in the app looks and behaves the same.

export const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-primary'

export const smallInputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary'

export default function Field({ label, id, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
    </div>
  )
}

// The row of buttons at the bottom of a drawer: Delete (with a
// second "Yes, delete it" click), Cancel, and Save.
export function DrawerButtons({ formId, isNew, saving, confirmingDelete, onDelete, onCancel, saveLabel, error }) {
  return (
    <>
      {error && (
        <p className="w-full text-sm text-coral" role="alert">
          {error}
        </p>
      )}

      {!isNew && (
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
            confirmingDelete ? 'bg-coral text-white' : 'text-coral hover:bg-coral/10'
          }`}
        >
          {confirmingDelete ? 'Yes, delete it' : 'Delete'}
        </button>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="ml-auto rounded-full px-5 py-2.5 text-sm font-semibold text-muted hover:bg-cloud hover:text-ink"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={formId}
        disabled={saving}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {saving ? 'Saving…' : saveLabel}
      </button>
    </>
  )
}
