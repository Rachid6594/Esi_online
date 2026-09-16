import { BookOpen, FileText, Calendar, User } from 'lucide-react'

export const JOURS_SEMAINE = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
export const TODAY = JOURS_SEMAINE[new Date().getDay()]

export const QUICK_LINKS = [
  { title: 'Cours',           desc: 'Vos matières du semestre', icon: BookOpen, to: '/home/cours',           cls: 'bg-muted text-foreground' },
  { title: 'Documents',       desc: 'Cours, TD, TP, Examens',   icon: FileText, to: '/home/documents',       cls: 'bg-muted text-foreground' },
  { title: 'Emploi du temps', desc: 'Planning hebdomadaire',    icon: Calendar, to: '/home/emploi-du-temps', cls: 'bg-muted text-foreground' },
  { title: 'Mon profil',      desc: 'Mes informations',         icon: User,     to: '/home/profil',          cls: 'bg-muted text-foreground' },
]
