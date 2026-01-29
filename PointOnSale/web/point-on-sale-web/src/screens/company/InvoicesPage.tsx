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
                title={<span className="bg-gradient-to-r from-rainbow-cyan via-rainbow-blue to-rainbow-violet bg-clip-text text-transparent font-bold">Invoices</span>}
                description='View and manage system invoices.'
            >
                <Button className='gap-2 bg-gradient-to-r from-rainbow-cyan middle:via-rainbow-blue to-rainbow-violet text-white border-0 vibrant-button'>
                    <FileText className='h-4 w-4' />
                    Export All
                </Button>
            </PageHeader>

            <div className='flex items-center gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input placeholder='Search invoices...' className='pl-9 glass-card border-none ring-1 ring-border/50' />
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
                    <DataTableRow className="hover:bg-white/5 transition-colors">
                        <DataTableCell className='font-bold text-rainbow-blue'>INV-001</DataTableCell>
                        <DataTableCell>TechCorp Solutions</DataTableCell>
                        <DataTableCell className="text-muted-foreground">2024-03-20</DataTableCell>
                        <DataTableCell className='font-black text-lg'>₹12,450.00</DataTableCell>
                        <DataTableCell><Badge className="bg-rainbow-green text-white border-0 shadow-lg shadow-rainbow-green/20">Paid</Badge></DataTableCell>
                        <DataTableCell className='text-right space-x-2'>
                            <Button variant='ghost' size='sm' className="vibrant-button bg-gradient-to-br from-rainbow-cyan to-rainbow-blue text-white border-0">View</Button>
                            <Button variant='ghost' size='sm' className="vibrant-button bg-gradient-to-br from-rainbow-violet via-rainbow-violet to-rainbow-violet text-white border-0">Edit</Button>
                        </DataTableCell>
                    </DataTableRow>
                    <DataTableRow className="hover:bg-white/5 transition-colors">
                        <DataTableCell className='font-bold text-rainbow-blue'>INV-002</DataTableCell>
                        <DataTableCell>RetailHub</DataTableCell>
                        <DataTableCell className="text-muted-foreground">2024-03-18</DataTableCell>
                        <DataTableCell className='font-black text-lg'>₹8,200.00</DataTableCell>
                        <DataTableCell><Badge className="bg-rainbow-yellow text-white border-0 shadow-lg shadow-rainbow-yellow/20">Pending</Badge></DataTableCell>
                        <DataTableCell className='text-right space-x-2'>
                            <Button variant='ghost' size='sm' className="vibrant-button bg-gradient-to-br from-rainbow-cyan to-rainbow-blue text-white border-0">View</Button>
                            <Button variant='ghost' size='sm' className="vibrant-button bg-gradient-to-br from-rainbow-violet via-rainbow-violet to-rainbow-violet text-white border-0">Edit</Button>
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
