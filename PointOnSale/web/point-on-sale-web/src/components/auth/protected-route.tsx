import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/use-auth-store'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
  allowedScopeTypes?: number[]
}

export function ProtectedRoute({
  children,
  requiredPermission,
  allowedScopeTypes,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, userProfile } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to='/403' replace />
  }

  if (allowedScopeTypes && userProfile && !allowedScopeTypes.includes(userProfile.scopeType)) {
    return <Navigate to='/403' replace />
  }

  return <>{children}</>
}
