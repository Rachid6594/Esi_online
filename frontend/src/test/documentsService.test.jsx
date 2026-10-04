import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getResources, downloadResource, formatBytes } from '@/multi-page/espace-student/api/services/documentsService'
import { ENDPOINTS } from '@/multi-page/espace-student/api/endpoints'

/**
 * Non-regression sur deux defauts de l'espace documents etudiant.
 *
 * 1. Le service lisait /api/etablissement/ressources/, l'endpoint d'admin :
 *    liste non triee par visibilite, et cles etrangeres en cascade d'ids. Le
 *    mapping affichait donc « Matière N°5 » et les filtres se construisaient
 *    sur cette etiquette.
 * 2. Le bouton de telechargement ne telechargeait rien : il ignorait la
 *    reponse du serveur et fabriquait un .txt de recu a la place du
 *    document.
 */

vi.mock('@/multi-page/espace-student/api/axiosConfig', () => ({
  apiGet: vi.fn(),
  apiClient: vi.fn(),
}))

const { apiGet, apiClient } = await import('@/multi-page/espace-student/api/axiosConfig')

const PAYLOAD = [
  {
    id: 7,
    titre: 'Rappels d’algorithmique',
    description: 'Introduction à la complexité',
    type_ressource: 'Rapport',
    auteur: 'Mme Alaoui',
    matiere_id: 3,
    matiere_libelle: 'Algorithmique',
    classe_id: 2,
    classe_libelle: 'L1 groupe A',
    niveau_libelle: 'Licence 1',
    filiere_libelle: 'Informatique',
    annee_libelle: '2025-2026',
    categorie_libelle: null,
    taille_fichier: 2048,
    created_at: '2026-01-15T08:30:00Z',
    telechargeable: true,
    url_telechargement: '/api/eleve/documents/7/telecharger/',
  },
]

describe('documentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getResources', () => {
    it('lit l’endpoint de l’espace étudiant, pas celui de l’administration', async () => {
      apiGet.mockResolvedValue(PAYLOAD)

      await getResources()

      expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.DOCUMENTS)
      expect(apiGet).not.toHaveBeenCalledWith('/api/etablissement/ressources/')
    })

    it('renvoie les libellés, pas des identifiants', async () => {
      apiGet.mockResolvedValue(PAYLOAD)

      const [doc] = await getResources()

      expect(doc.matiere).toBe('Algorithmique')
      expect(doc.classe).toBe('L1 groupe A')
      expect(doc.niveau).toBe('Licence 1')
      expect(doc.filiere).toBe('Informatique')
      expect(doc.annee).toBe('2025-2026')
      expect(doc.matiere).not.toMatch(/N°\d/)
    })

    it('expose le champ auteur utilisé par la carte', async () => {
      apiGet.mockResolvedValue(PAYLOAD)

      const [doc] = await getResources()

      expect(doc.auteur).toBe('Mme Alaoui')
    })

    it('renvoie une liste vide quand l’API ne répond pas', async () => {
      apiGet.mockResolvedValue(null)

      await expect(getResources()).resolves.toEqual([])
    })
  })

  describe('downloadResource', () => {
    let clicked
    let createObjectURL
    let revokeObjectURL

    beforeEach(() => {
      clicked = []
      createObjectURL = vi.fn(() => 'blob:fake')
      revokeObjectURL = vi.fn()
      globalThis.URL.createObjectURL = createObjectURL
      globalThis.URL.revokeObjectURL = revokeObjectURL

      // Le service cree un lien et le clique : on le capture pour lire son nom.
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
        clicked.push({ href: this.href, download: this.download })
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    function reponseOk(entetes = {}) {
      return {
        ok: true,
        status: 200,
        blob: async () => new Blob(['contenu du vrai fichier']),
        headers: { get: (nom) => entetes[nom] ?? null },
      }
    }

    it('demande l’endpoint de téléchargement de l’espace', async () => {
      apiClient.mockResolvedValue(reponseOk())
      const [doc] = PAYLOAD.map((d) => ({
        ...d,
        urlTelechargement: d.url_telechargement,
        titre: d.titre,
      }))

      await downloadResource(doc)

      expect(apiClient).toHaveBeenCalledWith('/api/eleve/documents/7/telecharger/')
    })

    it('déclenche l’enregistrement du fichier reçu, pas un reçu .txt', async () => {
      apiClient.mockResolvedValue(
        reponseOk({ 'Content-Disposition': 'attachment; filename=rappels.pdf' })
      )

      await downloadResource({ urlTelechargement: '/api/eleve/documents/7/telecharger/', titre: 'Rappels' })

      // L'objet mis en telechargement est la reponse du serveur, pas un
      // .txt fabriqué à partir du titre.
      expect(createObjectURL).toHaveBeenCalledTimes(1)
      const blob = createObjectURL.mock.calls[0][0]
      expect(blob).toBeInstanceOf(Blob)
      expect(await blob.text()).toBe('contenu du vrai fichier')

      expect(clicked).toHaveLength(1)
      expect(clicked[0].href).toBe('blob:fake')
      // Le nom vient de l'en-tete serveur, qui slugifie le titre et remet
      // l'extension d'origine.
      expect(clicked[0].download).toBe('rappels.pdf')
    })

    it('retombe sur le titre quand l’en-tête Content-Disposition est absent', async () => {
      apiClient.mockResolvedValue(reponseOk())

      await downloadResource({ urlTelechargement: '/api/eleve/documents/7/telecharger/', titre: 'Rappels' })

      expect(clicked[0].download).toBe('Rappels')
    })

    it('lit le nom encodé en UTF-8 de Content-Disposition', async () => {
      apiClient.mockResolvedValue(
        reponseOk({
          'Content-Disposition': "attachment; filename=\"ascii.pdf\"; filename*=UTF-8''r%C3%A9sum%C3%A9%20final.pdf",
        })
      )

      await downloadResource({ urlTelechargement: '/api/eleve/documents/7/telecharger/', titre: 'Résumé' })

      expect(clicked[0].download).toBe('résumé final.pdf')
    })

    it('n inventionne rien quand le document n’a pas de fichier joint', async () => {
      await expect(
        downloadResource({ urlTelechargement: null, titre: 'Lien externe' })
      ).rejects.toThrow(/fichier joint/)
      expect(apiClient).not.toHaveBeenCalled()
    })

    it('lève une erreur quand le serveur refuse', async () => {
      apiClient.mockResolvedValue({ ok: false, status: 404 })

      await expect(
        downloadResource({ urlTelechargement: '/api/eleve/documents/7/telecharger/', titre: 'Rappels' })
      ).rejects.toThrow(/404/)
    })
  })

  describe('formatBytes', () => {
    it('formate les tailles', () => {
      expect(formatBytes(2048)).toBe('2 Ko')
      expect(formatBytes(5 * 1024 * 1024)).toBe('5 Mo')
      expect(formatBytes(0)).toBe('Inconnu')
    })
  })
})