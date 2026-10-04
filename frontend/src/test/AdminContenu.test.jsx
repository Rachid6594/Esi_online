import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminContenu from '@/multi-page/espace-admin/AdminContenu'

/**
 * Non-regression sur l'espace contenu admin.
 *
 * La page était un stub : « Cette section sera remplie ultérieurement ».
 * Aucun dépôt n'était donc possible, alors que le formulaire d'un admin est
 * le seul endroit d'où un document peut être joint.
 */

vi.mock('@/auth', () => ({
  getAccessToken: () => 'jeton-de-test',
  refreshAccessToken: vi.fn().mockResolvedValue(false),
  clearAuthAndRedirectToLogin: vi.fn(),
}))

/** Comme une vraie Response : le composant lit text() et json(). */
const json = (corps, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  text: async () => JSON.stringify(corps),
  json: async () => corps,
})

const TYPES = [
  { valeur: 'Cours', libelle: 'Cours' },
  { valeur: 'Rapport', libelle: 'Rapport de stage ou mémoire' },
  { valeur: 'Exercice', libelle: 'Exercice' },
]

const CLASSES = [
  { id: 2, libelle: 'L1 groupe A' },
  { id: 3, libelle: 'L1 groupe B' },
]

const RESSOURCES = [
  {
    id: 7,
    titre: 'Rappels d’algorithmique',
    type_ressource: 'Rapport',
    auteur: 'Mme Alaoui',
    matiere: 1,
    classe: 2,
    annee_academique: 1,
    taille_fichier: 2048,
    created_at: '2026-01-15T08:30:00Z',
    is_public: true,
    fichier: 'uploads/admin/abc.pdf',
  },
]

/** Répond selon l'URL appelée, pour que la page charge ses référentiels. */
function fetchStub() {
  return vi.fn(async (url) => {
    const chemin = String(url)
    if (chemin.includes('/documents/types/')) return json(TYPES)
    if (chemin.includes('/classes/')) return json(CLASSES)
    if (chemin.includes('/ressources/')) return json(RESSOURCES)
    return json([])
  })
}

const urlsAppelees = () =>
  fetch.mock.calls.map((c) => String(c[0])).map((u) => u.replace(/^.*\/api\/etablissement/, ''))

/** Attend la fin du chargement : le bouton de dépôt est désactivé avant. */
async function attendreCharge() {
  return screen.findByRole('button', { name: /Déposer un document/i }, { timeout: 5000 })
}

async function ouvrirFormulaire() {
  await attendreCharge()
  await waitFor(() => expect(screen.getByRole('button', { name: /Déposer un document/i })).toBeEnabled())
  await userEvent.click(screen.getByRole('button', { name: /Déposer un document/i }))
  return screen.findByRole('dialog')
}

describe('AdminContenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.fetch = fetchStub()
  })

  describe('chargement', () => {
    it('charge les documents, les types et les référentiels des menus', async () => {
      render(<AdminContenu />)

      await screen.findByText('Rappels d’algorithmique')
      expect(urlsAppelees()).toEqual(
        expect.arrayContaining([
          '/documents/types/',
          '/ressources/',
          '/classes/',
          '/matieres/',
          '/anneeacademiques/',
          '/categories/',
        ])
      )
    })

    it('affiche les libellés de classe et non les identifiants', async () => {
      render(<AdminContenu />)
      await attendreCharge()

      // La table affiche le libellé résolu depuis /classes/.
      expect(await screen.findByText('L1 groupe A')).toBeInTheDocument()
      expect(screen.queryByText(/^Matière N°/)).not.toBeInTheDocument()
    })
  })

  describe('dépôt', () => {
    it('envoie un multipart vers /documents/depot/, pas vers le CRUD JSON', async () => {
      render(<AdminContenu />)
      await ouvrirFormulaire()

      await userEvent.type(screen.getByLabelText(/Titre/i), 'Devoir 1')
      // Un dépôt sans fichier ni lien est refusé en amont : le test du refus
      // est voisin. Ici on joint donc un vrai fichier.
      await userEvent.upload(
        screen.getByLabelText(/Fichier/i),
        new File(['%PDF-1.4'], 'devoir.pdf', { type: 'application/pdf' })
      )
      await userEvent.click(screen.getByRole('button', { name: /^Déposer$/ }))

      await waitFor(() => expect(urlsAppelees()).toContain('/documents/depot/'))

      const appel = fetch.mock.calls.find((c) => String(c[0]).includes('/documents/depot/'))
      const [, options] = appel
      expect(options.method).toBe('POST')
      // Le corps doit être un FormData : c'est ce qui permet de joindre le
      // fichier, impossible en JSON.
      expect(options.body).toBeInstanceOf(FormData)
      // Et aucun Content-Type manuel, sinon la frontière multipart est perdue.
      expect(options.headers?.['Content-Type']).toBeUndefined()

      const champs = Object.fromEntries(options.body.entries())
      expect(champs.titre).toBe('Devoir 1')
      expect(champs.fichier).toBeInstanceOf(File)
      expect(champs.fichier.name).toBe('devoir.pdf')
    })

    it('refuse un dépôt sans fichier ni lien avant d’appeler l’API', async () => {
      render(<AdminContenu />)
      await ouvrirFormulaire()

      await userEvent.type(screen.getByLabelText(/Titre/i), 'Document sans fichier')
      await userEvent.click(screen.getByRole('button', { name: /^Déposer$/ }))

      expect(
        await screen.findByText(/Joignez un fichier ou saisissez un lien/i)
      ).toBeInTheDocument()
      expect(urlsAppelees()).not.toContain('/documents/depot/')
    })

    it('affiche le message d’erreur renvoyé par le serveur', async () => {
      globalThis.fetch = vi.fn(async (url) => {
        const chemin = String(url)
        if (chemin.includes('/documents/depot/')) {
          return json({ detail: 'Extension non autorisée : .exe' }, { ok: false, status: 400 })
        }
        if (chemin.includes('/documents/types/')) return json(TYPES)
        return json([])
      })
      render(<AdminContenu />)
      await ouvrirFormulaire()

      await userEvent.type(screen.getByLabelText(/Titre/i), 'Pirate')
      const fichier = new File(['MZ'], 'virus.exe', { type: 'application/octet-stream' })
      await userEvent.upload(screen.getByLabelText(/Fichier/i), fichier)
      await userEvent.click(screen.getByRole('button', { name: /^Déposer$/ }))

      expect(await screen.findByText(/Extension non autorisée/i)).toBeInTheDocument()
    })
  })
})