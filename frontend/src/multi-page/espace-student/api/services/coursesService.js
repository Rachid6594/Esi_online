import { apiGet } from '../axiosConfig'
import { ENDPOINTS } from '../endpoints'

// Mapping des couleurs pour l'UI
const COLORS = ['orange', 'blue', 'green', 'purple', 'red', 'slate', 'teal', 'indigo']
const getColor = (id) => COLORS[(id || 0) % COLORS.length]

/**
 * Récupère la liste des cours de l'étudiant.
 * @returns {Promise<Array>}
 */
export async function getCourses() {
  const data = await apiGet(ENDPOINTS.COURSES)
  // Gestion de la pagination (si .results existe, on le prend)
  const results = data?.results || data || []
  
  // Adapter le format du backend vers le format UI
  return results.map(m => ({
    id: String(m.id),
    code: m.code || '',
    intitule: m.libelle || '',
    description: m.description || '',
    type: m.type_matiere || 'Cours',
    credits: m.credit || 0,
    couleur: getColor(m.id),
    // Les champs suivants n'existent pas forcément sur Matiere, on met des valeurs par défaut 
    // ou on les ignore si l'UI les gère de façon optionnelle.
    professeur: 'Non assigné', // A relier avec affectationenseignants plus tard
    horaire: 'Voir emploi du temps',
    salle: '-',
    filiere: m.filiere ? String(m.filiere) : '—',
    niveau: m.niveau ? String(m.niveau) : '—',
  }))
}

/**
 * Récupère le détail d'un cours (infos + contenu).
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getCourseDetail(id) {
  const m = await apiGet(ENDPOINTS.COURSE_DETAIL(id))
  if (!m) return null
  
  return {
    id: String(m.id),
    code: m.code || '',
    intitule: m.libelle || '',
    description: m.description || '',
    type: m.type_matiere || 'Cours',
    credits: m.credit || 0,
    couleur: getColor(m.id),
    professeur: 'Non assigné',
    horaire: 'Voir emploi du temps',
    salle: '-',
    filiere: m.filiere ? String(m.filiere) : '—',
    niveau: m.niveau ? String(m.niveau) : '—',
    // Le contenu détaillé (chapitres, sections) n'est pas fourni par l'endpoint par défaut
    objectifs: [],
    chapitres: []
  }
}

/**
 * Récupère le contenu pédagogique d'un cours.
 * (Laissée vide ou pointant vers une autre ressource si le backend a un endpoint spécifique)
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getCourseContent(id) {
  // Optionnel: si ENDPOINTS.COURSE_CONTENT existait
  // return apiGet(ENDPOINTS.COURSE_CONTENT(id))
  return null
}
