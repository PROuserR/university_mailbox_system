'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function NavigationFix() {
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (performance.navigation?.type === 2) {
                window.location.reload()
            }
        }

        const handlePopState = () => {
            router.refresh()
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [router])

    return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
                gcTime: 0,
                refetchOnMount: true,
                refetchOnWindowFocus: true,
                refetchOnReconnect: true,
                retry: 1,
            },
            mutations: {
                retry: 1,
            }
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <NavigationFix />
            {children}
        </QueryClientProvider>
    )
}