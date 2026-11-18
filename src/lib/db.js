// Small helpers shared by every file that talks to Supabase.

// Supabase returns { data, error }. This throws the error so pages can
// catch it with try/catch, and otherwise hands back the data.
export function check({ data, error }) {
  if (error) throw error
  return data
}

// Keep only the columns we allow the app to write, and turn empty
// strings from forms into null (so a blank date means "no date").
export function pick(values, fields) {
  const row = {}
  for (const key of fields) {
    if (key in values) row[key] = values[key] === '' ? null : values[key]
  }
  return row
}

// The database uses null for "empty"; form inputs need empty strings.
export function toFormValues(record, empty) {
  const values = { ...empty }
  for (const key of Object.keys(values)) {
    if (record?.[key] != null) values[key] = record[key]
  }
  return values
}
