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
  login: (token: string, profile: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userProfile: null,
      isAuthenticated: false,
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
