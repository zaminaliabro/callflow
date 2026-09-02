import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NotFound() {
  const { user } = useAuth()
  const home = user ? (user.role === 'ADMIN' ? '/admin' : '/agent') : '/login'
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-5xl font-black text-slate-300 dark:text-slate-700">404</p>
        <p className="mt-2 text-slate-600 dark:text-slate-400">This page doesn’t exist.</p>
        <Link to={home} className="btn-primary mt-4">
          Go back
        </Link>
      </div>
    </div>
  )
}
