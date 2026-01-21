import { Outlet } from 'react-router-dom'
import { SidebarNav } from './sidebar-nav'
import { Topbar } from './topbar'
import { SubscriptionExpiredDialog } from '@/components/company/SubscriptionExpiredDialog'

export function AppShell() {
  return (
    <div className='flex min-h-screen bg-background'>
      <div className='hidden md:block sticky top-0 h-screen'>
        <SidebarNav />
      </div>
      <div className='flex-1 flex flex-col'>
        <Topbar />
        <main className='flex-1 p-6 lg:p-10'>
          <div className='max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>
      <SubscriptionExpiredDialog />
    </div>
  )
}
