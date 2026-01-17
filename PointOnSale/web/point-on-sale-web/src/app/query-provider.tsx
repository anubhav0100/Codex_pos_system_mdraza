import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'

interface QueryProviderProps {
    children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    )

    return (
        <TanStackQueryClientProvider client={queryClient}>
            {children}
        </TanStackQueryClientProvider>
    )
}
