import { createContext, useContext, useCallback, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const KEY = 'callflow_theme'

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      /* ignore */
    }
    return prefersDark() ? 'dark' : 'light'
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
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  useEffect(() => {
    apply(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle, isDark: theme === 'dark' }}>
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
