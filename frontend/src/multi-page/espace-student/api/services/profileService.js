import { apiPost } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Met à jour le profil de l'étudiant.
 * @param {Object} data - { first_name, last_name, email }
 * @returns {Promise<Object|null>}
 */
export async function updateProfile(data) {
  return apiPost(ENDPOINTS.PROFILE_UPDATE, data)
}
