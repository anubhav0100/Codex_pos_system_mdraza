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
    { icon: Building2, label: 'Companies', href: '/super/companies', allowedScopes: [0], requiredPermission: 'COMPANIES_VIEW', color: 'rainbow-blue' },
    { icon: Users, label: 'Company Admins', href: '/super/company-admins', allowedScopes: [0], requiredPermission: 'COMPANY_ADMINS_VIEW', color: 'rainbow-blue' },
    { icon: ShieldCheck, label: 'Subscription Plans', href: '/super/subscription-plans', allowedScopes: [0], requiredPermission: 'SUBSCRIPTIONS_VIEW', color: 'rainbow-violet' },

    // Company Only
    { icon: Map, label: 'Scopes', href: '/scopes', allowedScopes: [0, 1], requiredPermission: 'SCOPES_VIEW', color: 'rainbow-cyan' },
    { icon: Users, label: 'Users', href: '/users', allowedScopes: [0, 1, 2, 3], requiredPermission: 'USERS_VIEW', color: 'rainbow-blue' },

    // POS (Local) Only
    { icon: ShoppingCart, label: 'POS', href: '/pos', allowedScopes: [4], requiredPermission: 'POS_SALES_VIEW', color: 'rainbow-green' },

    // Shared Inventory & Operations
    { icon: Package, label: 'Products', href: '/products', allowedScopes: [1], requiredPermission: 'PRODUCTS_VIEW', color: 'rainbow-blue' },
    { icon: Tags, label: 'Categories', href: '/categories', allowedScopes: [1], requiredPermission: 'PRODUCT_CATEGORIES_VIEW', color: 'rainbow-cyan' },
    { icon: Layers, label: 'Assignments', href: '/assignments', allowedScopes: [1], requiredPermission: 'PRODUCT_ASSIGNMENTS_VIEW', color: 'rainbow-violet' },
    { icon: Boxes, label: 'Inventory', href: '/inventory/balance', allowedScopes: [1, 2, 3, 4], requiredPermission: 'INVENTORY_VIEW', color: 'rainbow-orange' },
    { icon: Truck, label: 'Stock Requests', href: '/requests/outgoing', allowedScopes: [1, 2, 3, 4], requiredPermission: 'STOCK_REQUESTS_VIEW', color: 'rainbow-green' },
    { icon: ShieldCheck, label: 'Stock Approval', href: '/requests/inbox', allowedScopes: [1, 2, 3], requiredPermission: 'STOCK_REQUESTS_APPROVE', color: 'rainbow-violet' },

    // Transactions
    { icon: Wallet, label: 'Fund Wallet', href: '/wallets/fund', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'WALLET_ACCOUNTS_VIEW', color: 'rainbow-cyan' },
    { icon: Wallet, label: 'Income Wallet', href: '/wallets/income', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'WALLET_ACCOUNTS_VIEW', color: 'rainbow-violet' },
    { icon: ArrowRightLeft, label: 'Fund Requests', href: '/fund-requests', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'FUND_REQUESTS_VIEW', color: 'rainbow-orange' }, // Lower scopes REQUEST funds
    { icon: ArrowRightLeft, label: 'Fund Transfer', href: '/fund-transfer', allowedScopes: [0, 1, 2, 3], requiredPermission: 'FUND_REQUESTS_VIEW', color: 'rainbow-green' },
    { icon: ShieldCheck, label: 'Fund Approval', href: '/fund-approval', allowedScopes: [0, 1, 2, 3], requiredPermission: 'FUND_REQUESTS_APPROVE', color: 'rainbow-violet' },
    // Company/State/Dist TRANSFERS funds
    { icon: Wallet, label: 'Sales Incentive', href: '/wallets/incentive', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'WALLET_ACCOUNTS_VIEW', color: 'rainbow-orange' },
    { icon: FileText, label: 'Invoices', href: '/invoices', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'INVOICES_VIEW', color: 'rainbow-cyan' },

    // Reporting & Logs
    { icon: BarChart3, label: 'Reports', href: '/reports', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'REPORTS_VIEW', color: 'rainbow-violet' },
    { icon: History, label: 'Audit Logs', href: '/audit-logs', allowedScopes: [0, 1, 2, 3], requiredPermission: 'AUDIT_LOGS_VIEW', color: 'rainbow-violet' },
]
