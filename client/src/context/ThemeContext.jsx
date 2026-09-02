import { createContext, useContext, useCallback, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const KEY = 'callflow_theme'
const ORDER = ['light', 'dark', 'system']

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(theme) {
  return theme === 'dark' || (theme === 'system' && prefersDark())
}

function apply(theme) {
  document.documentElement.classList.toggle('dark', resolve(theme))
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(KEY) || 'system'
    } catch {
      return 'system'
    }
  })

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* ignore */
    }
    apply(next)
  }, [])

  const cycle = useCallback(() => {
    setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])
  }, [theme, setTheme])

  // Keep in sync with OS changes while on "system".
  useEffect(() => {
    apply(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => apply('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const isDark = resolve(theme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
