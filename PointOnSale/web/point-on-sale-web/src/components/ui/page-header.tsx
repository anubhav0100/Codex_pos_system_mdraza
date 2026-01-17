import type { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8'>
            <div className='space-y-1'>
                <h2 className='text-3xl font-bold tracking-tight'>{title}</h2>
                {description && <p className='text-muted-foreground'>{description}</p>}
            </div>
            {actions && <div className='flex items-center gap-4'>{actions}</div>}
        </div>
    )
}
