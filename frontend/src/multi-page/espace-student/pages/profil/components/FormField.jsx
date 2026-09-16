import { Label } from '@/components/ui/label'

export default function FormField({ label, icon, children }) {
  const Icon = icon
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {label}
      </Label>
      {children}
    </div>
  )
}
