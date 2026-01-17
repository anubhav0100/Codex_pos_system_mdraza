import { useAuthStore } from '@/store/use-auth-store'
import type { ReactNode } from 'react'

interface PermissionGateProps {
  perm: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ perm, children, fallback = null }: PermissionGateProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  if (!hasPermission(perm)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
