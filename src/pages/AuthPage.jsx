import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { BellIcon, BriefcaseIcon, PeopleIcon } from '../components/Icons'

// The three things Pursuit does, shown as soft tiles under the headline.
const FEATURES = [
  { Icon: BriefcaseIcon, color: 'text-saved', text: 'Track every application, from saved to signed' },
  { Icon: PeopleIcon, color: 'text-applied', text: 'Remember who you met and where' },
  { Icon: BellIcon, color: 'text-interviewing', text: 'Know exactly when to follow up' },
]

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in? Skip straight to the app.
  if (user) return <Navigate to="/" replace />

  const isSignup = mode === 'signup'

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)

    const { data, error } = isSignup
      ? await signUp(form.email, form.password, form.name)
      : await signIn(form.email, form.password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else if (isSignup && !data.session) {
      // Supabase asks new users to confirm their email by default.
      setNotice(`We sent a confirmation link to ${form.email}. Open it, then log in here.`)
      setMode('login')
    }
    // On a successful login, AuthContext updates and the
    // <Navigate> above sends the user into the app.
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-10">
      <Logo />

      <div className="mt-14 grid gap-12 lg:mt-24 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-16">
        {/* Left: the pitch */}
        <section>
          <h1 className="max-w-[13ch] text-5xl leading-[1.02] font-bold sm:text-6xl xl:text-7xl">
            Every job, every person, one place.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Track where you applied, who you know there, and when to follow up. Your next role is closer than it feels.
          </p>

          <ul className="mt-12 hidden gap-3 sm:grid sm:grid-cols-3">
            {FEATURES.map(({ Icon, color, text }) => (
              <li key={text} className="flex aspect-square flex-col justify-between rounded-3xl bg-cloud p-5">
                <Icon className={color} />
                <p className="text-sm leading-snug font-medium">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Right: the form */}
        <section className="rounded-3xl bg-cloud p-7 sm:p-10">
          <h2 className="text-3xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="mt-2 text-muted">
            {isSignup ? 'Free, and your data stays private to you.' : 'Log in to pick up where you left off.'}
          </p>

          {notice && (
            <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm" role="status">
              {notice}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isSignup && (
              <Field label="Your name" id="name">
                <input id="name" required autoComplete="name" value={form.name} onChange={update('name')} className={inputClass} />
              </Field>
            )}
            <Field label="Email" id="email">
              <input id="email" type="email" required autoComplete="email" value={form.email} onChange={update('email')} className={inputClass} />
            </Field>
            <Field label="Password" id="password" hint={isSignup ? 'At least 8 characters.' : null}>
              <input
                id="password"
                type="password"
                required
                minLength={isSignup ? 8 : undefined}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={update('password')}
                className={inputClass}
              />
            </Field>

            {error && (
              <p className="text-sm text-coral" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primary px-5 py-3.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'One moment…' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isSignup ? 'Already have an account?' : 'New to Pursuit?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? 'login' : 'signup')
                setError('')
              }}
              className="font-semibold text-primary hover:underline"
            >
              {isSignup ? 'Log in' : 'Create an account'}
            </button>
          </p>
        </section>
      </div>
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-primary'

function Field({ label, id, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}
