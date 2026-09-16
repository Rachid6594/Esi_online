import { useState, useCallback } from 'react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SidebarCloseButton({ onClick, className = '' }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Replier le menu"
      className={className}
    >
      <PanelLeftClose className="h-5 w-5" strokeWidth={1.5} />
    </Button>
  )
}

export function SidebarOpenButton({ onClick, className = '' }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Afficher le menu"
      className={className}
    >
      <PanelLeft className="h-5 w-5" strokeWidth={1.5} />
    </Button>
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
