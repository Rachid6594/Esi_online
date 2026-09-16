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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function SkeletonList({ rows }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  )
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
        <div className="hidden rounded-xl bg-muted p-2.5 text-foreground sm:block">
          <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Bienvenue, <span className="font-medium text-foreground">{userName}</span>
          </p>
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Matières" value={loading ? '—' : String(courses.length)} icon={BookOpen} color="orange" />
        <StatCard label="Notifications non lues" value={loading ? '—' : String(unread.length)} icon={Bell} color="blue" />
        <StatCard label="Séances aujourd'hui" value={loading ? '—' : String(todaySlots.length)} icon={Calendar} color="green" />
      </div>
      <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" strokeWidth={1.5} />
              Programme du jour — {TODAY}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonList rows={3} />
            ) : todaySlots.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Aucune séance programmée aujourd'hui. Bonne journée !
              </div>
            ) : (
              <div className="space-y-3">{todaySlots.map((slot) => <TimetableRow key={slot.id} slot={slot} />)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5 text-primary" strokeWidth={1.5} />
                Notifications
              </CardTitle>
              {unread.length > 0 && <Badge>{unread.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonList rows={3} />
            ) : unread.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Aucune notification non lue.
              </div>
            ) : (
              <div className="space-y-3">{unread.slice(0, 4).map((n) => <NotifCard key={n.id} notif={n} />)}</div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">Accès rapide</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.to} to={link.to}>
                <Card className="h-full shadow-sm transition hover:border-primary/40 hover:shadow-md dark:hover:border-primary/50">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className={`shrink-0 rounded-lg p-2.5 ${link.cls}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{link.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
