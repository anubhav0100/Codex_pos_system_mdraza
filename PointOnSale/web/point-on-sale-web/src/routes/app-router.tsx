import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import DashboardPage from '@/screens/DashboardPage'

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
        ],
    },
    {
        path: '/login',
        element: <div>Login Page Placeholder</div>,
    },
    {
        path: '*',
        element: <Navigate to='/' replace />,
    },
])

export function AppRouter() {
    return <RouterProvider router={router} />
}
