import { createClient } from '@supabase/supabase-js'

// These come from your .env file (see .env.example).
// Vite only exposes variables that start with VITE_ to the browser.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Lets the app show a friendly setup screen instead of crashing
// when the keys haven't been added yet.
export const isSupabaseConfigured = Boolean(url && key)

// One shared client for the whole app. Every database call and
// login goes through this.
export const supabase = isSupabaseConfigured ? createClient(url, key) : null
