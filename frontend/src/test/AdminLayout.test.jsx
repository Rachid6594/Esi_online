import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'
import AdminLayout from '@/multi-page/espace-admin/AdminLayout'

vi.mock('@/auth', () => ({
  getAuth: () => ({ role: 'admin' }),
  clearAuth: vi.fn(),
  isAdmin: () => true,
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

const ETUDIANTS = 'Liste des étudiants'
// le lien de la section professeurs s'appelle simplement "Liste"
const PROFESSEURS = 'Liste'

/**
 * Navigation independante du menu, pour changer de route sans dependre de
 * l etat de l accordeon : c est ce qui permet de verifier qu une section
 * repliee le reste apres un aller-retour.
 */
function Navigateur() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/admin/etudiants/dashboard')}>vers etudiants</button>
      <button onClick={() => navigate('/admin/professeurs/liste')}>vers professeurs</button>
    </>
  )
}

function monter(route = '/admin/etudiants/dashboard') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Navigateur />
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="etudiants/:section" element={<div>page etudiants</div>} />
          <Route path="professeurs/:section" element={<div>page professeurs</div>} />
          <Route index element={<div>accueil admin</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

// le menu existe en deux exemplaires, sidebar desktop et tiroir mobile : on
// agit sur le premier, les deux partagent le meme state
const enTete = (nom) => screen.getAllByRole('button', { name: nom })[0]
const enSection = (nom) => screen.getAllByText(nom)

describe('AdminLayout, ouverture des sections du menu', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('ouvre la section qui contient la route courante', () => {
    monter('/admin/etudiants/dashboard')
    expect(enSection(ETUDIANTS).length).toBeGreaterThan(0)
  })

  it('laisse les autres sections repliees', () => {
    monter('/admin/etudiants/dashboard')
    expect(screen.queryByText(PROFESSEURS)).not.toBeInTheDocument()
  })

  it('replie la section au clic sur son en-tete', async () => {
    monter('/admin/etudiants/dashboard')

    expect(enSection(ETUDIANTS).length).toBeGreaterThan(0)
    await userEvent.click(enTete('Gestion des étudiants'))
    expect(screen.queryByText(ETUDIANTS)).not.toBeInTheDocument()
  })

  it('respecte le choix de l utilisateur apres un aller-retour', async () => {
    monter('/admin/etudiants/dashboard')

    // comportement change par le refactoring : avant, un effet rouvrait la
    // section a chaque entree dans la route et ecrasait le choix manuel
    await userEvent.click(enTete('Gestion des étudiants'))
    expect(screen.queryByText(ETUDIANTS)).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('vers professeurs'))
    expect(screen.getByText('page professeurs')).toBeInTheDocument()

    await userEvent.click(screen.getByText('vers etudiants'))
    expect(screen.getByText('page etudiants')).toBeInTheDocument()
    expect(screen.queryByText(ETUDIANTS)).not.toBeInTheDocument()
  })

  it('ouvre la section qu on vient d ouvrir manuellement', async () => {
    monter('/admin')

    expect(screen.queryByText(ETUDIANTS)).not.toBeInTheDocument()
    await userEvent.click(enTete('Gestion des étudiants'))
    expect(enSection(ETUDIANTS).length).toBeGreaterThan(0)
  })
})
