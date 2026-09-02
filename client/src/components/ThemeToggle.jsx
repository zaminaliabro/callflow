import { useTheme } from '../context/ThemeContext.jsx'

const META = {
  light: { icon: '☀️', label: 'Light' },
  dark: { icon: '🌙', label: 'Dark' },
  system: { icon: '🖥️', label: 'System' },
}

export default function ThemeToggle({ className = '' }) {
  const { theme, cycle } = useTheme()
  const { icon, label } = META[theme]
  return (
    <button
      onClick={cycle}
      title={`Theme: ${label} (click to change)`}
      aria-label={`Theme: ${label}. Click to change.`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-base
        hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
