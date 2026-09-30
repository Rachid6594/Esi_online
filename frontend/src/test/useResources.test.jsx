import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import useResources from '@/multi-page/espace-student/pages/documents/hooks/useResources'
import { getResources } from '@/multi-page/espace-student/api/services/documentsService'

vi.mock('@/multi-page/espace-student/api/services/documentsService', () => ({
  getResources: vi.fn(),
}))

const R1 = [{ id: 1, titre: 'Cours 1' }]
const R2 = [{ id: 1, titre: 'Cours 1' }, { id: 2, titre: 'TD 2' }]

describe('useResources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('demarre en chargement puis publie les ressources', async () => {
    getResources.mockResolvedValue(R1)
    const { result } = renderHook(() => useResources())

    expect(result.current.loading).toBe(true)
    expect(result.current.resources).toEqual([])

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.resources).toEqual(R1)
  })

  it('ne pose aucun etat de maniere synchrone pendant le rendu', () => {
    // le chargement est demarre par un effet, pas pendant le rendu : le premier
    // rendu doit donc exposer l'etat initial intact
    getResources.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useResources())

    expect(result.current.loading).toBe(true)
    expect(result.current.resources).toEqual([])
    expect(getResources).toHaveBeenCalledTimes(1)
  })

  it('reload republie les nouvelles donnees et repasse par loading', async () => {
    getResources.mockResolvedValueOnce(R1)
    const { result } = renderHook(() => useResources())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.resources).toEqual(R1)

    getResources.mockResolvedValueOnce(R2)
    act(() => result.current.reload())

    await waitFor(() => expect(result.current.resources).toEqual(R2))
    expect(result.current.loading).toBe(false)
    expect(getResources).toHaveBeenCalledTimes(2)
  })

  it('ne casse pas si le chargement echoue', async () => {
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
    getResources.mockRejectedValue(new Error('reseau'))

    const { result } = renderHook(() => useResources())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.resources).toEqual([])
    warn.mockRestore()
  })

  it('ne relance pas le fetching a chaque rendu', async () => {
    getResources.mockResolvedValue(R1)
    const { result, rerender } = renderHook(() => useResources())
    await waitFor(() => expect(result.current.loading).toBe(false))

    rerender()
    rerender()
    expect(getResources).toHaveBeenCalledTimes(1)
  })
})
