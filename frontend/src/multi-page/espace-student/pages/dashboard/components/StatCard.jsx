import { STAT_CARD_COLORS } from '../../../constants/typeStyles'

export default function StatCard({ label, value, icon, color }) {
  const Icon = icon
  const cls = STAT_CARD_COLORS[color] || STAT_CARD_COLORS.blue
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-600 dark:bg-gray-800">
      <div className={`rounded-lg p-2.5 ${cls}`}><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
      <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p></div>
    </div>
  )
}
