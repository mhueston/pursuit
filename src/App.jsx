import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import AuthPage from './pages/AuthPage'
import TodayPage from './pages/TodayPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ContactsPage from './pages/ContactsPage'
import SetupNeeded from './pages/SetupNeeded'

// The map of the app: which URL shows which page.
export default function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          {/* Everything inside here requires a login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<TodayPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
