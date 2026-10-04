import { useSyncExternalStore } from 'react'

// next-themes ne connait le theme resolu qu'apres hydratation cote client.
// Sans cela le HTML rendu par le serveur ne correspond pas au premier rendu
// client et React signale une erreur d'hydratation.
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * @returns {boolean} false pendant le rendu serveur, true apres l'hydratation
 */
export function useIsHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
