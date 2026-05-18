import { useState, useEffect } from 'react'
import { getNotifications } from '../../../api/services/notificationsService'

export default function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then((data) => setNotifications(data))
      .catch((e) => console.error('useNotifications error', e))
      .finally(() => setLoading(false))
  }, [])

  const unread = notifications.filter((n) => !n.lu)
  return { notifications, unread, loading }
}
