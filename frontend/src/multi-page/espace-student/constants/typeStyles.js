import { BookOpen, ClipboardList, GraduationCap, FileText } from 'lucide-react'

/* ── Badges par type de cours ── */
export const TYPE_BADGE = {
  'Cours':    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Cours+TD': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Cours+TP': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'TD':       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'TP':       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Examen':   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

/* ── Couleurs d'icônes par matière ── */
export const ICON_COLOR = {
  orange: 'bg-[var(--color-esi-orange-light)] text-[var(--color-esi-orange)]',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  green:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  slate:  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

/* ── Couleurs avec ring (modal détails) ── */
export const ICON_COLOR_EXTENDED = {
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-800' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/40',     text: 'text-blue-600 dark:text-blue-400',     ring: 'ring-blue-200 dark:ring-blue-800' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/40',  text: 'text-purple-600 dark:text-purple-400',  ring: 'ring-purple-200 dark:ring-purple-800' },
  red:    { bg: 'bg-red-50 dark:bg-red-950/40',        text: 'text-red-600 dark:text-red-400',        ring: 'ring-red-200 dark:ring-red-800' },
  slate:  { bg: 'bg-slate-50 dark:bg-gray-700',        text: 'text-slate-600 dark:text-slate-300',    ring: 'ring-slate-200 dark:ring-gray-600' },
}

/* ── Config documents ── */
export const TYPE_CONFIG = {
  Cours:  { bg: 'bg-blue-50 dark:bg-blue-950/40',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800',    dot: 'bg-blue-500',    icon: BookOpen },
  TD:     { bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800',   dot: 'bg-amber-500',   icon: ClipboardList },
  TP:     { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', icon: ClipboardList },
  Examen: { bg: 'bg-red-50 dark:bg-red-950/40',      text: 'text-red-700 dark:text-red-300',      border: 'border-red-200 dark:border-red-800',      dot: 'bg-red-500',     icon: GraduationCap },
}
export const DEFAULT_TYPE_CONFIG = { bg: 'bg-slate-50 dark:bg-gray-700', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-gray-600', dot: 'bg-slate-400', icon: FileText }

/* ── Emploi du temps ── */
export const TYPE_STYLE = {
  Cours:  'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800/50',
  TD:     'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/50',
  TP:     'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/50',
  Examen: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800/50',
}

/* ── Dashboard ── */
export const DASHBOARD_TYPE_COLORS = {
  Cours:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  TD:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  TP:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Examen: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export const STAT_CARD_COLORS = {
  orange: 'bg-[var(--color-esi-orange-light)] text-[var(--color-esi-orange)] dark:bg-orange-900/30 dark:text-orange-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}
