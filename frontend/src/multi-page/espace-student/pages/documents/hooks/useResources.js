import { useState, useEffect } from 'react'
import { getResources } from '../../../api/services/documentsService'

export default function useResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResources()
      .then((data) => setResources(data))
      .catch((e) => console.error('useResources error', e))
      .finally(() => setLoading(false))
  }, [])

  return { resources, loading }
}
