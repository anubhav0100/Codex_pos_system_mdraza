import type { ReactNode } from 'react'
import { FolderOpen } from 'lucide-react'
import { cn } from '@/utils/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-secondary/20',
        className,
      )}
    >
      <div className='p-4 bg-background rounded-full shadow-sm mb-4'>
        {icon || <FolderOpen className='h-8 w-8 text-muted-foreground/50' />}
      </div>
      <h3 className='text-lg font-semibold'>{title}</h3>
      <p className='text-sm text-muted-foreground mt-1 max-w-xs'>{description}</p>
      {action && <div className='mt-6'>{action}</div>}
    </div>
  )
}
