import { useState, useEffect } from 'react'
import { X, BookOpen, Download, Eye, Clock, MapPin, User2, Award, Loader2, Target, ChevronRight, Layers } from 'lucide-react'
import { getCourseDetail } from '../../../api/services/coursesService'
import { ICON_COLOR_EXTENDED, TYPE_BADGE } from '../../../constants/typeStyles'

export default function CourseDetailModal({ course, open, onClose, onReadOnline }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!open || !course) return
    setLoading(true); setDetail(null)
    getCourseDetail(course.id).then((data) => data && setDetail(data)).catch(console.error).finally(() => setLoading(false))
  }, [open, course])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  if (!open || !course) return null
  const color = ICON_COLOR_EXTENDED[course.couleur] || ICON_COLOR_EXTENDED.slate
  const badgeCls = TYPE_BADGE[course.type] || 'bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-slate-300'
  const chapitres = detail?.chapitres || []
  const totalSections = chapitres.reduce((sum, ch) => sum + (ch.sections?.length || 0), 0)

  async function handleDownload() {
    setDownloading(true)
    try {
      const lines = [`═══════════════════════════════════════`, `  ${course.intitule}`, `  Code : ${course.code}`, `  Professeur : ${course.professeur}`, `  Crédits : ${course.credits}`, `═══════════════════════════════════════`, '']
      if (detail?.description) lines.push(detail.description, '')
      if (detail?.chapitres) {
        detail.chapitres.forEach((ch, ci) => {
          lines.push(`\n${'─'.repeat(40)}`, `Chapitre ${ci + 1} : ${ch.titre}`, `${'─'.repeat(40)}\n`)
          ch.sections?.forEach((s, si) => { lines.push(`  ${ci + 1}.${si + 1} ${s.titre}`, '', s.contenu.replace(/\\n/g, '\n').split('\n').map((l) => `    ${l}`).join('\n'), '') })
        })
      }
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url
      a.download = `${course.code}_${course.intitule.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.txt`
      a.click(); URL.revokeObjectURL(url)
    } finally { setDownloading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-full w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200/60 bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl dark:border-gray-700/60 dark:bg-gray-800">
        <div className={`relative px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6 ${color.bg}`}>
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
          <div className="flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ring-1 sm:p-3 ${color.bg} ${color.ring}`}><BookOpen className={`h-6 w-6 sm:h-7 sm:w-7 ${color.text}`} strokeWidth={1.5} /></div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-md bg-white/60 px-2 py-0.5 font-mono text-xs font-medium text-slate-600 dark:bg-black/20 dark:text-slate-300">{course.code}</span><span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badgeCls}`}>{course.type}</span></div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl dark:text-white">{course.intitule}</h2>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12"><Loader2 className="h-8 w-8 animate-spin text-esi-primary" /><p className="text-sm text-slate-500">Chargement des détails…</p></div>
          ) : (<>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoChip icon={User2} label="Professeur" value={course.professeur} /><InfoChip icon={Clock} label="Horaire" value={course.horaire} />
              <InfoChip icon={MapPin} label="Salle" value={course.salle} /><InfoChip icon={Award} label="Crédits" value={`${course.credits} crédits`} />
            </div>
            {detail?.description && <div className="mb-5"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><BookOpen className="h-4 w-4 opacity-50" />Description</h3><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{detail.description}</p></div>}
            {detail?.objectifs?.length > 0 && <div className="mb-5"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Target className="h-4 w-4 opacity-50" />Objectifs du cours</h3><ul className="space-y-1.5">{detail.objectifs.map((obj, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-esi-primary" />{obj}</li>)}</ul></div>}
            {chapitres.length > 0 && <div className="mb-2"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Layers className="h-4 w-4 opacity-50" />Contenu — {chapitres.length} chapitre{chapitres.length > 1 ? 's' : ''}, {totalSections} section{totalSections > 1 ? 's' : ''}</h3><div className="space-y-2">{chapitres.map((ch, ci) => <div key={ch.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-gray-700 dark:bg-gray-900/30"><p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-esi-primary/10 text-[10px] font-bold text-esi-primary">{ci + 1}</span>{ch.titre}</p><ul className="ml-7 space-y-0.5">{ch.sections?.map((s, si) => <li key={s.id} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><span className="h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />{ci + 1}.{si + 1} — {s.titre}</li>)}</ul></div>)}</div></div>}
          </>)}
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-900/50">
          <button onClick={() => onReadOnline(detail || course)} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-esi-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-esi-primary-hover hover:shadow-md disabled:opacity-50"><Eye className="h-4 w-4" />Lire en ligne</button>
          <button onClick={handleDownload} disabled={loading || downloading} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700">{downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{downloading ? 'En cours…' : 'Télécharger'}</button>
        </div>
      </div>
    </div>
  )
}

function InfoChip({ icon: Icon, label, value }) {
  return (<div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/30"><div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"><Icon className="h-3 w-3" />{label}</div><p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200" title={value}>{value}</p></div>)
}
