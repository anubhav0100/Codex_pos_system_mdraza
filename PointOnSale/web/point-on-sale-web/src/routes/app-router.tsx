import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import DashboardPage from '@/screens/DashboardPage'
import LoginPage from '@/screens/auth/LoginPage'
import { ProtectedRoute } from '@/components/auth/protected-route'

import AccessDeniedPage from '@/screens/errors/AccessDeniedPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: '403',
        element: <AccessDeniedPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
