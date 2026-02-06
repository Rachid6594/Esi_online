/**
 * Authentification unique : un seul login, redirection par rôle (admin, user, etc.).
 * Stocke user (avec role) + tokens JWT.
 */
const STORAGE_KEY = 'esi_auth'

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function setStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('auth setStored', e)
  }
}

export function getAuth() {
  return getStored()
}

export function setAuth(user, access, refresh) {
  setStored({ user, access, refresh })
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken() {
  const auth = getStored()
  return auth?.access ?? null
}

/**
 * Rafraîchit le token d'accès via le refresh token.
 * @param {string} [apiBase=''] - Base URL de l'API (ex. '' pour proxy, ou 'http://localhost:8000')
 * @returns {Promise<boolean>} true si un nouveau token a été enregistré
 */
export async function refreshAccessToken(apiBase = '') {
  const auth = getStored()
  if (!auth?.refresh) return false
  try {
    const url = (apiBase ? apiBase.replace(/\/$/, '') : '') + '/api/auth/token/refresh/'
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: auth.refresh }),
    })
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    if (!data.access) return false
    setStored({ ...auth, access: data.access })
    return true
  } catch {
    return false
  }
}

export function clearAuthAndRedirectToLogin() {
  clearAuth()
  window.location.href = '/login'
}

/**
 * Fetch avec token JWT ; en cas de 401, tente un refresh puis réessaie une fois.
 * À utiliser pour toutes les requêtes API admin (étudiants, établissement, etc.).
 * @param {string} apiBase - Base URL ('' pour proxy)
 * @param {string} url - URL complète
 * @param {RequestInit} options - options fetch
 * @param {boolean} [isRetry] - interne
 * @returns {Promise<Response | null>} Response ou null si déconnexion
 */
export async function fetchWithAuth(apiBase, url, options = {}, isRetry = false) {
  const token = getAccessToken()
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken(apiBase)
    if (refreshed) return fetchWithAuth(apiBase, url, options, true)
    clearAuthAndRedirectToLogin()
    return null
  }
  return res
}

export function isAuthenticated() {
  return !!getStored()?.user
}

export function isAdmin() {
  const auth = getStored()
  return auth?.user?.role === 'admin'
}

export function isBibliothecaire() {
  const auth = getStored()
  return auth?.user?.role === 'bibliothecaire'
}
