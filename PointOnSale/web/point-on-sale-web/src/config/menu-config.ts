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
    { icon: Building2, label: 'Companies', href: '/companies', allowedScopes: [0], requiredPermission: 'COMPANIES_VIEW' },
    { icon: Users, label: 'Company Admins', href: '/company-admins', allowedScopes: [0], requiredPermission: 'COMPANY_ADMINS_VIEW' },
    { icon: ShieldCheck, label: 'Subscription Plans', href: '/super/subscription-plans', allowedScopes: [0], requiredPermission: 'SUBSCRIPTIONS_READ' },

    // Company Only
    { icon: Map, label: 'Scopes', href: '/scopes', allowedScopes: [1], requiredPermission: 'SCOPES_VIEW' },
    { icon: Users, label: 'Users', href: '/users', allowedScopes: [1, 2, 3], requiredPermission: 'USERS_VIEW' },

    // POS (Local) Only
    { icon: ShoppingCart, label: 'POS', href: '/pos', allowedScopes: [4], requiredPermission: 'POS_ACCESS' },

    // Shared Inventory & Operations
    { icon: Package, label: 'Products', href: '/products', allowedScopes: [1], requiredPermission: 'PRODUCTS_READ' },
    { icon: Tags, label: 'Categories', href: '/categories', allowedScopes: [1], requiredPermission: 'PRODUCT_CATEGORIES_READ' },
    { icon: Layers, label: 'Assignments', href: '/assignments', allowedScopes: [1], requiredPermission: 'ASSIGNMENTS_VIEW' },
    { icon: Boxes, label: 'Inventory', href: '/inventory', allowedScopes: [1, 2, 3, 4], requiredPermission: 'INVENTORY_VIEW' },
    { icon: Truck, label: 'Stock Requests', href: '/stock-requests', allowedScopes: [1, 2, 3, 4], requiredPermission: 'STOCK_REQUESTS_VIEW' },
    { icon: Wallet, label: 'Wallets', href: '/wallets', allowedScopes: [1, 2, 3, 4], requiredPermission: 'WALLETS_VIEW' },
    { icon: FileText, label: 'Invoices', href: '/invoices', allowedScopes: [1, 2, 3, 4], requiredPermission: 'INVOICES_VIEW' },

    // Reporting & Logs
    { icon: BarChart3, label: 'Reports', href: '/reports', allowedScopes: [0, 1, 2, 3, 4], requiredPermission: 'REPORTS_VIEW' },
    { icon: History, label: 'Audit Logs', href: '/audit-logs', allowedScopes: [0, 1, 2, 3], requiredPermission: 'AUDIT_LOGS_VIEW' },
]
