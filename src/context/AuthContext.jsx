import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/*
  AuthContext keeps track of who is logged in and shares that
  with every component. Any component can call useAuth() to get
  the current user, or to log in, sign up, or log out.
*/
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. On first load, check if the user is already logged in.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 2. Listen for future changes: logging in, logging out,
    //    or the session refreshing in the background.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    // 3. Stop listening when the component goes away.
    return () => data.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp: (email, password, fullName) =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    // Save small personal settings (like the weekly goal) on the account itself,
    // so they follow you to any device. No extra table needed.
    updateSettings: (settings) => supabase.auth.updateUser({ data: settings }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
