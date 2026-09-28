import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import AdminEtablissement from '@/multi-page/espace-admin/AdminEtablissement'

vi.mock('@/auth', () => ({
  getAccessToken: () => 'jeton-de-test',
  refreshAccessToken: vi.fn().mockResolvedValue(false),
  clearAuthAndRedirectToLogin: vi.fn(),
}))

const reponseJson = (corps) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(corps),
})

// React Router privilegie le segment statique, une route fixe
// /admin/etablissement/annees capterait la section annees avant le parametre :
// on suit donc la redirection avec un espion plutot qu avec une route
let cheminCourant = null

function EspionChemin() {
  const { pathname } = useLocation()
  // l'ecriture se fait dans un effet : affecter une variable externee pendant
  // le rendu est un effet de bord, que react-hooks/globals refuse
  useEffect(() => {
    cheminCourant = pathname
  }, [pathname])
  return null
}

function monter(section) {
  cheminCourant = null
  return render(
    <MemoryRouter initialEntries={[`/admin/etablissement/${section}`]}>
      <EspionChemin />
      <Routes>
        <Route path="/admin/etablissement/:section" element={<AdminEtablissement />} />
      </Routes>
    </MemoryRouter>
  )
}

const urlsAppelees = () =>
  fetch.mock.calls.map((c) => String(c[0])).map((u) => u.replace(/^.*\/api\/etablissement/, ''))

describe('AdminEtablissement, chargement des sections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = vi.fn().mockResolvedValue(reponseJson([]))
  })

  it('charge la seule section demandee pour les annees', async () => {
    monter('annees')
    await waitFor(() => expect(screen.queryByText('Chargement…')).not.toBeInTheDocument())
    expect(urlsAppelees()).toEqual(['/anneeacademiques/'])
  })

  it('charge aussi les sections dont le formulaire a besoin pour les classes', async () => {
    // la liste des classes depend des annees, niveaux et filieres : le
    // SECTIONS_A_CHARGER remplace ici un if/else imbrique
    monter('classes')
    await waitFor(() => expect(screen.queryByText('Chargement…')).not.toBeInTheDocument())
    expect(urlsAppelees().sort()).toEqual(['/anneeacademiques/', '/classes/', '/filieres/', '/niveaus/'])
  })

  it('charge niveaux et filieres pour les matieres, pas les annees', async () => {
    monter('matieres')
    await waitFor(() => expect(screen.queryByText('Chargement…')).not.toBeInTheDocument())
    expect(urlsAppelees().sort()).toEqual(['/filieres/', '/matieres/', '/niveaus/'])
  })

  it('affiche le titre de la section', async () => {
    monter('niveaux')
    expect(screen.getByRole('heading', { name: 'Niveaux' })).toBeInTheDocument()
  })

  it('redirige une section inconnue vers les annees', async () => {
    monter('section-inexistante')

    // la redirection retombe sur la route des annees, qui se monte et se charge
    expect(cheminCourant).toBe('/admin/etablissement/annees')
    await waitFor(() => expect(screen.queryByText('Chargement…')).not.toBeInTheDocument())
    expect(urlsAppelees()).toEqual(['/anneeacademiques/'])
  })

  it('signale une erreur de chargement sans rester bloque sur Chargement', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ detail: 'Panne du serveur' }),
    })

    monter('annees')

    expect(await screen.findByText('Panne du serveur')).toBeInTheDocument()
    expect(screen.queryByText('Chargement…')).not.toBeInTheDocument()
  })
})
