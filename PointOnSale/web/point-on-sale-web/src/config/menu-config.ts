import {
    LayoutDashboard,
    Building2,
    Users,
    Package,
    Layers,
    Boxes,
    Truck,
    Wallet,
    FileText,
    BarChart3,
    History,
    ShieldCheck,
    Map,
    ShoppingCart,
    Tags,
    ArrowRightLeft,
} from 'lucide-react'

export interface MenuItem {
    icon: any
    label: string
    href: string
    requiredPermission?: string
    allowedScopes: number[] // 0: SuperAdmin, 1: Company, 2: State, 3: District, 4: Local
    color?: string
}

export const MENU_ITEMS: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', allowedScopes: [0, 1, 2, 3, 4], color: 'rainbow-violet' },

    // SuperAdmin Only
    { icon: Building2, label: 'Companies', href: '/super/companies', allowedScopes: [0], requiredPermission: 'COMPANIES_READ', color: 'rainbow-blue' },
    { icon: Users, label: 'Company Admins', href: '/super/company-admins', allowedScopes: [0], requiredPermission: 'COMPANY_ADMINS_READ', color: 'rainbow-blue' },
    { icon: ShieldCheck, label: 'Subscription Plans', href: '/super/subscription-plans', allowedScopes: [0], requiredPermission: 'SUBSCRIPTIONS_READ', color: 'rainbow-violet' },

    // Company Only
    { icon: Map, label: 'Scopes', href: '/scopes', allowedScopes: [0, 1], requiredPermission: 'SCOPES_READ', color: 'rainbow-cyan' },
    { icon: Users, label: 'Users', href: '/users', allowedScopes: [0, 1, 2, 3], requiredPermission: 'USERS_READ', color: 'rainbow-blue' },

    // POS (Local) Only
    { icon: ShoppingCart, label: 'POS', href: '/pos', allowedScopes: [4], requiredPermission: 'POS_SALES_CONFIRM_PAYMENT', color: 'rainbow-green' },

    // Shared Inventory & Operations
    { icon: Package, label: 'Products', href: '/products', allowedScopes: [1], requiredPermission: 'PRODUCTS_READ', color: 'rainbow-blue' },
    { icon: Tags, label: 'Categories', href: '/categories', allowedScopes: [1], requiredPermission: 'PRODUCT_CATEGORIES_READ', color: 'rainbow-cyan' },
    { icon: Layers, label: 'Assignments', href: '/assignments', allowedScopes: [1], requiredPermission: 'PRODUCT_ASSIGNMENTS_READ', color: 'rainbow-violet' },
    { icon: Boxes, label: 'Inventory', href: '/inventory/balance', allowedScopes: [1, 2, 3, 4], requiredPermission: 'INVENTORY_READ', color: 'rainbow-orange' },
    { icon: Truck, label: 'Stock Requests', href: '/requests/outgoing', allowedScopes: [1, 2, 3, 4], requiredPermission: 'STOCK_REQUESTS_READ', color: 'rainbow-green' },

    // Transactions
    { icon: Wallet, label: 'Fund Wallet', href: '/wallets/fund', allowedScopes: [1, 2, 3, 4], requiredPermission: 'WALLETS_VIEW', color: 'rainbow-cyan' },
    { icon: Wallet, label: 'Income Wallet', href: '/wallets/income', allowedScopes: [1, 2, 3, 4], requiredPermission: 'WALLETS_VIEW', color: 'rainbow-violet' },
    { icon: ArrowRightLeft, label: 'Fund Requests', href: '/fund-requests', allowedScopes: [2, 3, 4], requiredPermission: 'FUND_REQUESTS_CREATE', color: 'rainbow-orange' }, // Lower scopes REQUEST funds
    { icon: ArrowRightLeft, label: 'Fund Transfer', href: '/fund-transfer', allowedScopes: [1], requiredPermission: 'FUND_REQUESTS_APPROVE', color: 'rainbow-green' }, // Company TRANSFERS funds
    { icon: FileText, label: 'Invoices', href: '/invoices', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'INVOICES_READ', color: 'rainbow-cyan' },

    // Reporting & Logs
    { icon: BarChart3, label: 'Reports', href: '/reports', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'REPORTS_READ', color: 'rainbow-violet' },
    { icon: History, label: 'Audit Logs', href: '/audit-logs', allowedScopes: [0, 1, 2, 3], requiredPermission: 'AUDIT_LOGS_READ', color: 'rainbow-violet' },
]
