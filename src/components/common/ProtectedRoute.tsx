import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Loading from './Loading'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}