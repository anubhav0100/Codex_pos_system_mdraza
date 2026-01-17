import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Package, Users, BarChart3, Plus } from 'lucide-react'

export default function DashboardPage() {
    return (
        <>
            <PageHeader
                title='Dashboard'
                description='Welcome back to your POS system.'
                actions={
                    <Button className='gap-2'>
                        <Plus className='h-4 w-4' />
                        New Sale
                    </Button>
                }
            />

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                    title='Total Sales'
                    value='$12,840'
                    icon={<ShoppingCart className='h-4 w-4' />}
                    trend={{ value: '+12%', positive: true }}
                    description='From last month'
                />
                <StatCard
                    title='Orders'
                    value='456'
                    icon={<Package className='h-4 w-4' />}
                    trend={{ value: '+5%', positive: true }}
                    description='From last month'
                />
                <StatCard
                    title='Customers'
                    value='2,345'
                    icon={<Users className='h-4 w-4' />}
                    trend={{ value: '+18%', positive: true }}
                    description='From last month'
                />
                <StatCard
                    title='Low Stock'
                    value='12'
                    icon={<BarChart3 className='h-4 w-4' />}
                    description='Items requiring attention'
                />
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
