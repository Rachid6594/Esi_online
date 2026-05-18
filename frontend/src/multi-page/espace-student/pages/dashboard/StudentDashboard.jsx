import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, ChevronRight, Bell, Clock, Calendar, CheckCircle } from 'lucide-react'
import { getAuth } from '../../../../auth'
import { TODAY, QUICK_LINKS } from '../../constants/navigation'
import useNotifications from '../layout/hooks/useNotifications'
import useCourses from '../cours/hooks/useCourses'
import useTimetable from '../emploi-du-temps/hooks/useTimetable'
import StatCard from './components/StatCard'
import TimetableRow from './components/TimetableRow'
import NotifCard from './components/NotifCard'

function Skeleton({ rows }) {
  return (<div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-gray-700" />)}</div>)
}

export default function StudentDashboard() {
  const auth = getAuth()
  const userName = auth?.user?.first_name || auth?.user?.email?.split('@')[0] || 'Étudiant'
  const { courses, loading: cL } = useCourses()
  const { unread, loading: nL } = useNotifications()
  const { slots: timetable, loading: tL } = useTimetable()
  const loading = cL || nL || tL
  const todaySlots = timetable.filter((s) => s.jour === TODAY).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <div className="hidden rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] sm:block dark:bg-gray-700 dark:text-orange-400"><GraduationCap className="h-7 w-7" strokeWidth={1.5} /></div>
        <div><h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">Tableau de bord</h1><p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">Bienvenue, <span className="font-medium text-slate-800 dark:text-slate-100">{userName}</span></p></div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Matières" value={loading ? '—' : String(courses.length)} icon={BookOpen} color="orange" />
        <StatCard label="Notifications non lues" value={loading ? '—' : String(unread.length)} icon={Bell} color="blue" />
        <StatCard label="Séances aujourd'hui" value={loading ? '—' : String(todaySlots.length)} icon={Calendar} color="green" />
      </div>
      <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-600 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white"><Clock className="h-5 w-5 text-esi-primary" strokeWidth={1.5} />Programme du jour — {TODAY}</h2>
          {loading ? <Skeleton rows={3} /> : todaySlots.length === 0 ? <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CheckCircle className="h-4 w-4 text-green-500" />Aucune séance programmée aujourd'hui. Bonne journée !</div> : <div className="space-y-3">{todaySlots.map((slot) => <TimetableRow key={slot.id} slot={slot} />)}</div>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-600 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white"><Bell className="h-5 w-5 text-esi-primary" strokeWidth={1.5} />Notifications</h2>{unread.length > 0 && <span className="rounded-full bg-esi-primary px-2 py-0.5 text-xs font-bold text-white">{unread.length}</span>}</div>
          {loading ? <Skeleton rows={3} /> : unread.length === 0 ? <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CheckCircle className="h-4 w-4 text-green-500" />Aucune notification non lue.</div> : <div className="space-y-3">{unread.slice(0, 4).map((n) => <NotifCard key={n.id} notif={n} />)}</div>}
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Accès rapide</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => { const Icon = link.icon; return (<Link key={link.to} to={link.to} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-esi-primary/40 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-esi-primary/50"><div className={`shrink-0 rounded-lg p-2.5 ${link.cls}`}><Icon className="h-5 w-5" strokeWidth={1.5} /></div><div className="min-w-0 flex-1"><p className="font-medium text-slate-900 dark:text-white">{link.title}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{link.desc}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" /></Link>) })}
        </div>
      </div>
    </div>
  )
}
