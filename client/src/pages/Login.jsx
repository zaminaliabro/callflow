import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiError } from '../api/client.js'
import { Field, TextInput, PasswordInput } from '../components/Field.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/agent'} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const u = await login(email.trim(), password)
      const dest = location.state?.from?.pathname
      navigate(dest || (u.role === 'ADMIN' ? '/admin' : '/agent'), { replace: true })
    } catch (err) {
      setError(apiError(err, 'Login failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            C
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">CallFlow</span>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sign in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sales Call Management System</p>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <Field label="Email">
            <TextInput
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <PasswordInput
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Seeded demo: admin@callflow.test / admin123 · hamza@callflow.test / agent123
          </p>
        </form>
      </div>
    </div>
  )
}
