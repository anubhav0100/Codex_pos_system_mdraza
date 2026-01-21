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
} from 'lucide-react'

export interface MenuItem {
    icon: any
    label: string
    href: string
    requiredPermission?: string
    allowedScopes: number[] // 0: SuperAdmin, 1: Company, 2: State, 3: District, 4: Local
}

export const MENU_ITEMS: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', allowedScopes: [0, 1, 2, 3, 4] },

    // SuperAdmin Only
    { icon: Building2, label: 'Companies', href: '/super/companies', allowedScopes: [0], requiredPermission: 'COMPANIES_READ' },
    { icon: Users, label: 'Company Admins', href: '/super/company-admins', allowedScopes: [0], requiredPermission: 'COMPANY_ADMINS_READ' },
    { icon: ShieldCheck, label: 'Subscription Plans', href: '/super/subscription-plans', allowedScopes: [0], requiredPermission: 'SUBSCRIPTIONS_READ' },

    // Company Only
    { icon: Map, label: 'Scopes', href: '/scopes', allowedScopes: [0, 1], requiredPermission: 'SCOPES_READ' },
    { icon: Users, label: 'Users', href: '/users', allowedScopes: [0, 1, 2, 3], requiredPermission: 'USERS_READ' },

    // POS (Local) Only
    { icon: ShoppingCart, label: 'POS', href: '/pos', allowedScopes: [4], requiredPermission: 'POS_SALES_CONFIRM_PAYMENT' },

    // Shared Inventory & Operations
    { icon: Package, label: 'Products', href: '/products', allowedScopes: [1], requiredPermission: 'PRODUCTS_READ' },
    { icon: Tags, label: 'Categories', href: '/categories', allowedScopes: [1], requiredPermission: 'PRODUCT_CATEGORIES_READ' },
    { icon: Layers, label: 'Assignments', href: '/assignments', allowedScopes: [1], requiredPermission: 'PRODUCT_ASSIGNMENTS_READ' },
    { icon: Boxes, label: 'Inventory', href: '/inventory/balance', allowedScopes: [1, 2, 3, 4], requiredPermission: 'INVENTORY_READ' },
    { icon: Truck, label: 'Stock Requests', href: '/requests/outgoing', allowedScopes: [1, 2, 3, 4], requiredPermission: 'STOCK_REQUESTS_READ' },
    { icon: Wallet, label: 'Wallets', href: '/wallets', allowedScopes: [1, 2, 3, 4], requiredPermission: 'WALLET_ACCOUNTS_READ' },
    { icon: FileText, label: 'Invoices', href: '/invoices', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'INVOICES_READ' },

    // Reporting & Logs
    { icon: BarChart3, label: 'Reports', href: '/reports', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'REPORTS_READ' },
    { icon: History, label: 'Audit Logs', href: '/audit-logs', allowedScopes: [0, 1, 2, 3], requiredPermission: 'AUDIT_LOGS_READ' },
]
