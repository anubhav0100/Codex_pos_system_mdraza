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
import ProductsListPage from '@/screens/company/products/ProductsListPage'
import ProductCreatePage from '@/screens/company/products/ProductCreatePage'
import ProductEditPage from '@/screens/company/products/ProductEditPage'
import CategoriesPage from '@/screens/company/products/CategoriesPage'
import ProductAssignmentsPage from '@/screens/company/assignments/ProductAssignmentsPage'
import InventoryBalancePage from '@/screens/inventory/InventoryBalancePage'
import InventoryLedgerPage from '@/screens/inventory/InventoryLedgerPage'
import StockRequestsOutgoingPage from '@/screens/requests/StockRequestsOutgoingPage'
import StockRequestsInboxPage from '@/screens/requests/StockRequestsInboxPage'
import WalletsPage from '@/screens/wallets/WalletsPage'
import WalletsLedgerPage from '@/screens/wallets/WalletsLedgerPage'
import InvoicesPage from '@/screens/company/InvoicesPage'
import ReportsPage from '@/screens/company/ReportsPage'
import AuditLogsPage from '@/screens/company/AuditLogsPage'

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
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermission='PRODUCTS_READ'>
                <ProductsListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredPermission='PRODUCTS_CREATE'>
                <ProductCreatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredPermission='PRODUCTS_UPDATE'>
                <ProductEditPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'categories',
        element: (
          <ProtectedRoute requiredPermission='PRODUCT_CATEGORIES_READ'>
            <CategoriesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'assignments',
        element: (
          <ProtectedRoute requiredPermission='PRODUCT_ASSIGNMENTS_VIEW'>
            <ProductAssignmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: <Navigate to='balance' replace />,
          },
          {
            path: 'balance',
            element: (
              <ProtectedRoute requiredPermission='INVENTORY_VIEW'>
                <InventoryBalancePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'ledger/:productId',
            element: (
              <ProtectedRoute requiredPermission='INVENTORY_VIEW'>
                <InventoryLedgerPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'adjust',
            element: (
              <ProtectedRoute requiredPermission='INVENTORY_ADJUST'>
                <InventoryBalancePage initialAdjustOpen returnTo='/inventory/balance' />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'requests',
        children: [
          {
            index: true,
            element: <Navigate to='outgoing' replace />,
          },
          {
            path: 'outgoing',
            element: (
              <ProtectedRoute requiredPermission='STOCK_REQUESTS_VIEW'>
                <StockRequestsOutgoingPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'inbox',
            element: (
              <ProtectedRoute requiredPermission='STOCK_REQUESTS_VIEW'>
                <StockRequestsInboxPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'stock-requests',
        element: <Navigate to='/requests/outgoing' replace />,
      },
      {
        path: 'wallets',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredPermission='WALLETS_VIEW'>
                <WalletsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'ledger',
            element: (
              <ProtectedRoute requiredPermission='WALLETS_VIEW'>
                <WalletsLedgerPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'invoices',
        element: (
          <ProtectedRoute requiredPermission='INVOICES_READ'>
            <InvoicesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredPermission='REPORTS_READ'>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <ProtectedRoute requiredPermission='AUDIT_LOGS_READ'>
            <AuditLogsPage />
          </ProtectedRoute>
        ),
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
