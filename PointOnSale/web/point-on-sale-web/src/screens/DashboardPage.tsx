import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Package, Users, BarChart3, Plus, Building2, ShieldCheck, Wallet, IndianRupee, Award } from 'lucide-react'
import { useAuthStore } from '@/store/use-auth-store'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { walletsService } from '@/services/company/wallets-service'

export default function DashboardPage() {
  const { userProfile } = useAuthStore()
  const isSuperAdmin = userProfile?.scopeType === 0

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets-mine'],
    queryFn: () => walletsService.getWalletsMine(),
    enabled: !isSuperAdmin
  })

  const fundBalance = wallets.find(w => w.walletType.toUpperCase() === 'FUND')?.balance || 0
  const incomeBalance = wallets.find(w => w.walletType.toUpperCase() === 'INCOME')?.balance || 0
  const incentiveBalance = wallets.find(w => w.walletType.toUpperCase() === 'SALESINCENTIVE')?.balance || 0

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

  return (
    <>
      <PageHeader
        title={<span className="gradient-text">{isSuperAdmin ? 'SuperAdmin Dashboard' : 'Dashboard'}</span>}
        description={isSuperAdmin ? 'Manage the entire POS ecosystem.' : 'Welcome back to your POS system.'}
        actions={
          !isSuperAdmin && (
            <Link to="/pos">
              <Button className='vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 shadow-lg shadow-rainbow-blue/20 px-6'>
                <Plus className='h-4 w-4 mr-2' />
                New Sale
              </Button>
            </Link>
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
              title='Fund Wallet'
              value={formatCurrency(fundBalance)}
              icon={<Wallet className='h-4 w-4 text-white/80' />}
              description='Operating funds'
              className='bg-gradient-to-br from-rainbow-blue to-rainbow-violet text-white hover-scale shadow-lg shadow-rainbow-blue/20'
            />
            <StatCard
              title='Incentive Wallet'
              value={formatCurrency(incentiveBalance)}
              icon={<Award className='h-4 w-4 text-white/80' />}
              description='Sales performance'
              className='bg-gradient-to-br from-rainbow-orange to-rainbow-red text-white hover-scale shadow-lg shadow-rainbow-orange/20'
            />
            <StatCard
              title='Income Wallet'
              value={formatCurrency(incomeBalance)}
              icon={<IndianRupee className='h-4 w-4 text-white/80' />}
              description='Earnings & Commissions'
              className='bg-gradient-to-br from-rainbow-green to-rainbow-cyan text-white hover-scale shadow-lg shadow-rainbow-green/20'
            />
            <StatCard
              title='Total Pending'
              value='₹8,240'
              icon={<Package className='h-4 w-4 text-white/80' />}
              trend={{ value: '+5%', positive: false }}
              description='Requires attention'
              className='bg-gradient-to-br from-rainbow-yellow via-rainbow-orange to-rainbow-red text-white hover-scale shadow-lg shadow-rainbow-orange/20'
            />
            <StatCard
              title='Overdue'
              value='₹2,100'
              icon={<ShieldCheck className='h-4 w-4 text-white/80' />}
              trend={{ value: '-8%', positive: false }}
              description='Over 30 days'
              className='bg-gradient-to-br from-rainbow-red via-rainbow-violet to-rainbow-blue text-white hover-scale shadow-lg shadow-rainbow-red/20'
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
