import { ChevronDown } from 'lucide-react'

export default function FilterSelect({ id, label, icon: Icon, value, onChange, options, placeholder }) {
  return (
    <div className="relative min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"><Icon className="h-3 w-3" strokeWidth={2} />{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-esi-primary focus:ring-2 focus:ring-esi-primary/20 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:border-gray-500 dark:focus:border-esi-primary">
          <option value="">{placeholder}</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}
