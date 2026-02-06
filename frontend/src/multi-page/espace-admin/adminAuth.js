/**
 * Authentification admin (côté client).
 * À brancher plus tard sur l'API backend.
 */
const ADMIN_TOKEN_KEY = 'esi_admin_token'

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function isAdminAuthenticated() {
  return !!getAdminToken()
}
