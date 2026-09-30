import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CourseReader from '@/multi-page/espace-student/pages/cours/components/CourseReader'

const COURS = {
  id: 7,
  intitule: 'Algorithmique',
  chapitres: [
    { id: 'c1', titre: 'Chapitre un', sections: [{ id: 's1', titre: 'Section une' }] },
    { id: 'c2', titre: 'Chapitre deux', sections: [{ id: 's2', titre: 'Section deux' }] },
  ],
}

// jsdom n'a ni IntersectionObserver ni scrollIntoView, tous deux utilises par
// le composant pour le suivi de lecture
class FakeObserver {
  observe() {}
  disconnect() {}
}

function setLargeur(px) {
  Object.defineProperty(window, 'innerWidth', { value: px, writable: true, configurable: true })
}

const overlay = () => document.querySelector('.bg-black\\/30')

// le titre d'un chapitre apparait aussi dans le corps de lecture : on scope
// le sommaire pour ne pas lever l'ambiguite
const sommaire = () => within(screen.getByRole('navigation'))

describe('CourseReader', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    Element.prototype.scrollIntoView = vi.fn()
    setLargeur(1280)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('ouvre tous les chapitres par defaut', () => {
    render(<CourseReader course={COURS} onClose={vi.fn()} />)

    expect(sommaire().getByText('Chapitre un')).toBeInTheDocument()
    expect(sommaire().getByText('Section une')).toBeInTheDocument()
    expect(sommaire().getByText('Chapitre deux')).toBeInTheDocument()
    expect(sommaire().getByText('Section deux')).toBeInTheDocument()
  })

  it('ne replie que le chapitre clique', async () => {
    render(<CourseReader course={COURS} onClose={vi.fn()} />)

    await userEvent.click(sommaire().getByText('Chapitre un'))

    expect(sommaire().queryByText('Section une')).not.toBeInTheDocument()
    expect(sommaire().getByText('Chapitre deux')).toBeInTheDocument()
    expect(sommaire().getByText('Section deux')).toBeInTheDocument()
  })

  it('conserve le choix de l utilisateur quand la liste des chapitres change', async () => {
    const { rerender } = render(<CourseReader course={COURS} onClose={vi.fn()} />)

    await userEvent.click(sommaire().getByText('Chapitre un'))
    expect(sommaire().queryByText('Section une')).not.toBeInTheDocument()

    // le cours est recharge avec des donnees equivalentes : le chapitre replie
    // ne doit pas repartir ouvert
    rerender(
      <CourseReader
        course={{ ...COURS, chapitres: COURS.chapitres.map((c) => ({ ...c })) }}
        onClose={vi.fn()}
      />
    )

    expect(sommaire().queryByText('Section une')).not.toBeInTheDocument()
    expect(sommaire().getByText('Section deux')).toBeInTheDocument()
  })

  it('puis redeplie le chapitre au second clic', async () => {
    render(<CourseReader course={COURS} onClose={vi.fn()} />)

    await userEvent.click(sommaire().getByText('Chapitre un'))
    expect(sommaire().queryByText('Section une')).not.toBeInTheDocument()

    await userEvent.click(sommaire().getByText('Chapitre un'))
    expect(sommaire().getByText('Section une')).toBeInTheDocument()
  })

  it('ouvre la sidebar au montage sur desktop, sans effet', () => {
    setLargeur(1280)
    render(<CourseReader course={COURS} onClose={vi.fn()} />)

    expect(overlay()).not.toBeNull()
  })

  it('laisse la sidebar fermee sur mobile', () => {
    setLargeur(400)
    render(<CourseReader course={COURS} onClose={vi.fn()} />)

    expect(overlay()).toBeNull()
  })

  it('gere un cours sans chapitre', () => {
    render(<CourseReader course={{ id: 9, intitule: 'Vide', chapitres: [] }} onClose={vi.fn()} />)
    expect(screen.getAllByText('Sommaire')[0]).toBeInTheDocument()
  })
})
