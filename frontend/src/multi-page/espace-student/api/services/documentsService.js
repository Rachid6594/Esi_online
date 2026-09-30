import { apiGet, apiClient } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Formate des octets en taille lisible (Ko, Mo, etc.)
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return 'Inconnu'
  const k = 1024
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Formate une date ISO en YYYY-MM-DD
 */
function formatDate(isoString) {
  if (!isoString) return ''
  return isoString.split('T')[0]
}

/**
 * Récupère les documents visibles par l'étudiant.
 *
 * Le filtrage se fait côté client sur cette liste, et non côté serveur : le
 * volume est celui d'un établissement, donc borné, et surtout les listes de
 * filtres sont derivées de cette même liste. Un filtrage serveur la
 * rétrécirait au fur et à mesure et les options disparaîtraient une fois
 * sélectionnées. La portée, elle, vient du serveur : c'est elle qui protège
 * les documents des autres classes.
 *
 * @returns {Promise<Array>}
 */
export async function getResources() {
  const data = await apiGet(ENDPOINTS.DOCUMENTS)
  if (!data) return []
  const results = data?.results || data || []

  return results.map((r) => ({
    id: String(r.id),
    titre: r.titre || 'Sans titre',
    description: r.description || '',
    type: r.type_ressource || 'Document',
    // Les libellés viennent du serializer. Avant, ce champ valait
    // « Matière N°5 » et les filtres se construisaient dessus.
    matiere: r.matiere_libelle || '',
    matiereId: r.matiere_id ?? null,
    classe: r.classe_libelle || '',
    classeId: r.classe_id ?? null,
    niveau: r.niveau_libelle || '',
    filiere: r.filiere_libelle || '',
    annee: r.annee_libelle || '',
    categorie: r.categorie_libelle || '',
    auteur: r.auteur || 'Administration',
    date: formatDate(r.date_publication || r.created_at),
    taille: formatBytes(r.taille_fichier),
    telechargeable: Boolean(r.telechargeable),
    urlTelechargement: r.url_telechargement || null,
  }))
}

/**
 * Types de documents acceptés, lus depuis l'API pour rester alignés avec le
 * dépôt admin.
 */
export async function getDocumentTypes() {
  const data = await apiGet(ENDPOINTS.DOCUMENT_TYPES)
  return Array.isArray(data) ? data : []
}

/**
 * Déclenche le téléchargement du fichier réel d'une ressource.
 *
 * Ne renvoie rien à l'appelant : la sauvegarde est déclenchée ici via un lien
 * temporaire. Avant, l'endpoint renvoyait du JSON et le front fabriquait un
 * .txt de reçu à la place du document.
 *
 * @param {object} resource
 */
export async function downloadResource(resource) {
  const url = resource.urlTelechargement
  if (!url) throw new Error("Ce document n'a pas de fichier joint.")

  const reponse = await apiClient(url)
  if (!reponse) throw new Error('Téléchargement impossible.')
  if (!reponse.ok) throw new Error(`Téléchargement refusé (${reponse.status}).`)

  const blob = await reponse.blob()
  const objetUrl = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = objetUrl
  // Le serveur slugifie le titre et remet l'extension d'origine ; on le suit
  // quand l'en-tête est la, sinon on retombe sur le titre brut.
  lien.download =
    nomDepuisContentDisposition(reponse.headers.get('Content-Disposition')) ||
    resource.titre ||
    'document'
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  // Libere l'objet seulement apres le clic : un revoke trop tot annule le
  // telechargement dans Firefox.
  setTimeout(() => URL.revokeObjectURL(objetUrl), 10_000)
}

/**
 * Extrait le nom de fichier d'un en-tête Content-Disposition.
 *
 * Django le renvoie en ASCII échappé (filename*=UTF-8''...), qu'il faut
 * décoder avant de s'en servir.
 */
function nomDepuisContentDisposition(entete) {
  if (!entete) return ''
  const etendu = entete.match(/filename\*\s*=\s*[^']*'[^']*'([^;]+)/i)
  if (etendu) {
    try {
      return decodeURIComponent(etendu[1].trim())
    } catch {
      return etendu[1].trim()
    }
  }
  const simple = entete.match(/filename\s*=\s*"?([^";]+)"?/i)
  return simple ? simple[1].trim() : ''
}