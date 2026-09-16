import { useState } from 'react'
import { BookOpen, Clock, MapPin, User2, Award, Filter } from 'lucide-react'
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
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5 text-foreground">
            <BookOpen className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Cours</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {loading ? '�' : `${courses.length} mati�re${courses.length > 1 ? 's' : ''} � ${totalCredits} cr�dits`}
            </p>
          </div>
        </div>
        {!loading && types.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {types.map((t) => (
              <Button
                key={t}
                variant={filter === t ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setFilter(t)}
                className="rounded-full"
              >
                {t}
              </Button>
            ))}
          </div>
        )}
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground">Aucun cours pour ce filtre.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  const iconCls = ICON_COLOR[course.couleur] || ICON_COLOR.slate
  const badgeCls = TYPE_BADGE[course.type] || 'bg-muted text-muted-foreground'
  return (
    <Card
      onClick={onClick}
      className="group flex cursor-pointer flex-col shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:hover:border-primary/30"
    >
      <CardContent className="flex flex-1 flex-col pt-5 sm:pt-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className={`rounded-lg p-2 transition-transform duration-200 group-hover:scale-105 ${iconCls}`}>
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <Badge variant="secondary" className={badgeCls}>{course.type}</Badge>
        </div>
        <h3 className="mb-1 font-semibold leading-snug text-foreground group-hover:text-primary">{course.intitule}</h3>
        <p className="mb-3 font-mono text-xs text-muted-foreground">{course.code}</p>
        <div className="mt-auto space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><User2 className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{course.professeur}</span></div>
          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{course.horaire}</span></div>
          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /><span>{course.salle}</span></div>
          <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 shrink-0" /><span>{course.credits} cr�dits</span></div>
        </div>
        <div className="mt-3 flex items-center justify-center rounded-lg bg-muted py-1.5 text-[11px] font-medium text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:bg-primary/15">
          Cliquer pour voir les d�tails
        </div>
      </CardContent>
    </Card>
  )
}
