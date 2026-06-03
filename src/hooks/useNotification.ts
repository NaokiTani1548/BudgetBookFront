import { useState, useCallback } from 'react'

interface Notification {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

const initialState: Notification = {
  open: false,
  message: '',
  severity: 'info',
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification>(initialState)

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      setNotification({
        open: true,
        message,
        severity,
      })
    },
    []
  )

  const showSuccess = useCallback((message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'success',
    })
  }, [])

  const showError = useCallback((message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'error',
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }))
  }, [])

  // clearNotification は hideNotification のエイリアス
  const clearNotification = hideNotification

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    hideNotification,
    clearNotification,
  }
}