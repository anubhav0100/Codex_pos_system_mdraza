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
import SubscriptionPlansPage from '@/screens/super/subscriptions/SubscriptionPlansPage'
import ScopesTreePage from '@/screens/company/scopes/ScopesTreePage'
import ScopeCreateStatePage from '@/screens/company/scopes/ScopeCreateStatePage'
import ScopeCreateDistrictPage from '@/screens/company/scopes/ScopeCreateDistrictPage'
import ScopeCreateLocalPage from '@/screens/company/scopes/ScopeCreateLocalPage'
import UsersListPage from '@/screens/company/users/UsersListPage'
import UserCreatePage from '@/screens/company/users/UserCreatePage'
import UserEditPage from '@/screens/company/users/UserEditPage'

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
              <ProtectedRoute requiredPermission='COMPANY_ADMINS_READ'>
                <CompanyAdminsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'super/subscription-plans',
        element: (
          <ProtectedRoute requiredPermission='SUBSCRIPTIONS_READ'>
            <SubscriptionPlansPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'scopes',
        children: [
          {
            index: true,
            element: <Navigate to='tree' replace />,
          },
          {
            path: 'tree',
            element: (
              <ProtectedRoute requiredPermission='SCOPES_VIEW'>
                <ScopesTreePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new-state',
            element: (
              <ProtectedRoute requiredPermission='SCOPES_CREATE'>
                <ScopeCreateStatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new-district',
            element: (
              <ProtectedRoute requiredPermission='SCOPES_CREATE'>
                <ScopeCreateDistrictPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new-local',
            element: (
              <ProtectedRoute requiredPermission='SCOPES_CREATE'>
                <ScopeCreateLocalPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'users',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermission='USERS_VIEW'>
                <UsersListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredPermission='USERS_CREATE'>
                <UserCreatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermission='USERS_EDIT'>
                <UserEditPage />
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
