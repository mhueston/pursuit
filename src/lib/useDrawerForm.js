import { useState } from 'react'

/*
  A custom React hook that holds the state every edit panel needs:
  the form values, saving status, errors, and the two-click delete.
  Both the job panel and the contact panel use it, so they behave the same.
*/
export default function useDrawerForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // update('company') returns an onChange handler for the company input
  function update(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  }

  // Runs a save or delete, showing "Saving…" and catching errors.
  async function run(action, fallbackMessage) {
    setSaving(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.message || fallbackMessage)
      setSaving(false)
    }
  }

  function submit(onSave) {
    return (e) => {
      e.preventDefault()
      run(() => onSave(values), 'Could not save. Check your connection and try again.')
    }
  }

  function remove(onDelete) {
    return () => {
      if (!confirmingDelete) return setConfirmingDelete(true)
      run(onDelete, 'Could not delete. Try again.')
    }
  }

  return { values, setValues, update, saving, error, confirmingDelete, submit, remove }
}
