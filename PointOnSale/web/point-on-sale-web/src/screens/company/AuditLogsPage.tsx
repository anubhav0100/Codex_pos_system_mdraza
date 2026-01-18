import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Shield, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AuditLogsPage() {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Audit Logs'
                description='Track system changes and user activities.'
            />

            <DataTable>
                <thead>
                    <DataTableRow>
                        <DataTableCell isHeader>Timestamp</DataTableCell>
                        <DataTableCell isHeader>User</DataTableCell>
                        <DataTableCell isHeader>Action</DataTableCell>
                        <DataTableCell isHeader>Module</DataTableCell>
                        <DataTableCell isHeader>Details</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    <DataTableRow>
                        <DataTableCell className='h-full flex items-center gap-2'>
                            <Clock className='h-3 w-3 text-muted-foreground' />
                            {new Date().toLocaleString()}
                        </DataTableCell>
                        <DataTableCell>superadmin@pos.local</DataTableCell>
                        <DataTableCell><Badge variant='outline'>UPDATE</Badge></DataTableCell>
                        <DataTableCell>Companies</DataTableCell>
                        <DataTableCell className='text-sm italic'>Modified company 'XYZ' information</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell className='h-full flex items-center gap-2'>
                            <Clock className='h-3 w-3 text-muted-foreground' />
                            {new Date(Date.now() - 3600000).toLocaleString()}
                        </DataTableCell>
                        <DataTableCell>system-task</DataTableCell>
                        <DataTableCell><Badge variant='outline'>INIT</Badge></DataTableCell>
                        <DataTableCell>Database</DataTableCell>
                        <DataTableCell className='text-sm italic'>Executed automated backup</DataTableCell>
                    </DataTableRow>
                </tbody>
            </DataTable>

            <div className='flex flex-col items-center justify-center p-16 bg-secondary/10 rounded-lg border'>
                <Shield className='h-10 w-10 text-primary mb-4' />
                <h3 className='text-lg font-semibold'>Real-time Audit Streaming</h3>
                <p className='text-muted-foreground text-sm'>
                    Full-text searchable audit historical data is being indexed for the next release.
                </p>
            </div>
        </div>
    )
}
