export default function InfoRow({ icon, label, value }) {
  const Icon = icon
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
      <div className="flex flex-1 items-baseline justify-between gap-4 border-b border-border pb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}
