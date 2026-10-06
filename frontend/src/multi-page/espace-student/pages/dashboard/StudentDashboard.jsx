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
        <Skeleton key={i} className="h-14 rounded-xl" />
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white shadow-md shadow-[#8B3A3D]/20">
            <GraduationCap className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Bienvenue dans votre espace, <span className="font-bold text-[#8B3A3D] dark:text-rose-300">{userName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Matières inscrites"
          value={loading ? '—' : String(courses.length)}
          icon={BookOpen}
          color="bordeaux"
        />
        <StatCard
          label="Notifications non lues"
          value={loading ? '—' : String(unread.length)}
          icon={Bell}
          color="orange"
        />
        <StatCard
          label="Séances aujourd'hui"
          value={loading ? '—' : String(todaySlots.length)}
          icon={Calendar}
          color="green"
        />
      </div>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Timetable of the day */}
        <Card className="border border-border/80 shadow-sm lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 pb-3.5">
            <CardTitle className="flex items-center justify-between text-sm sm:text-base font-bold text-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-[#8B3A3D] dark:text-rose-400" strokeWidth={1.75} />
                Programme du jour — <span className="text-[#C45C26]">{TODAY}</span>
              </span>
              <Link to="/home/emploi-du-temps" className="text-xs font-semibold text-[#8B3A3D] dark:text-rose-300 hover:text-[#C45C26] hover:underline">
                Voir la semaine →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <SkeletonList rows={3} />
            ) : todaySlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
                <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600 mb-2">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="font-semibold text-foreground">Aucune séance aujourd'hui</p>
                <p className="text-xs text-muted-foreground mt-0.5">Profitez de votre journée pour réviser ou consulter les documents !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySlots.map((slot) => (
                  <TimetableRow key={slot.id} slot={slot} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications list */}
        <Card className="border border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-bold text-foreground">
                <Bell className="h-4.5 w-4.5 text-[#C45C26]" strokeWidth={1.75} />
                <span>Annonces & Notifs</span>
              </CardTitle>
              {unread.length > 0 && (
                <Badge className="bg-[#C45C26] text-white border-0 font-bold px-2 py-0.5 text-xs">
                  {unread.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <SkeletonList rows={3} />
            ) : unread.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center text-sm text-muted-foreground">
                <CheckCircle className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-xs">Toutes les annonces sont à jour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unread.slice(0, 4).map((n) => (
                  <NotifCard key={n.id} notif={n} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Links ── */}
      <div>
        <h2 className="mb-4 text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <span>Accès rapide aux services</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.to} to={link.to} className="group block">
                <Card className="h-full border border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#8B3A3D]/40 hover:shadow-lg hover:shadow-[#8B3A3D]/10">
                  <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B3A3D]/10 to-[#C45C26]/15 text-[#8B3A3D] dark:text-orange-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground group-hover:text-[#8B3A3D] dark:group-hover:text-rose-300 transition-colors">
                        {link.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-1 group-hover:text-[#C45C26] transition-all" />
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

