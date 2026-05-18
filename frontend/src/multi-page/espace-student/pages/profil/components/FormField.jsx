export default function FormField({ label, icon, children }) {
  const Icon = icon
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />{label}
      </label>
      {children}
    </div>
  )
}
