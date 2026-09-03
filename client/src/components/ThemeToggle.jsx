import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle({ className = '' }) {
  const { isDark, cycle } = useTheme()
  return (
    <button
      onClick={cycle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-base
        hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${className}`}
    >
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
    </button>
  )
}
