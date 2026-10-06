import { useState } from 'react'
import { BookOpen, Clock, MapPin, User2, Award, Filter, Sparkles, ChevronRight } from 'lucide-react'
import useCourses from './hooks/useCourses'
import { TYPE_BADGE, ICON_COLOR } from '../../constants/typeStyles'
import CourseDetailModal from './components/CourseDetailModal'
import CourseReader from './components/CourseReader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function StudentCours() {
  const { courses, loading } = useCourses()
  const [filter, setFilter] = useState('Tous')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [readerCourse, setReaderCourse] = useState(null)

  const types = ['Tous', ...new Set(courses.map((c) => c.type))]
  const filtered = filter === 'Tous' ? courses : courses.filter((c) => c.type === filter)
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0)

  function handleCardClick(course) { setSelectedCourse(course); setModalOpen(true) }
  function handleCloseModal() { setModalOpen(false); setSelectedCourse(null) }
  function handleReadOnline(c) { setModalOpen(false); setReaderCourse(c) }
  function handleCloseReader() { setReaderCourse(null) }

  if (readerCourse) return <CourseReader course={readerCourse} onClose={handleCloseReader} />

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B3A3D] to-[#C45C26] text-white shadow-md shadow-[#8B3A3D]/20">
            <BookOpen className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              Mes Cours & Matières
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {loading ? 'Chargement…' : `${courses.length} matière${courses.length > 1 ? 's' : ''} inscrite${courses.length > 1 ? 's' : ''} — Total ${totalCredits} crédits ECTS`}
            </p>
          </div>
        </div>

        {!loading && types.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
            {types.map((t) => (
              <Button
                key={t}
                variant={filter === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(t)}
                className={`rounded-full text-xs font-semibold h-8 transition-all ${
                  filter === t
                    ? 'bg-gradient-to-r from-[#8B3A3D] to-[#C45C26] text-white border-0 shadow-xs'
                    : 'border-border/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </Button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-border shadow-sm">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">Aucun cours trouvé pour ce filtre.</p>
            <p className="text-xs text-muted-foreground mt-1">Sélectionnez « Tous » pour afficher l'ensemble des matières.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} onClick={() => handleCardClick(course)} />
          ))}
        </div>
      )}

      <CourseDetailModal course={selectedCourse} open={modalOpen} onClose={handleCloseModal} onReadOnline={handleReadOnline} />
    </div>
  )
}

function CourseCard({ course, onClick }) {
  const iconCls = ICON_COLOR[course.couleur] || ICON_COLOR.orange
  const badgeCls = TYPE_BADGE[course.type] || 'bg-muted text-muted-foreground'

  return (
    <Card
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8B3A3D]/40 hover:shadow-xl hover:shadow-[#8B3A3D]/10 card-shine"
    >
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconCls}`}>
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeCls}`}>
            {course.type}
          </span>
        </div>

        <h3 className="mb-1 text-base font-bold leading-snug text-foreground group-hover:text-[#8B3A3D] dark:group-hover:text-rose-300 transition-colors">
          {course.intitule}
        </h3>
        <p className="mb-3 font-mono text-xs font-semibold text-[#C45C26] dark:text-orange-300">
          {course.code}
        </p>

        <div className="mt-auto space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User2 className="h-3.5 w-3.5 text-[#8B3A3D] dark:text-rose-400 shrink-0" />
            <span className="truncate font-medium text-foreground">{course.professeur || 'Enseignant ESI'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{course.horaire || 'Horaire fixé'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{course.salle || 'Amphi / Salle ESI'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <Award className="h-3.5 w-3.5 text-[#C45C26] shrink-0" />
            <span className="font-semibold text-foreground">{course.credits} crédits ECTS</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-xs font-semibold text-[#8B3A3D] dark:text-rose-300 transition group-hover:bg-[#8B3A3D]/10 group-hover:text-[#C45C26]">
          <span>Consulter le programme</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  )
}

