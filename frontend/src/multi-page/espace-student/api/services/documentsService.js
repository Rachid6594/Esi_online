import { apiGet, apiClient } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Formate des octets en taille lisible (Ko, Mo, etc.)
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return 'Inconnu'
  const k = 1024
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
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
 * Récupère la liste des ressources/documents.
 * @returns {Promise<Array>}
 */
export async function getResources() {
  const data = await apiGet(ENDPOINTS.RESOURCES)
  const results = data?.results || data || []

  return results.map(r => ({
    id: String(r.id),
    titre: r.titre || 'Sans titre',
    type: r.type_ressource || 'Document',
    matiere: r.matiere ? `Matière N°${r.matiere}` : 'Général',
    professeur: r.uploaded_by ? `Auteur N°${r.uploaded_by}` : 'Administration',
    date: formatDate(r.created_at),
    taille: formatBytes(r.taille_fichier),
    annee: r.annee_academique ? `Année N°${r.annee_academique}` : 'En cours',
    fichier_url: r.fichier || null
  }))
}

/**
 * Déclenche le téléchargement d'une ressource.
 * @param {string} id
 * @returns {Promise<Response|null>}
 */
export async function downloadResource(id) {
  return apiClient(ENDPOINTS.RESOURCE_DETAIL(id))
}
