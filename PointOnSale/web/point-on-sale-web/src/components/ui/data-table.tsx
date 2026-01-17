import { cn } from '@/utils/utils'
import type { ReactNode } from 'react'

interface DataTableProps {
  headers?: string[]
  children: ReactNode
  className?: string
}

export function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn('premium-card soft-shadow overflow-hidden', className)}>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          {headers && (
            <thead className='text-xs text-muted-foreground uppercase bg-secondary/50 border-b'>
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className='px-6 py-4 font-semibold text-foreground'>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className='divide-y text-foreground'>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('hover:bg-secondary/30 transition-colors', className)}>{children}</tr>
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
        className={cn('px-6 py-4 font-semibold text-foreground uppercase text-xs', className)}
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
