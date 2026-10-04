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
