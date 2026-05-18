import { useState, useEffect } from 'react'
import { getCourses } from '../../../api/services/coursesService'

export default function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourses()
      .then((data) => setCourses(data))
      .catch((e) => console.error('useCourses error', e))
      .finally(() => setLoading(false))
  }, [])

  return { courses, loading }
}
