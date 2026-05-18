import { useState, useEffect } from 'react'
import { getTimetable } from '../../../api/services/timetableService'

export default function useTimetable() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTimetable()
      .then((data) => setSlots(data))
      .catch((e) => console.error('useTimetable error', e))
      .finally(() => setLoading(false))
  }, [])

  return { slots, loading }
}
