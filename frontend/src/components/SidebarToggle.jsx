import { useState, useCallback } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'

/**
 * Bouton pour replier la sidebar (à placer dans le header de la sidebar).
 */
export function SidebarCloseButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Replier le menu"
      className={`rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white ${className}`}
    >
      <PanelLeftClose className="h-5 w-5" strokeWidth={1.5} />
    </button>
  )
}

/**
 * Bouton pour afficher la sidebar (à placer dans la zone contenu quand la sidebar est repliée).
 */
export function SidebarOpenButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Afficher le menu"
      className={`rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white ${className}`}
    >
      <PanelLeft className="h-5 w-5" strokeWidth={1.5} />
    </button>
  )
}

const STORAGE_KEY = 'esi-online-sidebar-open'

export function useSidebarState() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(STORAGE_KEY) !== 'false'
  })

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch (_) {}
      return next
    })
  }, [])

  return [open, toggle]
}
