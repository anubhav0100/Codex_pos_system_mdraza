import { ShoppingCart, Package, Users, BarChart3, Receipt, Settings } from 'lucide-react'

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
          <header className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
              <p className='text-muted-foreground'>Welcome back to your POS system.</p>
            </div>
            <div className='flex gap-4'>
              <button className='bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity'>
                New Sale
              </button>
            </div>
          </header>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <StatsCard title='Total Sales' value='$12,840' description='+12% from last month' />
            <StatsCard title='Orders' value='456' description='+5% from last month' />
            <StatsCard title='Customers' value='2,345' description='+18% from last month' />
            <StatsCard title='Low Stock' value='12 Items' description='Requires attention' />
          </div>

          <div className='mt-8 premium-card p-6 soft-shadow'>
            <h3 className='text-lg font-semibold mb-4'>Recent Activity</h3>
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center justify-between py-2 border-b last:border-0'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold'>
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <p className='font-medium'>Sale #INV-00{i}</p>
                      <p className='text-sm text-muted-foreground'>2 minutes ago</p>
                    </div>
                  </div>
                  <p className='font-bold'>$230.00</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-secondary text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'}`}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

function StatsCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className='premium-card p-6 soft-shadow'>
      <p className='text-sm font-medium text-muted-foreground'>{title}</p>
      <p className='text-2xl font-bold mt-1'>{value}</p>
      <p className='text-xs text-muted-foreground mt-1'>{description}</p>
    </div>
  )
}

export default App
