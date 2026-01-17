import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import DashboardPage from '@/screens/DashboardPage'
import LoginPage from '@/screens/auth/LoginPage'
import { ProtectedRoute } from '@/components/auth/protected-route'

import AccessDeniedPage from '@/screens/errors/AccessDeniedPage'
import CompaniesListPage from '@/screens/super/companies/CompaniesListPage'
import CompanyCreatePage from '@/screens/super/companies/CompanyCreatePage'
import CompanyEditPage from '@/screens/super/companies/CompanyEditPage'
import CompanyAdminsPage from '@/screens/super/companies/CompanyAdminsPage'

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
      {
        path: 'super/companies',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermission='COMPANIES_VIEW'>
                <CompaniesListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredPermission='COMPANIES_CREATE'>
                <CompanyCreatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermission='COMPANIES_EDIT'>
                <CompanyEditPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/admins',
            element: (
              <ProtectedRoute requiredPermission='COMPANIES_EDIT'>
                <CompanyAdminsPage />
              </ProtectedRoute>
            ),
          },
        ],
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
