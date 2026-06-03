import { apiPost, apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Récupère le profil de l'étudiant.
 * @returns {Promise<Object|null>}
 */
export async function getProfile() {
  return apiGet(ENDPOINTS.PROFILE)
}

/**
 * Met à jour le profil de l'étudiant (Local/Mock).
 * @param {Object} data - { first_name, last_name, email }
 * @returns {Promise<Object|null>}
 */
export async function updateProfile(data) {
  // Le backend n'expose pas de route de modification de profil étudiant
  // On simule une réussite
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data })
    }, 500)
  })
}
