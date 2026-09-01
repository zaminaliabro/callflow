import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/agents', label: 'Agents', icon: '👥' },
    { to: '/admin/customers', label: 'Customers', icon: '📋' },
    { to: '/admin/calls', label: 'Call Log', icon: '📞' },
  ],
  AGENT: [
    { to: '/agent', label: 'Dashboard', icon: '📊', end: true },
    { to: '/agent/customers', label: 'My Customers', icon: '📋' },
    { to: '/agent/call', label: 'Call Console', icon: '📞' },
  ],
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const links = NAV[user.role] || []

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 px-5 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold">C</span>
          <span className="text-lg font-bold">CallFlow</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4 text-xs text-slate-400">
          Signed in as <span className="font-semibold text-slate-200">{user.name}</span>
          <br />
          {user.role === 'ADMIN' ? 'Administrator' : 'Sales Agent'}
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <button className="btn-ghost btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
