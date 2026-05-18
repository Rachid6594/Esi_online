export default function InfoRow({ icon, label, value }) {
  const Icon = icon
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.5} />
      <div className="flex flex-1 items-baseline justify-between gap-4 border-b border-slate-100 pb-3 dark:border-gray-700">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
      </div>
    </div>
  )
}
