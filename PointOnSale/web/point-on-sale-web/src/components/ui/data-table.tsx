import { cn } from '@/utils/utils'
import type { ReactNode } from 'react'

interface DataTableProps {
  children: ReactNode
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('premium-card overflow-hidden', className)}>
      <div className='overflow-x-auto'>
        <table className='vivid-table w-full text-sm text-left'>
          {children}
        </table>
      </div>
    </div>
  )
}

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-secondary/20 dark:hover:bg-secondary/10 transition-colors', className)}>{children}</tr>
}

export function DataTableCell({
  children,
  className,
  isHeader,
  colSpan,
}: {
  children: ReactNode
  className?: string
  isHeader?: boolean
  colSpan?: number
}) {
  if (isHeader) {
    return (
      <th
        colSpan={colSpan}
        className={cn('px-6 py-5 font-bold text-foreground/70 uppercase text-xs tracking-widest border-b border-border', className)}
      >
        {children}
      </th>
    )
  }
  return (
    <td colSpan={colSpan} className={cn('px-6 py-4 border-b border-border/40 text-foreground/90', className)}>
      {children}
    </td>
  )
}
