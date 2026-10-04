import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Layers, Upload, FileText, Download, Loader2 } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { getAccessToken, refreshAccessToken, clearAuthAndRedirectToLogin } from '../../auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Espace admin : dépôt et liste des documents.
 *
 * Le dépôt passe par /documents/depot/ et non par le CRUD JSON sur
 * /ressources/ : Ressource.fichier est un CharField, donc l'endpoint CRUD ne
 * pouvait qu'exiger un chemin saisi à la main, sans vérifier qu'un fichier
 * existe derrière. Les types viennent de l'API pour rester alignés sur le
 * backend, et les référentiels (classes, matières…) sont chargés pour les
 * menus.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const ETABLISSEMENT = `${API_BASE}/api/etablissement`
const DEPOT = `${ETABLISSEMENT}/documents/depot/`
const TYPES_DOCUMENTS = `${ETABLISSEMENT}/documents/types/`
const RESSOURCES = `${ETABLISSEMENT}/ressources/`

const AUCUN = '__aucun__'

async function fetchWithAuth(url, options = {}, isRetry = false) {
  const token = getAccessToken()
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(url, { ...options, headers })

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken(API_BASE)
    if (refreshed) return fetchWithAuth(url, options, true)
    clearAuthAndRedirectToLogin()
    return undefined
  }
  return res
}

/**
 * GET JSON. Retourne une liste vide sur 404 plutôt que de rejeter : un
 * référentiel vide est un cas normal, pas une panne.
 */
async function apiGetListe(url) {
  const res = await fetchWithAuth(url)
  if (!res || !res.ok) return []
  const texte = await res.text()
  if (!texte) return []
  try {
    const data = JSON.parse(texte)
    if (!Array.isArray(data)) return data?.results ?? []
    return data
  } catch {
    return []
  }
}

function messageErreur(data, code) {
  const detail = data?.detail ?? data?.message
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) return String(detail[0])
  if (data && typeof data === 'object') {
    const champs = Object.entries(data).map(([cle, valeur]) => `${cle} : ${valeur}`)
    if (champs.length) return champs.join(' — ')
  }
  return `Erreur ${code}`
}

/** Libellé lisible d'un objet de référentiel, quelle que soit sa casse. */
function libelleDe(item, ...cles) {
  if (!item) return ''
  for (const cle of cles) {
    const valeur = item[cle]
    if (typeof valeur === 'string' && valeur.trim()) return valeur
  }
  return ''
}

function formaterTaille(octets) {
  if (!octets) return '—'
  const unites = ['o', 'Ko', 'Mo', 'Go']
  const i = Math.min(Math.floor(Math.log(octets) / Math.log(1024)), unites.length - 1)
  return `${parseFloat((octets / 1024 ** i).toFixed(1))} ${unites[i]}`
}

function formaterDate(iso) {
  if (!iso) return '—'
  return String(iso).split('T')[0]
}

const VIDE = {
  titre: '',
  type_ressource: '',
  description: '',
  auteur: '',
  lien: '',
  classe_id: AUCUN,
  matiere_id: AUCUN,
  annee_academique_id: AUCUN,
  categorie_id: AUCUN,
  is_public: true,
}

export default function AdminContenu() {
  const [documents, setDocuments] = useState([])
  const [types, setTypes] = useState([])
  const [referentiels, setReferentiels] = useState({
    classes: [],
    matieres: [],
    annees: [],
    categories: [],
  })
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [formulaire, setFormulaire] = useState(VIDE)
  const [fichier, setFichier] = useState(null)
  const [message, setMessage] = useState(null)
  const inputFichier = useRef(null)

  const charger = useCallback(async () => {
    setChargement(true)
    try {
      const [liste, listeTypes, classes, matieres, annees, categories] = await Promise.all([
        apiGetListe(RESSOURCES),
        apiGetListe(TYPES_DOCUMENTS),
        apiGetListe(`${ETABLISSEMENT}/classes/`),
        apiGetListe(`${ETABLISSEMENT}/matieres/`),
        apiGetListe(`${ETABLISSEMENT}/anneeacademiques/`),
        apiGetListe(`${ETABLISSEMENT}/categories/`),
      ])
      setDocuments(liste)
      setTypes(listeTypes)
      setReferentiels({ classes, matieres, annees, categories })
      setMessage(null)
    } catch (e) {
      setMessage({ type: 'erreur', texte: e.message || 'Chargement impossible.' })
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  function ouvrirFormulaire() {
    setFormulaire(VIDE)
    setFichier(null)
    setMessage(null)
    if (inputFichier.current) inputFichier.current.value = ''
    setFormulaireOuvert(true)
  }

  async function deposer(event) {
    event.preventDefault()
    // Un document se designe par un fichier, par un lien, ou par les deux.
    if (!fichier && !formulaire.lien.trim()) {
      setMessage({ type: 'erreur', texte: 'Joignez un fichier ou saisissez un lien.' })
      return
    }

    setEnvoi(true)
    setMessage(null)
    try {
      const donnees = new FormData()
      donnees.append('titre', formulaire.titre)
      donnees.append('type_ressource', formulaire.type_ressource)
      donnees.append('description', formulaire.description)
      donnees.append('auteur', formulaire.auteur)
      donnees.append('lien', formulaire.lien)
      donnees.append('is_public', formulaire.is_public ? 'true' : 'false')
      // Les menus envoient la sentinelle AUCUN pour « pas de rattachement » ;
      // l'API la traite comme absente.
      for (const cle of ['classe_id', 'matiere_id', 'annee_academique_id', 'categorie_id']) {
        donnees.append(cle, formulaire[cle])
      }
      if (fichier) donnees.append('fichier', fichier)

      const res = await fetchWithAuth(DEPOT, { method: 'POST', body: donnees })
      const data = await res.json().catch(() => ({}))
      if (!res) return
      if (!res.ok) {
        setMessage({ type: 'erreur', texte: messageErreur(data, res.status) })
        return
      }
      setFormulaireOuvert(false)
      await charger()
      // Après charger() : celui-ci remet le message à null, donc un message
      // posé avant disparaissait aussitôt.
      setMessage({ type: 'succes', texte: `« ${data.titre} » a été déposé.` })
    } catch (e) {
      setMessage({ type: 'erreur', texte: e.message || 'Dépôt impossible.' })
    } finally {
      setEnvoi(false)
    }
  }

  // RessourceSerializer renvoie les clés étrangères en id brut. Les libellés
  // sont résolus ici, avec les référentiels déjà chargés pour les menus, plutôt
  // que de modifier le serializer pour cette seule page.
  const index = useMemo(
    () => ({
      classes: new Map(referentiels.classes.map((c) => [c.id, libelleDe(c, 'libelle', 'code')])),
      matieres: new Map(referentiels.matieres.map((m) => [m.id, libelleDe(m, 'libelle', 'code')])),
      annees: new Map(referentiels.annees.map((a) => [a.id, libelleDe(a, 'libelle')])),
    }),
    [referentiels]
  )

  const nom = (table, id) => index[table].get(id) || '—'

  const colonnes = useMemo(
    () => [
      {
        key: 'titre',
        label: 'Titre',
        render: (doc) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{doc.titre || 'Sans titre'}</p>
            {doc.auteur && <p className="truncate text-xs text-muted-foreground">{doc.auteur}</p>}
          </div>
        ),
      },
      { key: 'type_ressource', label: 'Type' },
      {
        key: 'matiere',
        label: 'Matière',
        render: (doc) => (doc.matiere ? nom('matieres', doc.matiere) : '—'),
      },
      {
        key: 'classe',
        label: 'Classe',
        render: (doc) => (doc.classe ? nom('classes', doc.classe) : 'Général'),
      },
      {
        key: 'annee_academique',
        label: 'Année',
        render: (doc) =>
          doc.annee_academique ? nom('annees', doc.annee_academique) : '—',
      },
      {
        key: 'taille_fichier',
        label: 'Taille',
        render: (doc) => formaterTaille(doc.taille_fichier),
      },
      {
        key: 'created_at',
        label: 'Déposé le',
        render: (doc) => formaterDate(doc.created_at),
      },
      {
        key: 'visibilite',
        label: 'Visibilité',
        render: (doc) => (
          <span className="text-xs text-muted-foreground">
            {doc.is_public ? 'Public' : 'Restreint'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        sortable: false,
        render: (doc) =>
          doc.fichier ? (
            <a
              href={`${API_BASE}/media/${doc.fichier}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              Fichier
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Lien</span>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index]
  )

  const nbDocuments = documents.length

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5 text-muted-foreground">
            <Layers className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Contenu</h1>
            <p className="text-muted-foreground">
              {chargement ? 'Chargement…' : `${nbDocuments} document${nbDocuments > 1 ? 's' : ''} déposé${nbDocuments > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Button onClick={ouvrirFormulaire} disabled={chargement}>
          <Upload className="h-4 w-4" />
          Déposer un document
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'erreur' ? 'destructive' : 'default'} className="mb-4">
          <AlertDescription>{message.texte}</AlertDescription>
        </Alert>
      )}

      <Modal open={formulaireOuvert} onClose={() => !envoi && setFormulaireOuvert(false)} title="Déposer un document">
        <form onSubmit={deposer} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-titre">Titre</Label>
            <Input
              id="doc-titre"
              value={formulaire.titre}
              onChange={(e) => setFormulaire({ ...formulaire, titre: e.target.value })}
              placeholder="Devoir 1 — algorithmique"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-type">Type</Label>
              <Select
                value={formulaire.type_ressource}
                onValueChange={(v) => setFormulaire({ ...formulaire, type_ressource: v })}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.valeur} value={t.valeur}>
                      {t.libelle || t.valeur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-auteur">Auteur</Label>
              <Input
                id="doc-auteur"
                value={formulaire.auteur}
                onChange={(e) => setFormulaire({ ...formulaire, auteur: e.target.value })}
                placeholder="Nom de l'enseignant ou du service"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-fichier">Fichier</Label>
            <Input
              id="doc-fichier"
              type="file"
              ref={inputFichier}
              onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              PDF, Word, tableur, image ou archive, jusqu’à 100 Mo. Le nom d’origine est
              remplacé par un identifiant unique sur le serveur.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-lien">Lien externe (facultatif)</Label>
            <Input
              id="doc-lien"
              type="url"
              value={formulaire.lien}
              onChange={(e) => setFormulaire({ ...formulaire, lien: e.target.value })}
              placeholder="https://…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-classe">Classe</Label>
              <Select
                value={formulaire.classe_id}
                onValueChange={(v) => setFormulaire({ ...formulaire, classe_id: v })}
              >
                <SelectTrigger id="doc-classe">
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUCUN}>Toutes les classes</SelectItem>
                  {referentiels.classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {libelleDe(c, 'libelle', 'code')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-matiere">Matière</Label>
              <Select
                value={formulaire.matiere_id}
                onValueChange={(v) => setFormulaire({ ...formulaire, matiere_id: v })}
              >
                <SelectTrigger id="doc-matiere">
                  <SelectValue placeholder="Toutes les matières" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUCUN}>Toutes les matières</SelectItem>
                  {referentiels.matieres.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {libelleDe(m, 'libelle', 'code')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-annee">Année académique</Label>
              <Select
                value={formulaire.annee_academique_id}
                onValueChange={(v) => setFormulaire({ ...formulaire, annee_academique_id: v })}
              >
                <SelectTrigger id="doc-annee">
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUCUN}>Toutes les années</SelectItem>
                  {referentiels.annees.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {libelleDe(a, 'libelle')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-categorie">Catégorie</Label>
              <Select
                value={formulaire.categorie_id}
                onValueChange={(v) => setFormulaire({ ...formulaire, categorie_id: v })}
              >
                <SelectTrigger id="doc-categorie">
                  <SelectValue placeholder="Aucune catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUCUN}>Aucune catégorie</SelectItem>
                  {referentiels.categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {libelleDe(c, 'libelle', 'nom')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-description">Description</Label>
            <Textarea
              id="doc-description"
              rows={3}
              value={formulaire.description}
              onChange={(e) => setFormulaire({ ...formulaire, description: e.target.value })}
              placeholder="Consignes, barème, date limite…"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="doc-public"
              checked={formulaire.is_public}
              onCheckedChange={(v) => setFormulaire({ ...formulaire, is_public: v === true })}
            />
            <Label htmlFor="doc-public" className="font-normal">
              Visible par tous les étudiants. Sinon, uniquement par ceux de la classe choisie.
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormulaireOuvert(false)} disabled={envoi}>
              Annuler
            </Button>
            <Button type="submit" disabled={envoi}>
              {envoi ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {envoi ? 'Dépôt…' : 'Déposer'}
            </Button>
          </div>
        </form>
      </Modal>

      {chargement ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des documents…
        </div>
      ) : (
        <DataTable columns={colonnes} data={documents} pageSize={12} />
      )}
    </div>
  )
}