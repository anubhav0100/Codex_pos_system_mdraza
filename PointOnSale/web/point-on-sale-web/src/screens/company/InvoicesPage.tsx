import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function InvoicesPage() {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Invoices'
                description='View and manage system invoices.'
            >
                <Button variant='outline' className='gap-2'>
                    <FileText className='h-4 w-4' />
                    Export All
                </Button>
            </PageHeader>

            <div className='flex items-center gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input placeholder='Search invoices...' className='pl-9' />
                </div>
            </div>

            <DataTable>
                <thead>
                    <DataTableRow>
                        <DataTableCell isHeader>Invoice #</DataTableCell>
                        <DataTableCell isHeader>Customer/Company</DataTableCell>
                        <DataTableCell isHeader>Date</DataTableCell>
                        <DataTableCell isHeader>Amount</DataTableCell>
                        <DataTableCell isHeader>Status</DataTableCell>
                        <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    <DataTableRow>
                        <DataTableCell className='font-medium'>INV-001</DataTableCell>
                        <DataTableCell>TechCorp Solutions</DataTableCell>
                        <DataTableCell>2024-03-20</DataTableCell>
                        <DataTableCell>₹12,450.00</DataTableCell>
                        <DataTableCell><Badge>Paid</Badge></DataTableCell>
                        <DataTableCell className='text-right'>
                            <Button variant='ghost' size='sm'>View</Button>
                        </DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell className='font-medium'>INV-002</DataTableCell>
                        <DataTableCell>RetailHub</DataTableCell>
                        <DataTableCell>2024-03-18</DataTableCell>
                        <DataTableCell>₹8,200.00</DataTableCell>
                        <DataTableCell><Badge variant='secondary'>Pending</Badge></DataTableCell>
                        <DataTableCell className='text-right'>
                            <Button variant='ghost' size='sm'>View</Button>
                        </DataTableCell>
                    </DataTableRow>
                </tbody>
            </DataTable>
            <div className='text-center p-12 border-2 border-dashed rounded-lg opacity-50'>
                <FileText className='h-12 w-12 mx-auto mb-4' />
                <h3 className='text-lg font-medium'>Invoices Implementation Coming Soon</h3>
                <p className='text-muted-foreground'>Detailed invoice management and PDF generation are under development.</p>
            </div>
        </div>
    )
}
