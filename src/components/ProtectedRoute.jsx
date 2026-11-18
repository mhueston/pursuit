import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps every page that needs a login. If nobody is logged in,
// it sends them to /login instead of showing the page.
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted" role="status">
        Loading your workspace…
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
