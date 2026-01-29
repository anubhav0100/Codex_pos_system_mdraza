import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from '@/components/theme-provider'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryProvider>
        {children}
        <Toaster position='top-right' expand={false} richColors />
      </QueryProvider>
    </ThemeProvider>
  )
}
