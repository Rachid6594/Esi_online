import { apiGet, apiClient } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Récupère la liste des ressources/documents.
 * @returns {Promise<Array>}
 */
export async function getResources() {
  return (await apiGet(ENDPOINTS.RESOURCES)) || []
}

/**
 * Déclenche le téléchargement d'une ressource.
 * @param {string} id
 * @returns {Promise<Response|null>}
 */
export async function downloadResource(id) {
  return apiClient(ENDPOINTS.RESOURCE_DOWNLOAD(id))
}
