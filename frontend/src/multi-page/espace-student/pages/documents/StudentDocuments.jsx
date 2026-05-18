import { useState, useMemo } from 'react'
import { FileText, Search, Filter, Calendar, BookOpen, SlidersHorizontal, X } from 'lucide-react'
import useResources from './hooks/useResources'
import { downloadResource } from '../../api/services/documentsService'
import ResourceCard from './components/ResourceCard'
import FilterSelect from './components/FilterSelect'

function FilterPill({ label, value, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-esi-primary/20 bg-esi-primary/10 px-2.5 py-0.5 text-xs font-medium text-esi-primary transition-all hover:bg-esi-primary/15 dark:border-esi-primary/30 dark:bg-esi-primary/15">
      <span className="text-[10px] uppercase tracking-wider opacity-60">{label}:</span>{value}
      <button type="button" onClick={onClear} className="ml-0.5 rounded-full p-0.5 transition hover:bg-esi-primary/20"><X className="h-2.5 w-2.5" /></button>
    </span>
  )
}

export default function StudentDocuments() {
  const { resources, loading } = useResources()
  const [search, setSearch] = useState('')
  const [filterMatiere, setFilterMatiere] = useState('')
  const [filterAnnee, setFilterAnnee] = useState('')
  const [filterType, setFilterType] = useState('')
  const [downloading, setDownloading] = useState(null)

  const matieres = useMemo(() => [...new Set(resources.map((r) => r.matiere))].sort(), [resources])
  const annees = useMemo(() => [...new Set(resources.map((r) => r.annee).filter(Boolean))].sort().reverse(), [resources])
  const types = useMemo(() => [...new Set(resources.map((r) => r.type))].sort(), [resources])

  const filtered = useMemo(() => resources.filter((r) => {
    if (filterMatiere && r.matiere !== filterMatiere) return false
    if (filterAnnee && r.annee !== filterAnnee) return false
    if (filterType && r.type !== filterType) return false
    if (search) { const q = search.toLowerCase(); if (!r.titre.toLowerCase().includes(q) && !r.matiere.toLowerCase().includes(q) && !r.professeur.toLowerCase().includes(q)) return false }
    return true
  }), [resources, filterMatiere, filterAnnee, filterType, search])

  const hasActiveFilters = filterMatiere || filterAnnee || filterType
  function clearAllFilters() { setFilterMatiere(''); setFilterAnnee(''); setFilterType(''); setSearch('') }

  async function handleDownload(resource) {
    setDownloading(resource.id)
    try {
      await downloadResource(resource.id)
      const content = [`Titre : ${resource.titre}`, `Matière : ${resource.matiere}`, `Professeur : ${resource.professeur}`, `Date : ${resource.date}`, `Taille : ${resource.taille}`, '', 'Ce document est disponible sur votre espace ESI Online.'].join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${resource.titre.replace(/[^\w\s-]/g, '').trim()}.txt`; a.click(); URL.revokeObjectURL(url)
    } catch (e) { console.error('Download error', e) } finally { setDownloading(null) }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-esi-primary/10 to-esi-primary/5 p-2.5 text-esi-primary ring-1 ring-esi-primary/10 dark:from-esi-primary/20 dark:to-esi-primary/10 dark:ring-esi-primary/20"><FileText className="h-7 w-7" strokeWidth={1.5} /></div>
        <div><h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">Documents</h1><p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">{loading ? 'Chargement…' : `${resources.length} document${resources.length > 1 ? 's' : ''} disponibles`}</p></div>
      </div>
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/80">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="documents-search" type="text" placeholder="Rechercher par titre, matière ou professeur…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-esi-primary focus:bg-white focus:ring-2 focus:ring-esi-primary/20 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-gray-500 dark:focus:border-esi-primary dark:focus:bg-gray-900" />
          {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-gray-700"><X className="h-3.5 w-3.5" /></button>}
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-5 hidden shrink-0 sm:block"><SlidersHorizontal className="h-4 w-4 text-slate-400" /></div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <FilterSelect id="filter-matiere" label="Matière" icon={BookOpen} value={filterMatiere} onChange={setFilterMatiere} options={matieres} placeholder="Toutes les matières" />
            <FilterSelect id="filter-annee" label="Année" icon={Calendar} value={filterAnnee} onChange={setFilterAnnee} options={annees} placeholder="Toutes les années" />
            <FilterSelect id="filter-type" label="Type" icon={Filter} value={filterType} onChange={setFilterType} options={types} placeholder="Tous les types" />
          </div>
        </div>
        {(hasActiveFilters || search) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-gray-700">
            <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">Filtres actifs :</span>
            {filterMatiere && <FilterPill label="Matière" value={filterMatiere} onClear={() => setFilterMatiere('')} />}
            {filterAnnee && <FilterPill label="Année" value={filterAnnee} onClear={() => setFilterAnnee('')} />}
            {filterType && <FilterPill label="Type" value={filterType} onClear={() => setFilterType('')} />}
            {search && <FilterPill label="Recherche" value={`"${search}"`} onClear={() => setSearch('')} />}
            <button type="button" onClick={clearAllFilters} className="ml-auto text-xs font-medium text-slate-400 transition hover:text-esi-primary dark:text-slate-500 dark:hover:text-esi-primary">Tout effacer</button>
          </div>
        )}
      </div>
      {!loading && <div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium text-slate-500 dark:text-slate-400"><span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-esi-primary/10 px-1.5 text-xs font-bold text-esi-primary">{filtered.length}</span>résultat{filtered.length > 1 ? 's' : ''}{hasActiveFilters || search ? ' trouvé' + (filtered.length > 1 ? 's' : '') : ''}</p></div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[76px] animate-pulse rounded-xl bg-slate-100 dark:bg-gray-700" style={{ animationDelay: `${i * 80}ms` }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center dark:border-gray-600 dark:bg-gray-800">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-gray-700"><FileText className="h-7 w-7 text-slate-300 dark:text-slate-500" /></div>
          <p className="font-medium text-slate-500 dark:text-slate-400">Aucun document trouvé</p><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Essayez de modifier vos filtres ou votre recherche</p>
          {(hasActiveFilters || search) && <button type="button" onClick={clearAllFilters} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-esi-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-esi-primary-hover"><X className="h-3.5 w-3.5" />Réinitialiser les filtres</button>}
        </div>
      ) : (
        <div className="space-y-2.5">{filtered.map((resource, index) => <ResourceCard key={resource.id} resource={resource} onDownload={() => handleDownload(resource)} downloading={downloading === resource.id} index={index} />)}</div>
      )}
    </div>
  )
}
