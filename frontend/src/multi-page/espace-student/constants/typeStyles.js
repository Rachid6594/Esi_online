import { BookOpen, ClipboardList, GraduationCap, FileText } from 'lucide-react'

const NEUTRAL_BADGE = 'bg-muted text-foreground'
const NEUTRAL_ICON = 'bg-muted text-foreground'
const NEUTRAL_EXTENDED = {
  bg: 'bg-muted',
  text: 'text-foreground',
  ring: 'ring-border',
}
const NEUTRAL_TYPE = {
  bg: 'bg-muted',
  text: 'text-foreground',
  border: 'border-border',
  dot: 'bg-foreground',
}
const NEUTRAL_SLOT = 'bg-muted text-foreground border-border'
const NEUTRAL_DASH = 'bg-muted text-foreground'

/* ── Badges par type de cours ── */
export const TYPE_BADGE = {
  'Cours': NEUTRAL_BADGE,
  'Cours+TD': NEUTRAL_BADGE,
  'Cours+TP': NEUTRAL_BADGE,
  'TD': NEUTRAL_BADGE,
  'TP': NEUTRAL_BADGE,
  'Examen': NEUTRAL_BADGE,
}

/* ── Couleurs d'icônes par matière ── */
export const ICON_COLOR = {
  orange: NEUTRAL_ICON,
  blue: NEUTRAL_ICON,
  green: NEUTRAL_ICON,
  purple: NEUTRAL_ICON,
  red: NEUTRAL_ICON,
  slate: NEUTRAL_ICON,
}

/* ── Couleurs avec ring (modal détails) ── */
export const ICON_COLOR_EXTENDED = {
  orange: NEUTRAL_EXTENDED,
  blue: NEUTRAL_EXTENDED,
  green: NEUTRAL_EXTENDED,
  purple: NEUTRAL_EXTENDED,
  red: NEUTRAL_EXTENDED,
  slate: NEUTRAL_EXTENDED,
}

/* ── Config documents ── */
export const TYPE_CONFIG = {
  Cours: { ...NEUTRAL_TYPE, icon: BookOpen },
  TD: { ...NEUTRAL_TYPE, icon: ClipboardList },
  TP: { ...NEUTRAL_TYPE, icon: ClipboardList },
  Examen: { ...NEUTRAL_TYPE, icon: GraduationCap },
}
export const DEFAULT_TYPE_CONFIG = {
  ...NEUTRAL_TYPE,
  dot: 'bg-muted-foreground',
  icon: FileText,
}

/* ── Emploi du temps ── */
export const TYPE_STYLE = {
  Cours: NEUTRAL_SLOT,
  TD: NEUTRAL_SLOT,
  TP: NEUTRAL_SLOT,
  Examen: NEUTRAL_SLOT,
}

/* ── Dashboard ── */
export const DASHBOARD_TYPE_COLORS = {
  Cours: NEUTRAL_DASH,
  TD: NEUTRAL_DASH,
  TP: NEUTRAL_DASH,
  Examen: NEUTRAL_DASH,
}

export const STAT_CARD_COLORS = {
  orange: NEUTRAL_ICON,
  blue: NEUTRAL_ICON,
  green: NEUTRAL_ICON,
}
