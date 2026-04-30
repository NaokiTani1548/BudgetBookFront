import { Snackbar, Alert } from '@mui/material'

interface Props {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

export default function Notification({ open, message, severity, onClose }: Props) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
      <Alert severity={severity} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  )
}