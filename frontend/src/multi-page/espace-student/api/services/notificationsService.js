import { apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Formate une date ISO en YYYY-MM-DD
 */
function formatDate(isoString) {
  if (!isoString) return ''
  return isoString.split('T')[0]
}

/**
 * Mappe la catégorie backend vers un type UI (info, warning, success)
 */
function mapCategoryToType(categorie) {
  const cat = (categorie || '').toLowerCase()
  if (cat.includes('urgent') || cat.includes('alerte') || cat.includes('examen')) return 'warning'
  if (cat.includes('succès') || cat.includes('validation')) return 'success'
  return 'info'
}

/**
 * Récupère la liste des notifications.
 * @returns {Promise<Array>}
 */
export async function getNotifications() {
  const data = await apiGet(ENDPOINTS.NOTIFICATIONS)
  const results = data?.results || data || []

  return results.map(n => ({
    id: String(n.id),
    type: mapCategoryToType(n.categorie),
    titre: n.titre || 'Annonce',
    message: n.contenu || '',
    date: formatDate(n.created_at),
    lu: false // Géré localement ou si un endpoint "LectureAnnonce" existe
  }))
}
