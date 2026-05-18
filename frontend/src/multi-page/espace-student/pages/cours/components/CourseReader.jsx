import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  ArrowLeft, BookOpen, ChevronRight, ChevronDown, PenLine, X, Plus,
  Trash2, PanelLeftClose, PanelLeftOpen, Clock, Hash, Save,
} from 'lucide-react'

/* ── Rendu simplifié du Markdown ── */
function renderContent(text) {
  if (!text) return null
  const lines = text.replace(/\\n/g, '\n').split('\n')
  const elements = []
  let inCodeBlock = false, codeLines = [], codeKey = 0

  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) { elements.push(<pre key={`code-${codeKey++}`} className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300 sm:p-4 sm:text-sm dark:bg-black"><code>{codeLines.join('\n')}</code></pre>); codeLines = [] }
      inCodeBlock = !inCodeBlock; return
    }
    if (inCodeBlock) { codeLines.push(line); return }
    if (line.trim() === '') { elements.push(<div key={i} className="h-3" />); return }
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      elements.push(<li key={i} className="ml-4 list-disc text-sm text-slate-700 sm:text-base dark:text-slate-300">{formatInline(line.replace(/^[\s]*[-•]\s*/, ''))}</li>); return
    }
    elements.push(<p key={i} className="text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-300">{formatInline(line)}</p>)
  })
  if (inCodeBlock && codeLines.length) elements.push(<pre key={`code-${codeKey}`} className="my-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300 sm:p-4 sm:text-sm dark:bg-black"><code>{codeLines.join('\n')}</code></pre>)
  return elements
}

function formatInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-pink-600 dark:bg-gray-700 dark:text-pink-400">{p.slice(1, -1)}</code>
    return p
  })
}

/* ── Composant principal ── */
export default function CourseReader({ course, onClose }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [expandedChapters, setExpandedChapters] = useState({})
  const sectionRefs = useRef({})
  const observerRef = useRef(null)

  /* Notes persistées dans localStorage */
  const storageKey = `esi-notes-${course?.id || 'unknown'}`
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || [] }
    catch { return [] }
  })
  const [newNote, setNewNote] = useState('')

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(notes)) }, [notes, storageKey])

  const chapitres = useMemo(() => course?.chapitres || [], [course])

  /* Ouvrir tous les chapitres par défaut */
  useEffect(() => {
    const m = {}; chapitres.forEach((ch) => { m[ch.id] = true }); setExpandedChapters(m)
  }, [chapitres])

  /* Ouvrir la sidebar par défaut sur desktop */
  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true)
  }, [])

  /* IntersectionObserver pour suivi actif */
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id) })
    }, { rootMargin: '-20% 0px -70% 0px' })
    return () => observerRef.current?.disconnect()
  }, [])

  const registerRef = useCallback((id, el) => {
    if (!el) return; sectionRefs.current[id] = el; observerRef.current?.observe(el)
  }, [])

  function toggleChapter(id) { setExpandedChapters((p) => ({ ...p, [id]: !p[id] })) }

  function scrollToSection(sectionId) {
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  function addNote() {
    if (!newNote.trim()) return
    setNotes((prev) => [{ id: Date.now(), text: newNote.trim(), section: activeSection, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }, ...prev])
    setNewNote('')
  }

  function deleteNote(id) { setNotes((prev) => prev.filter((n) => n.id !== id)) }
  function handleNoteKeyDown(e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addNote() } }

  function getSectionTitle(sectionId) {
    for (const ch of chapitres) { for (const s of ch.sections || []) { if (`section-${s.id}` === sectionId) return s.titre } }
    return 'Général'
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-white dark:bg-gray-900">
      {/* Overlay mobile pour sidebar/notes */}
      {(sidebarOpen || notesOpen) && <div className="fixed inset-0 z-10 bg-black/30 md:hidden" onClick={() => { setSidebarOpen(false); setNotesOpen(false) }} />}

      {/* Sidebar — overlay sur mobile, inline sur desktop */}
      <div className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 md:static md:w-72 md:translate-x-0 dark:border-gray-700 dark:bg-gray-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><BookOpen className="h-4 w-4 text-esi-primary" />Sommaire</div>
          <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"><PanelLeftClose className="h-4 w-4" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {chapitres.map((ch, ci) => (
            <div key={ch.id}>
              <button onClick={() => toggleChapter(ch.id)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-gray-700">
                {expandedChapters[ch.id] ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded bg-esi-primary/10 text-[10px] font-bold text-esi-primary">{ci + 1}</span>
                <span className="truncate">{ch.titre}</span>
              </button>
              {expandedChapters[ch.id] && ch.sections?.map((s) => {
                const sid = `section-${s.id}`
                const isActive = activeSection === sid
                return (
                  <button key={s.id} onClick={() => scrollToSection(sid)} className={`ml-7 flex w-[calc(100%-1.75rem)] items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition ${isActive ? 'bg-esi-primary/10 font-medium text-esi-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-esi-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className="truncate">{s.titre}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Zone de contenu */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barre d'outils */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 sm:px-4 sm:py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-700"><PanelLeftOpen className="h-4 w-4" /></button>
            <button onClick={onClose} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:gap-1.5 sm:px-3 dark:text-slate-300 dark:hover:bg-gray-700"><ArrowLeft className="h-4 w-4" /><span className="hidden xs:inline">Retour</span></button>
          </div>
          <h1 className="mx-2 hidden min-w-0 truncate text-sm font-semibold text-slate-700 sm:block dark:text-slate-200">{course?.intitule}</h1>
          <button onClick={() => { setNotesOpen(!notesOpen); if (!notesOpen) setSidebarOpen(false) }} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition sm:px-3 ${notesOpen ? 'bg-esi-primary text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-700'}`}>
            <PenLine className="h-4 w-4" /><span className="hidden sm:inline">Notes</span>
            {notes.length > 0 && <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${notesOpen ? 'bg-white/20 text-white' : 'bg-esi-primary/10 text-esi-primary'}`}>{notes.length}</span>}
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Contenu du cours */}
          <article className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 md:px-12 lg:px-20 lg:py-8">
            <div className="mx-auto max-w-3xl">
              {chapitres.map((ch, ci) => (
                <div key={ch.id} className="mb-8 sm:mb-12">
                  <h2 className="mb-4 flex items-center gap-2 border-b-2 border-esi-primary/20 pb-3 text-lg font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-xl dark:text-white">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-esi-primary text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">{ci + 1}</span>
                    {ch.titre}
                  </h2>
                  {ch.sections?.map((s) => (
                    <section key={s.id} id={`section-${s.id}`} ref={(el) => registerRef(`section-${s.id}`, el)} className="mb-6 scroll-mt-16 sm:mb-8 sm:scroll-mt-20">
                      <h3 className="mb-2 text-base font-semibold text-slate-800 sm:mb-3 sm:text-lg dark:text-slate-100">{s.titre}</h3>
                      <div className="space-y-2">{renderContent(s.contenu)}</div>
                    </section>
                  ))}
                </div>
              ))}
              {chapitres.length === 0 && (
                <div className="py-16 text-center sm:py-20"><BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="text-slate-500 dark:text-slate-400">Aucun contenu disponible pour ce cours.</p></div>
              )}
            </div>
          </article>

          {/* Panneau de notes — overlay mobile, inline desktop */}
          <div className={`fixed inset-y-0 right-0 z-20 flex w-72 flex-col border-l border-slate-200 bg-slate-50 transition-transform duration-300 sm:w-80 md:static md:translate-x-0 dark:border-gray-700 dark:bg-gray-800 ${notesOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-full'}`}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><PenLine className="h-4 w-4 text-esi-primary" />Carnet de notes</div>
              <button onClick={() => setNotesOpen(false)} className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="border-b border-slate-200 p-3 dark:border-gray-700">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={handleNoteKeyDown} placeholder="Écrire une note…" rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-esi-primary focus:ring-2 focus:ring-esi-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <div className="mt-2 flex items-center justify-between">
                <p className="hidden text-[10px] text-slate-400 sm:block">Ctrl+Enter pour sauvegarder</p>
                <button onClick={addNote} disabled={!newNote.trim()} className="flex items-center gap-1 rounded-lg bg-esi-primary px-2.5 py-1 text-xs font-medium text-white transition hover:bg-esi-primary-hover disabled:opacity-40"><Plus className="h-3 w-3" />Ajouter</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notes.length === 0 ? (<p className="py-8 text-center text-xs text-slate-400">Aucune note. Commencez à écrire !</p>) : notes.map((note) => (
                <div key={note.id} className="group rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-gray-600 dark:bg-gray-700">
                  <p className="text-slate-700 dark:text-slate-200">{note.text}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{note.time}</span>
                      {note.section && <span className="hidden items-center gap-0.5 truncate max-w-[100px] sm:flex"><Hash className="h-2.5 w-2.5" />{getSectionTitle(note.section)}</span>}
                    </div>
                    <button onClick={() => deleteNote(note.id)} className="rounded p-0.5 text-slate-400 transition hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
