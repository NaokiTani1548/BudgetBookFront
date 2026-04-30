import { useState, useCallback } from 'react'

interface Notification {
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null)

  const showSuccess = useCallback((message: string) => {
    setNotification({ message, severity: 'success' })
  }, [])

  const showError = useCallback((message: string) => {
    setNotification({ message, severity: 'error' })
  }, [])

  const clearNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return {
    notification,
    showSuccess,
    showError,
    clearNotification,
  }
}