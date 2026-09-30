import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Les composants Radix (Select, Dialog…) mesurent leurs déclencheurs avec
 * ResizeObserver, absent de jsdom. Sans ce bouchon, ouvrir une liste déroulante
 * ou une modale lève « ResizeObserver is not defined » au montage.
 */
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

afterEach(() => {
  cleanup()
})