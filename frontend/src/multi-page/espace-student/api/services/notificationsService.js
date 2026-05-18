import { apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Récupère la liste des notifications.
 * @returns {Promise<Array>}
 */
export async function getNotifications() {
  return (await apiGet(ENDPOINTS.NOTIFICATIONS)) || []
}
