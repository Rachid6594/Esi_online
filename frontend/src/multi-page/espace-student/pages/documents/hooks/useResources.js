import { useState, useEffect, useCallback } from 'react'
import { getResources } from '../../../api/services/documentsService'

export default function useResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  // fetching seul : ne pose aucun etat de maniere synchrone, pour que l'effet
  // de montage reste exempt de setState synchrone
  const charger = useCallback(
    () =>
      getResources()
        .then((data) => setResources(data))
        .catch((e) => console.error('useResources error', e))
        .finally(() => setLoading(false)),
    []
  )

  // rechargement manuel, declenche par un evenement utilisateur
  const reload = useCallback(() => {
    setLoading(true)
    charger()
  }, [charger])

  useEffect(() => {
    charger()
  }, [charger])

  return { resources, loading, reload }
}
