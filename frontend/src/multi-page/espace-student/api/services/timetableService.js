import { apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

/**
 * Formate une heure (ex: "08:00:00" -> "08:00")
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.split(':').slice(0, 2).join(':')
}

/**
 * Récupère l'emploi du temps de l'étudiant.
 * @returns {Promise<Array>}
 */
export async function getTimetable() {
  const data = await apiGet(ENDPOINTS.TIMETABLE)
  const results = data?.results || data || []

  return results.map(s => ({
    id: String(s.id),
    jour: s.jour || '',
    heure_debut: formatTime(s.heure_debut),
    heure_fin: formatTime(s.heure_fin),
    salle: s.salle || 'Non spécifiée',
    type: s.type_seance || 'Cours',
    matiere: s.matiere ? `Matière N°${s.matiere}` : 'Matière inconnue',
    professeur: s.enseignant ? `Professeur N°${s.enseignant}` : 'Non assigné'
  }))
}
