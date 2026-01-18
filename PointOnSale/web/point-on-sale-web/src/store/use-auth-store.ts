import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface UserProfile {
  userId: string
  fullName: string
  email: string
  scopeType: number
  scopeNodeId?: string
  companyId?: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  accessToken: string | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  hasPermission: (permCode: string) => boolean
  canAccessScope: (targetScopeNodeId: string) => boolean
  login: (token: string, profile: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userProfile: null,
      isAuthenticated: false,
      hasPermission: (permCode) => {
        const { userProfile } = get()
        if (!userProfile) return false
        return userProfile.permissions.includes('SUPER_ADMIN') || userProfile.permissions.includes(permCode)
      },
      canAccessScope: (targetScopeNodeId) => {
        const { userProfile } = get()
        if (!userProfile) return false
        if (!userProfile.scopeNodeId) return true
        return userProfile.scopeNodeId === targetScopeNodeId
      },
      login: (token, profile) =>
        set({
          accessToken: token,
          userProfile: profile,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          userProfile: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'pos-auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
