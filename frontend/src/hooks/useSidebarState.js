import { useState, useCallback } from 'react'

const STORAGE_KEY = 'esi-online-sidebar-open'

/**
 * État d'ouverture du menu latéral, persisté dans localStorage.
 * @returns {[boolean, () => void]} [open, toggle]
 */
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
      } catch {
        // localStorage indisponible (navigation privee) : on garde l'etat en memoire
      }
      return next
    })
  }, [])

  return [open, toggle]
}
