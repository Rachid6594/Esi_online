import { useState } from 'react'
import { BookOpen, Clock, MapPin, User2, Award, Filter } from 'lucide-react'
import useCourses from './hooks/useCourses'
import { TYPE_BADGE, ICON_COLOR } from '../../constants/typeStyles'
import CourseDetailModal from './components/CourseDetailModal'
import CourseReader from './components/CourseReader'

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
          <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)] dark:bg-gray-700 dark:text-orange-400"><BookOpen className="h-7 w-7" strokeWidth={1.5} /></div>
          <div><h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">Cours</h1><p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">{loading ? '…' : `${courses.length} matière${courses.length > 1 ? 's' : ''} · ${totalCredits} crédits`}</p></div>
        </div>
        {!loading && types.length > 1 && (
          <div className="flex flex-wrap items-center gap-2"><Filter className="h-4 w-4 text-slate-400" />{types.map((t) => <button key={t} onClick={() => setFilter(t)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${filter === t ? 'bg-esi-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600'}`}>{t}</button>)}</div>
        )}
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-100 dark:bg-gray-700" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800"><BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-slate-500 dark:text-slate-400">Aucun cours pour ce filtre.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((course) => <CourseCard key={course.id} course={course} onClick={() => handleCardClick(course)} />)}</div>
      )}
      <CourseDetailModal course={selectedCourse} open={modalOpen} onClose={handleCloseModal} onReadOnline={handleReadOnline} />
    </div>
  )
}

function CourseCard({ course, onClick }) {
  const iconCls = ICON_COLOR[course.couleur] || ICON_COLOR.slate
  const badgeCls = TYPE_BADGE[course.type] || 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
  return (
    <div onClick={onClick} className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-esi-primary/30 hover:shadow-lg hover:shadow-esi-primary/5 sm:p-5 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-esi-primary/30">
      <div className="mb-3 flex items-start justify-between gap-2"><div className={`rounded-lg p-2 transition-transform duration-200 group-hover:scale-105 ${iconCls}`}><BookOpen className="h-5 w-5" strokeWidth={1.5} /></div><span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badgeCls}`}>{course.type}</span></div>
      <h3 className="mb-1 font-semibold leading-snug text-slate-900 group-hover:text-esi-primary dark:text-white dark:group-hover:text-esi-primary">{course.intitule}</h3>
      <p className="mb-3 font-mono text-xs text-slate-400">{course.code}</p>
      <div className="mt-auto space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5"><User2 className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{course.professeur}</span></div>
        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" /><span>{course.horaire}</span></div>
        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /><span>{course.salle}</span></div>
        <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 shrink-0" /><span>{course.credits} crédits</span></div>
      </div>
      <div className="mt-3 flex items-center justify-center rounded-lg bg-slate-50 py-1.5 text-[11px] font-medium text-slate-400 transition group-hover:bg-esi-primary/10 group-hover:text-esi-primary dark:bg-gray-700/50 dark:group-hover:bg-esi-primary/15">Cliquer pour voir les détails</div>
    </div>
  )
}
