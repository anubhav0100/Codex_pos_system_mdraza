import { cn } from '@/utils/utils'
import type { ReactNode } from 'react'

interface DataTableProps {
    headers: string[]
    children: ReactNode
    className?: string
}

export function DataTable({ headers, children, className }: DataTableProps) {
    return (
        <div className={cn('premium-card soft-shadow overflow-hidden', className)}>
            <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                    <thead className='text-xs text-muted-foreground uppercase bg-secondary/50 border-b'>
                        <tr>
                            {headers.map((header, i) => (
                                <th key={i} className='px-6 py-4 font-semibold'>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y'>{children}</tbody>
                </table>
            </div>
        </div>
    )
}

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <tr className={cn('hover:bg-secondary/30 transition-colors', className)}>{children}</tr>
    )
}

export function DataTableCell({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return <td className={cn('px-6 py-4 whitespace-nowrap', className)}>{children}</td>
}

