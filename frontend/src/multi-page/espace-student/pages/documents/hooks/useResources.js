import { useState, useEffect, useCallback } from 'react'
import { getResources } from '../../../api/services/documentsService'

export default function useResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    getResources()
      .then((data) => setResources(data))
      .catch((e) => console.error('useResources error', e))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { resources, loading, reload }
}
