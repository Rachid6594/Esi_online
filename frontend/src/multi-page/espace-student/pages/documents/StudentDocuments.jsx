import { useState, useMemo } from 'react'
import { FileText, Search, Filter, Calendar, BookOpen, SlidersHorizontal, X } from 'lucide-react'
import useResources from './hooks/useResources'
import { downloadResource } from '../../api/services/documentsService'
import ResourceCard from './components/ResourceCard'
import FilterSelect from './components/FilterSelect'
import StudentUploadPanel from './components/StudentUploadPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function FilterPill({ label, value, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:border-primary/30 dark:bg-primary/15">
      <span className="text-[10px] uppercase tracking-wider opacity-60">{label}:</span>
      {value}
      <Button type="button" variant="ghost" size="icon-xs" onClick={onClear} className="ml-0.5 h-4 w-4 hover:bg-primary/20">
        <X className="h-2.5 w-2.5" />
      </Button>
    </span>
  )
}

export default function StudentDocuments() {
  const { resources, loading, reload } = useResources()
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
    if (search) {
      const q = search.toLowerCase()
      if (!r.titre.toLowerCase().includes(q) && !r.matiere.toLowerCase().includes(q) && !r.professeur.toLowerCase().includes(q)) return false
    }
    return true
  }), [resources, filterMatiere, filterAnnee, filterType, search])

  const hasActiveFilters = filterMatiere || filterAnnee || filterType
  function clearAllFilters() { setFilterMatiere(''); setFilterAnnee(''); setFilterType(''); setSearch('') }

  async function handleDownload(resource) {
    setDownloading(resource.id)
    try {
      await downloadResource(resource.id)
      const content = [`Titre : ${resource.titre}`, `Matière : ${resource.matiere}`, `Professeur : ${resource.professeur}`, `Date : ${resource.date}`, `Taille : ${resource.taille}`, '', 'Ce document est disponible sur votre espace ESI Online.'].join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resource.titre.replace(/[^\w\s-]/g, '').trim()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error('Download error', e) } finally { setDownloading(null) }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-2.5 text-primary ring-1 ring-primary/10 dark:from-primary/20 dark:to-primary/10 dark:ring-primary/20">
          <FileText className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Documents</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {loading ? 'Chargement…' : `${resources.length} document${resources.length > 1 ? 's' : ''} disponibles`}
          </p>
        </div>
      </div>
      <StudentUploadPanel onUploaded={reload} />
      <Card className="mb-6 shadow-sm backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="documents-search"
              type="text"
              placeholder="Rechercher par titre, matière ou professeur…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-5 hidden shrink-0 sm:block">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <FilterSelect id="filter-matiere" label="Matière" icon={BookOpen} value={filterMatiere} onChange={setFilterMatiere} options={matieres} placeholder="Toutes les matières" />
              <FilterSelect id="filter-annee" label="Année" icon={Calendar} value={filterAnnee} onChange={setFilterAnnee} options={annees} placeholder="Toutes les années" />
              <FilterSelect id="filter-type" label="Type" icon={Filter} value={filterType} onChange={setFilterType} options={types} placeholder="Tous les types" />
            </div>
          </div>
          {(hasActiveFilters || search) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="mr-1 text-xs font-medium text-muted-foreground">Filtres actifs :</span>
              {filterMatiere && <FilterPill label="Matière" value={filterMatiere} onClear={() => setFilterMatiere('')} />}
              {filterAnnee && <FilterPill label="Année" value={filterAnnee} onClear={() => setFilterAnnee('')} />}
              {filterType && <FilterPill label="Type" value={filterType} onClear={() => setFilterType('')} />}
              {search && <FilterPill label="Recherche" value={`"${search}"`} onClear={() => setSearch('')} />}
              <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters} className="ml-auto text-xs text-muted-foreground hover:text-primary">
                Tout effacer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {!loading && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            <Badge variant="secondary" className="mr-1.5 bg-primary/10 text-primary">{filtered.length}</Badge>
            résultat{filtered.length > 1 ? 's' : ''}{hasActiveFilters || search ? ' trouvé' + (filtered.length > 1 ? 's' : '') : ''}
          </p>
        </div>
      )}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-muted-foreground">Aucun document trouvé</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Essayez de modifier vos filtres ou votre recherche</p>
            {(hasActiveFilters || search) && (
              <Button type="button" size="sm" onClick={clearAllFilters} className="mt-4">
                <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} onDownload={() => handleDownload(resource)} downloading={downloading === resource.id} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
