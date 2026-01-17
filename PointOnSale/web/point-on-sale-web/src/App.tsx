import { ShoppingCart, Package, Users, BarChart3, Receipt, Settings } from 'lucide-react'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className='min-h-screen bg-background font-sans antialiased'>
      {/* Sidebar Placeholder */}
      <div className='flex'>
        <aside className='w-64 border-r bg-card h-screen sticky top-0 hidden md:block'>
          <div className='p-6'>
            <h1 className='text-2xl font-bold tracking-tight text-primary'>PointOnSale</h1>
          </div>
          <nav className='px-4 space-y-2'>
            <NavItem icon={<ShoppingCart className='w-4 h-4' />} label='Dashboard' active />
            <NavItem icon={<Package className='w-4 h-4' />} label='Inventory' />
            <NavItem icon={<Users className='w-4 h-4' />} label='Customers' />
            <NavItem icon={<Receipt className='w-4 h-4' />} label='Invoices' />
            <NavItem icon={<BarChart3 className='w-4 h-4' />} label='Reports' />
            <NavItem icon={<Settings className='w-4 h-4' />} label='Settings' />
          </nav>
        </aside>

        <main className='flex-1 p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-secondary text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className='premium-card p-6 soft-shadow'>
      <p className='text-sm font-medium text-muted-foreground'>{title}</p>
      <p className='text-2xl font-bold mt-1'>{value}</p>
      <p className='text-xs text-muted-foreground mt-1'>{description}</p>
    </div>
  )
}

export { StatsCard }
export default App
