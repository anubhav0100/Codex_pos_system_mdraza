import { cn } from '@/utils/utils'
import type { ReactNode } from 'react'

interface DataTableProps {
  children: ReactNode
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('premium-card soft-shadow overflow-hidden', className)}>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          {children}
        </table>
      </div>
    </div>
  )
}

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('border-b border-border/10 hover:bg-secondary/30 transition-colors last:border-0', className)}>{children}</tr>
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
        className={cn('px-6 py-4 font-bold text-foreground/80 uppercase text-xs tracking-wider border-b border-border/20', className)}
      >
        {children}
      </th>
    )
  }
  return (
    <td colSpan={colSpan} className={cn('px-6 py-4 whitespace-nowrap', className)}>
      {children}
    </td>
  )
}
