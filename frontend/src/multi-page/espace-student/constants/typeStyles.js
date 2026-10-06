import {
  BookOpen,
  ClipboardList,
  FileCheck,
  FileText,
  FlaskConical,
  GraduationCap,
  ListChecks,
  Megaphone,
  NotebookPen,
  Shapes,
} from 'lucide-react'

/* ── Badges par type de cours ── */
export const TYPE_BADGE = {
  'Cours': 'bg-[#8B3A3D]/10 text-[#8B3A3D] dark:bg-[#8B3A3D]/25 dark:text-rose-300 border border-[#8B3A3D]/20',
  'Cours+TD': 'bg-[#C45C26]/10 text-[#C45C26] dark:bg-[#C45C26]/25 dark:text-orange-300 border border-[#C45C26]/20',
  'Cours+TP': 'bg-blue-500/10 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-500/20',
  'TD': 'bg-amber-500/10 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-500/20',
  'TP': 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-500/20',
  'Examen': 'bg-rose-500/10 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-500/20',
}

/* ── Couleurs d'icônes par matière ── */
export const ICON_COLOR = {
  orange: 'bg-[#C45C26]/15 text-[#C45C26] dark:bg-[#C45C26]/30 dark:text-orange-300',
  bordeaux: 'bg-[#8B3A3D]/15 text-[#8B3A3D] dark:bg-[#8B3A3D]/30 dark:text-rose-300',
  blue: 'bg-blue-500/15 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  purple: 'bg-purple-500/15 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  red: 'bg-[#8B3A3D]/15 text-[#8B3A3D] dark:bg-[#8B3A3D]/30 dark:text-rose-400',
  slate: 'bg-slate-500/15 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

/* ── Couleurs avec ring (modal détails) ── */
export const ICON_COLOR_EXTENDED = {
  orange: {
    bg: 'bg-[#C45C26]/15 dark:bg-[#C45C26]/30',
    text: 'text-[#C45C26] dark:text-orange-300',
    ring: 'ring-[#C45C26]/30',
  },
  bordeaux: {
    bg: 'bg-[#8B3A3D]/15 dark:bg-[#8B3A3D]/30',
    text: 'text-[#8B3A3D] dark:text-rose-300',
    ring: 'ring-[#8B3A3D]/30',
  },
  blue: {
    bg: 'bg-blue-500/15 dark:bg-blue-950/50',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/30',
  },
  green: {
    bg: 'bg-emerald-500/15 dark:bg-emerald-950/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/30',
  },
  purple: {
    bg: 'bg-purple-500/15 dark:bg-purple-950/50',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/30',
  },
  red: {
    bg: 'bg-[#8B3A3D]/15 dark:bg-[#8B3A3D]/30',
    text: 'text-[#8B3A3D] dark:text-rose-400',
    ring: 'ring-[#8B3A3D]/30',
  },
  slate: {
    bg: 'bg-slate-500/15 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    ring: 'ring-slate-500/30',
  },
}

/* ── Config documents ── */
export const TYPE_CONFIG = {
  Cours: {
    bg: 'bg-[#8B3A3D]/10 dark:bg-[#8B3A3D]/20',
    text: 'text-[#8B3A3D] dark:text-rose-300',
    border: 'border-[#8B3A3D]/25',
    dot: 'bg-[#8B3A3D]',
    icon: BookOpen,
  },
  TD: {
    bg: 'bg-[#C45C26]/10 dark:bg-[#C45C26]/20',
    text: 'text-[#C45C26] dark:text-orange-300',
    border: 'border-[#C45C26]/25',
    dot: 'bg-[#C45C26]',
    icon: ClipboardList,
  },
  TP: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-500',
    icon: FlaskConical,
  },
  Devoir: {
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/25',
    dot: 'bg-amber-500',
    icon: NotebookPen,
  },
  Examen: {
    bg: 'bg-rose-500/10 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/25',
    dot: 'bg-rose-500',
    icon: GraduationCap,
  },
  Rapport: {
    bg: 'bg-purple-500/10 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/25',
    dot: 'bg-purple-500',
    icon: FileCheck,
  },
  Exercice: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-500/25',
    dot: 'bg-indigo-500',
    icon: ListChecks,
  },
  Annonce: {
    bg: 'bg-[#C45C26]/10 dark:bg-[#C45C26]/20',
    text: 'text-[#C45C26] dark:text-orange-300',
    border: 'border-[#C45C26]/25',
    dot: 'bg-[#C45C26]',
    icon: Megaphone,
  },
  Document: {
    bg: 'bg-slate-500/10 dark:bg-slate-800/40',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-400/20',
    dot: 'bg-slate-500',
    icon: FileText,
  },
  Autre: {
    bg: 'bg-muted',
    text: 'text-foreground',
    border: 'border-border',
    dot: 'bg-foreground',
    icon: Shapes,
  },
}

export const DEFAULT_TYPE_CONFIG = {
  bg: 'bg-slate-500/10 dark:bg-slate-800/40',
  text: 'text-slate-700 dark:text-slate-300',
  border: 'border-slate-400/20',
  dot: 'bg-slate-500',
  icon: FileText,
}

/* ── Emploi du temps ── */
export const TYPE_STYLE = {
  Cours: 'bg-[#8B3A3D]/10 text-[#8B3A3D] dark:bg-[#8B3A3D]/25 dark:text-rose-300 border-[#8B3A3D]/30',
  TD: 'bg-[#C45C26]/10 text-[#C45C26] dark:bg-[#C45C26]/25 dark:text-orange-300 border-[#C45C26]/30',
  TP: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/30',
  Examen: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-500/30',
}

/* ── Dashboard ── */
export const DASHBOARD_TYPE_COLORS = {
  Cours: 'bg-[#8B3A3D]/15 text-[#8B3A3D] dark:text-rose-300',
  TD: 'bg-[#C45C26]/15 text-[#C45C26] dark:text-orange-300',
  TP: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Examen: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
}

export const STAT_CARD_COLORS = {
  orange: 'bg-[#C45C26]/15 text-[#C45C26] dark:bg-[#C45C26]/25 dark:text-orange-300',
  bordeaux: 'bg-[#8B3A3D]/15 text-[#8B3A3D] dark:bg-[#8B3A3D]/25 dark:text-rose-300',
  blue: 'bg-[#8B3A3D]/15 text-[#8B3A3D] dark:bg-[#8B3A3D]/25 dark:text-rose-300',
  green: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300',
}

