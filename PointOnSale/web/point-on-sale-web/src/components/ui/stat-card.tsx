import type { ReactNode } from 'react'
import { cn } from '@/utils/utils'

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: ReactNode
    trend?: {
        value: string
        positive?: boolean
    }
    className?: string
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
    return (
        <div className={cn('premium-card p-6 soft-shadow', className)}>
            <div className='flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>{title}</p>
                {icon && <div className='text-muted-foreground'>{icon}</div>}
            </div>
            <div className='flex items-baseline gap-2 mt-2'>
                <h4 className='text-2xl font-bold tracking-tight'>{value}</h4>
                {trend && (
                    <span
                        className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                            trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                        )}
                    >
                        {trend.value}
                    </span>
                )}
            </div>
            {description && <p className='text-xs text-muted-foreground mt-1'>{description}</p>}
        </div>
    )
}
