import { PageHeader } from '@/components/ui/page-header'
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'

export default function ReportsPage() {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Reports'
                description='System-wide analytics and performance metrics.'
            />

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                <StatCard
                    title='Revenue Growth'
                    value='+24%'
                    icon={<TrendingUp className='h-4 w-4' />}
                    description='Compared to last quarter'
                />
                <StatCard
                    title='Active Users'
                    value='1,240'
                    icon={<Users className='h-4 w-4' />}
                    description='Total platform users'
                />
                <StatCard
                    title='Total Sales'
                    value='15,234'
                    icon={<ShoppingBag className='h-4 w-4' />}
                    description='All-time orders'
                />
                <StatCard
                    title='System Health'
                    value='99.9%'
                    icon={<BarChart3 className='h-4 w-4' />}
                    description='Uptime'
                />
            </div>

            <div className='flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl space-y-4'>
                <BarChart3 className='h-16 w-16 text-muted-foreground/40' />
                <h2 className='text-2xl font-bold'>Advanced Reporting Under Implementation</h2>
                <p className='text-muted-foreground text-center max-w-md'>
                    We are currently building comprehensive charts and downloadable reports for sales, inventory, and user activity.
                </p>
            </div>
        </div>
    )
}
