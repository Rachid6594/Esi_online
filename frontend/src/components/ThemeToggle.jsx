import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Bouton pour basculer entre mode clair / sombre / système.
 * À placer dans un layout (header, sidebar, etc.).
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Changer le thème"
        className="rounded-lg p-2 text-esi-muted hover:bg-esi-primary-light hover:text-esi-primary dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <span className="h-5 w-5 block" />
      </button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="rounded-lg p-2 text-esi-muted hover:bg-esi-primary-light hover:text-esi-primary dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}

/**
 * Sélecteur avec 3 options : Clair, Sombre, Système
 */
export function ThemeSelect() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="rounded-lg border border-esi-border bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-esi-primary"
      aria-label="Choisir le thème"
    >
      <option value="system">Système</option>
      <option value="light">Clair</option>
      <option value="dark">Sombre</option>
    </select>
  )
}
