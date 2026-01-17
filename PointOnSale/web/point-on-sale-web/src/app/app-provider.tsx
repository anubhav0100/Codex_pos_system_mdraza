import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { QueryProvider } from './query-provider'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      {children}
      <Toaster position='top-right' expand={false} richColors />
    </QueryProvider>
  )
}
