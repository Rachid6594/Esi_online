/**
 * Configuration Axios centralisée pour l'espace étudiant.
 * Intercepteurs JWT : injecte le token, refresh automatique sur 401.
 */
import { getAccessToken, refreshAccessToken, clearAuthAndRedirectToLogin } from '../../../auth'

const BASE_URL = '' // Proxy Vite ou URL directe

/**
 * Effectue un fetch authentifié.
 * @param {string} url - Endpoint relatif (ex: '/api/student/courses')
 * @param {RequestInit} options - Options fetch
 * @param {boolean} _isRetry - Interne, ne pas utiliser
 * @returns {Promise<Response|null>}
 */
export async function apiClient(url, options = {}, _isRetry = false) {
  const token = getAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers })

  if (res.status === 401 && !_isRetry) {
    const refreshed = await refreshAccessToken(BASE_URL)
    if (refreshed) return apiClient(url, options, true)
    clearAuthAndRedirectToLogin()
    return null
  }

  return res
}

/**
 * Raccourci GET JSON.
 * @param {string} url
 * @returns {Promise<any|null>}
 */
export async function apiGet(url) {
  const res = await apiClient(url)
  if (!res || !res.ok) return null
  return res.json()
}

/**
 * Raccourci POST JSON.
 * @param {string} url
 * @param {any} body
 * @returns {Promise<any|null>}
 */
export async function apiPost(url, body) {
  const res = await apiClient(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res || !res.ok) return null
  return res.json()
}
