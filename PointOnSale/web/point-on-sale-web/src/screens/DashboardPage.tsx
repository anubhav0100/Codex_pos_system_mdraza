import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, Users, BarChart3, Plus, Building2, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/use-auth-store'

export default function DashboardPage() {
  const { userProfile } = useAuthStore()
  const isSuperAdmin = userProfile?.scopeType === 0

  return (
    <>
      <PageHeader
        title={<span className="gradient-text">{isSuperAdmin ? 'SuperAdmin Dashboard' : 'Dashboard'}</span>}
        description={isSuperAdmin ? 'Manage the entire POS ecosystem.' : 'Welcome back to your POS system.'}
        actions={
          !isSuperAdmin && (
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              New Sale
            </Button>
          )
        }
      />

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {isSuperAdmin ? (
          <>
            <StatCard
              title='Total Companies'
              value='24'
              icon={<Building2 className='h-4 w-4 text-white/80' />}
              trend={{ value: '+2', positive: true }}
              description='From last month'
              className='bg-gradient-to-br from-rainbow-blue via-rainbow-violet to-rainbow-red text-white hover-scale'
            />
            <StatCard
              title='Active Subscriptions'
              value='18'
              icon={<ShieldCheck className='h-4 w-4 text-white/80' />}
              trend={{ value: '+5%', positive: true }}
              description='From last month'
              className='bg-gradient-to-br from-rainbow-violet via-rainbow-red to-rainbow-orange text-white hover-scale'
            />
            <StatCard
              title='System Users'
              value='1,240'
              icon={<Users className='h-4 w-4 text-white/80' />}
              trend={{ value: '+12%', positive: true }}
              description='From last month'
              className='bg-gradient-to-br from-rainbow-cyan via-rainbow-blue to-rainbow-violet text-white hover-scale'
            />
            <StatCard
              title='Avg. Revenue'
              value='$4,200'
              icon={<BarChart3 className='h-4 w-4 text-white/80' />}
              description='Per company'
              className='bg-gradient-to-br from-rainbow-green via-rainbow-cyan to-rainbow-blue text-white hover-scale'
            />
          </>
        ) : (
          <>
            <StatCard
              title='Total Invoices'
              value='$24,500'
              icon={<ShoppingCart className='h-4 w-4 text-white/80' />}
              trend={{ value: '+12%', positive: true }}
              description='From last month'
              className='bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white hover-scale'
            />
            <StatCard
              title='Total Pending'
              value='$8,240'
              icon={<Package className='h-4 w-4 text-white/80' />}
              trend={{ value: '+5%', positive: false }}
              description='Requires attention'
              className='bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white hover-scale'
            />
            <StatCard
              title='Overdue'
              value='$2,100'
              icon={<ShieldCheck className='h-4 w-4 text-white/80' />}
              trend={{ value: '-8%', positive: false }}
              description='Over 30 days'
              className='bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white hover-scale'
            />
            <StatCard
              title='Avg Days Overdue'
              value='14'
              icon={<BarChart3 className='h-4 w-4 text-white/80' />}
              description='Improving'
              className='bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white hover-scale'
            />
            <StatCard
              title='Subcontracting'
              value='3 Active'
              icon={<Users className='h-4 w-4 text-white/80' />}
              description='Work orders'
              className='bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white hover-scale'
            />
          </>
        )}
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
    </>
  )
}
