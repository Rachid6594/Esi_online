import { useState, useMemo } from 'react'
import { FileText, Search, Filter, Calendar, BookOpen, SlidersHorizontal, Users, Layers, X } from 'lucide-react'
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

/**
 * Valeurs distinctes et triées d'un champ, les vides écartés.
 * Alimente les menus de filtres.
 */
function uniques(resources, champ) {
  return [...new Set(resources.map((r) => r[champ]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'fr', { numeric: true })
  )
}

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
  const [filterType, setFilterType] = useState('')
  const [filterMatiere, setFilterMatiere] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterNiveau, setFilterNiveau] = useState('')
  const [filterFiliere, setFilterFiliere] = useState('')
  const [filterAnnee, setFilterAnnee] = useState('')
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState(null)

  // Les options viennent de la liste complète, jamais de la liste filtrée :
  // sinon l'option qu'on vient de choisir disparaît du menu.
  const options = useMemo(
    () => ({
      types: uniques(resources, 'type'),
      matieres: uniques(resources, 'matiere'),
      classes: uniques(resources, 'classe'),
      niveaux: uniques(resources, 'niveau'),
      filieres: uniques(resources, 'filiere'),
      annees: [...new Set(resources.map((r) => r.annee).filter(Boolean))].sort().reverse(),
    }),
    [resources]
  )
  const { types, matieres, classes, niveaux, filieres, annees } = options

  const filtered = useMemo(() => resources.filter((r) => {
    if (filterType && r.type !== filterType) return false
    if (filterMatiere && r.matiere !== filterMatiere) return false
    if (filterClasse && r.classe !== filterClasse) return false
    if (filterNiveau && r.niveau !== filterNiveau) return false
    if (filterFiliere && r.filiere !== filterFiliere) return false
    if (filterAnnee && r.annee !== filterAnnee) return false
    if (search) {
      const q = search.trim().toLowerCase()
      if (!q) return true
      // Le champ auteur a remplacé « professeur », et la description est
      // entrée dans la recherche.
      return [r.titre, r.matiere, r.auteur, r.classe, r.description, r.type]
        .some((champ) => champ && champ.toLowerCase().includes(q))
    }
    return true
  }), [resources, filterType, filterMatiere, filterClasse, filterNiveau, filterFiliere, filterAnnee, search])

  const filtres = [
    ['Type', filterType, setFilterType],
    ['Classe', filterClasse, setFilterClasse],
    ['Matière', filterMatiere, setFilterMatiere],
    ['Niveau', filterNiveau, setFilterNiveau],
    ['Filière', filterFiliere, setFilterFiliere],
    ['Année', filterAnnee, setFilterAnnee],
  ]
  const hasActiveFilters = filtres.some(([, valeur]) => valeur)

  function clearAllFilters() {
    filtres.forEach(([, , setV]) => setV(''))
    setSearch('')
  }

  async function handleDownload(resource) {
    setDownloading(resource.id)
    setError(null)
    try {
      // Le vrai fichier, depuis l'endpoint de téléchargement de l'espace.
      await downloadResource(resource)
    } catch (e) {
      console.error('Téléchargement impossible', e)
      setError(e.message || 'Téléchargement impossible.')
    } finally {
      setDownloading(null)
    }
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
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <span>{error}</span>
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => setError(null)} aria-label="Fermer">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      <Card className="mb-6 shadow-sm backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="documents-search"
              type="text"
              placeholder="Rechercher par titre, matière, auteur ou description…"
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
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterSelect id="filter-type" label="Type" icon={Filter} value={filterType} onChange={setFilterType} options={types} placeholder="Tous les types" />
              <FilterSelect id="filter-classe" label="Classe" icon={Users} value={filterClasse} onChange={setFilterClasse} options={classes} placeholder="Toutes les classes" />
              <FilterSelect id="filter-matiere" label="Matière" icon={BookOpen} value={filterMatiere} onChange={setFilterMatiere} options={matieres} placeholder="Toutes les matières" />
              <FilterSelect id="filter-niveau" label="Niveau" icon={Layers} value={filterNiveau} onChange={setFilterNiveau} options={niveaux} placeholder="Tous les niveaux" />
              <FilterSelect id="filter-filiere" label="Filière" icon={Layers} value={filterFiliere} onChange={setFilterFiliere} options={filieres} placeholder="Toutes les filières" />
              <FilterSelect id="filter-annee" label="Année" icon={Calendar} value={filterAnnee} onChange={setFilterAnnee} options={annees} placeholder="Toutes les années" />
            </div>
          </div>
          {(hasActiveFilters || search) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="mr-1 text-xs font-medium text-muted-foreground">Filtres actifs :</span>
              {filtres.map(([label, valeur, setValeur]) =>
                valeur ? <FilterPill key={label} label={label} value={valeur} onClear={() => setValeur('')} /> : null
              )}
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
