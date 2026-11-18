import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const NAV = [
  { to: '/', label: 'Today', end: true },
  { to: '/applications', label: 'Applications' },
  { to: '/contacts', label: 'Contacts' },
]

// The frame around every logged-in page: a light top bar and the
// current page below it.
export default function AppLayout() {
  const { user, signOut } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3 sm:px-10">
          <Logo />

          <nav aria-label="Main" className="order-last w-full sm:order-none sm:w-auto">
            <ul className="flex gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-ink text-white' : 'text-muted hover:bg-cloud hover:text-ink'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <span className="hidden max-w-48 truncate text-sm text-muted md:block" title={name}>
              {name}
            </span>
            <button onClick={signOut} className="text-sm font-semibold text-primary hover:underline">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-10 sm:py-14">
        <Outlet />
      </main>
    </div>
  )
}
