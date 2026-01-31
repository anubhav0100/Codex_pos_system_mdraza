import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ArrowRightLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { fundRequestsService } from '@/services/company/fund-requests-service'
import { RequestFundModal } from '@/components/wallets/request-fund-modal'
import { cn } from '@/utils/utils'

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function FundRequestsPage() {
    const queryClient = useQueryClient()
    const [createOpen, setCreateOpen] = useState(false)

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['fund-requests', 'outgoing'],
        queryFn: () => fundRequestsService.getMyRequests(false),
    })

    return (
        <div className='space-y-6'>
            <PageHeader
                title={<span className="gradient-text-rainbow">Fund Requests</span>}
                description='Track requests for funds sent to higher authorities.'
                actions={
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className='vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 shadow-lg shadow-rainbow-blue/20 px-6 font-bold'
                    >
                        <Plus className='h-4 w-4 mr-2' /> New Request
                    </Button>
                }
            />

            <div className='premium-card p-0 overflow-hidden soft-shadow border-none'>
                <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                    <h3 className="font-bold tracking-tight text-lg">Outgoing Requests</h3>
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <DataTable>
                    <thead>
                        <DataTableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                            <DataTableCell isHeader className="font-bold">Date</DataTableCell>
                            <DataTableCell isHeader className="font-bold">To Scope</DataTableCell>
                            <DataTableCell isHeader className="font-bold">Amount</DataTableCell>
                            <DataTableCell isHeader className="font-bold">Status</DataTableCell>
                            <DataTableCell isHeader className="font-bold">Notes</DataTableCell>
                        </DataTableRow>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <DataTableRow><DataTableCell colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse">Loading request history...</DataTableCell></DataTableRow>
                        ) : requests.length === 0 ? (
                            <DataTableRow><DataTableCell colSpan={5} className="py-20 text-center text-muted-foreground font-medium">No outgoing fund requests found.</DataTableCell></DataTableRow>
                        ) : (
                            requests.map(r => (
                                <DataTableRow key={r.id} className="hover:bg-muted/5 transition-colors">
                                    <DataTableCell className="text-sm font-medium">{new Date(r.requestedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</DataTableCell>
                                    <DataTableCell className="text-sm font-bold">{r.toScopeName || `ID: ${r.toScopeNodeId}`}</DataTableCell>
                                    <DataTableCell className="font-black tracking-tight text-rainbow-blue">{formatCurrency(r.amount)}</DataTableCell>
                                    <DataTableCell>
                                        <Badge
                                            variant='outline'
                                            className={cn(
                                                "font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm border-0 text-white",
                                                r.status === 'APPROVED' ? 'bg-gradient-to-r from-rainbow-green to-rainbow-cyan' :
                                                    r.status === 'REJECTED' ? 'bg-gradient-to-r from-rainbow-orange to-rainbow-red' :
                                                        'bg-muted text-muted-foreground'
                                            )}
                                        >
                                            {r.status}
                                        </Badge>
                                    </DataTableCell>
                                    <DataTableCell className="text-xs text-muted-foreground/80 max-w-[240px] truncate">{r.notes || '—'}</DataTableCell>
                                </DataTableRow>
                            ))
                        )}
                    </tbody>
                </DataTable>
            </div>

            <RequestFundModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['fund-requests'] })}
            />
        </div>
    )
}
