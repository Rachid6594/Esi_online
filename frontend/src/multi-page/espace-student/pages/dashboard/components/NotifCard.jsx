export default function NotifCard({ notif }) {
  const dot = { info: 'bg-blue-500', warning: 'bg-amber-500', success: 'bg-green-500' }
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-700/50">
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[notif.type] || 'bg-slate-400'}`} />
        <div className="min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white">{notif.titre}</p><p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{notif.message}</p><p className="mt-1 text-xs text-slate-400">{notif.date}</p></div>
      </div>
    </div>
  )
}
