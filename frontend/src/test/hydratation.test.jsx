import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StrictMode, useEffect } from 'react'
import { renderToString } from 'react-dom/server'
import { useIsHydrated } from '@/hooks/useIsHydrated'

function QuiEstMonte() {
  return <span>{useIsHydrated() ? 'monte' : 'pas-monte'}</span>
}

function Compteur({ fetch }) {
  useEffect(() => {
    fetch()
  }, [fetch])
  return <span>ok</span>
}

describe('useIsHydrated', () => {
  it('renvoie false au rendu serveur, avant que le client ait pris la main', () => {
    // c est tout l interet du hook : sans cela, le HTML rendu par le serveur et
    // le premier rendu du client divergent et React signale une erreur
    // d hydratation
    expect(renderToString(<QuiEstMonte />)).toContain('pas-monte')
  })

  it('renvoie true des le premier rendu client', () => {
    render(<QuiEstMonte />)
    expect(screen.getByText('monte')).toBeInTheDocument()
  })

  it('ne provoque pas de rendu supplémentaire', () => {
    // useSyncExternalStore compare le snapshot au rendu suivant : si la valeur
    // changeait, React bouclerait
    const { rerender } = render(<QuiEstMonte />)
    rerender(<QuiEstMonte />)
    expect(screen.getByText('monte')).toBeInTheDocument()
  })
})

describe('effet de montage en StrictMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('declenche une seule fois le chargement hors StrictMode', () => {
    const fetch = vi.fn()
    render(<Compteur fetch={fetch} />)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('declenche deux fois en StrictMode, ce que React fait volontairement', () => {
    // le double appel en developpement est un comportement de React, pas un
    // defaut de l application : ce test le documente pour que la decision
    // reste visible si quelqu un introduit un cache plus tard
    const fetch = vi.fn()
    render(
      <StrictMode>
        <Compteur fetch={fetch} />
      </StrictMode>
    )
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
