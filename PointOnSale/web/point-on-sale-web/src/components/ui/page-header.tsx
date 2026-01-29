import type { ReactNode } from 'react'
import { Button } from './button'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string | ReactNode
  description?: string
  actions?: ReactNode
  children?: ReactNode
  onBack?: () => void
}

export function PageHeader({ title, description, actions, children, onBack }: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8'>
      <div className='space-y-1.5'>
        <div className='flex items-center gap-2'>
          {onBack && (
            <Button variant='ghost' size='icon' onClick={onBack} className='-ml-2 h-8 w-8'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          )}
          <h2 className='text-3xl font-bold tracking-tight'>{title}</h2>
        </div>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>
      {(actions || children) && (
        <div className='flex items-center gap-4 py-1'>{actions || children}</div>
      )}
    </div>
  )
}
