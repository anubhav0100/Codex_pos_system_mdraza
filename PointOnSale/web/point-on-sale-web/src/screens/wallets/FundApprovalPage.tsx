import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, ArrowDownLeft, MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { fundRequestsService } from '@/services/company/fund-requests-service'
import { toast } from 'sonner'
import { cn } from '@/utils/utils'

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function FundApprovalPage() {
    const queryClient = useQueryClient()
    const [rejectId, setRejectId] = useState<number | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['fund-requests', 'incoming'],
        queryFn: () => fundRequestsService.getMyRequests(true), // true for incoming
    })

    const approveMutation = useMutation({
        mutationFn: (id: number) => fundRequestsService.approveRequest(id),
        onSuccess: () => {
            toast.success('Request approved successfully')
            queryClient.invalidateQueries({ queryKey: ['fund-requests'] })
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Approval failed'),
    })

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) =>
            fundRequestsService.rejectRequest(id, { reason }),
        onSuccess: () => {
            toast.success('Request rejected')
            setRejectId(null)
            setRejectReason('')
            queryClient.invalidateQueries({ queryKey: ['fund-requests'] })
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Rejection failed'),
    })

    const handleRejectSubmit = () => {
        if (!rejectId || !rejectReason.trim()) {
            toast.error("Please provide a reason for rejection")
            return
        }
        rejectMutation.mutate({ id: rejectId, reason: rejectReason })
    }

    return (
        <div className='space-y-6'>
            <PageHeader
                title={<span className="gradient-text-rainbow">Fund Approval</span>}
                description='Review and process incoming fund requests from lower scopes.'
            />

            <div className='premium-card p-0 overflow-hidden soft-shadow border-none'>
                <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                    <h3 className="font-bold tracking-tight text-lg">Incoming Requests</h3>
                    <ArrowDownLeft className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <DataTable>
                    <thead>
                        <DataTableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                            <DataTableCell isHeader className="font-bold">Date</DataTableCell>
                            <DataTableCell isHeader className="font-bold">From Scope</DataTableCell>
                            <DataTableCell isHeader className="font-bold">Amount</DataTableCell>
                            <DataTableCell isHeader className="font-bold">Status</DataTableCell>
                            <DataTableCell isHeader className="font-bold">Notes</DataTableCell>
                            <DataTableCell isHeader className="font-bold text-right">Actions</DataTableCell>
                        </DataTableRow>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <DataTableRow><DataTableCell colSpan={6} className="py-20 text-center text-muted-foreground animate-pulse">Fetching incoming requests...</DataTableCell></DataTableRow>
                        ) : requests.length === 0 ? (
                            <DataTableRow><DataTableCell colSpan={6} className="py-20 text-center text-muted-foreground font-medium">No pending requests found.</DataTableCell></DataTableRow>
                        ) : (
                            requests.map(r => (
                                <DataTableRow key={r.id} className="hover:bg-muted/5 transition-colors">
                                    <DataTableCell className="text-sm font-medium">{new Date(r.requestedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</DataTableCell>
                                    <DataTableCell className="text-sm font-bold">{r.fromScopeName}</DataTableCell>
                                    <DataTableCell className="font-black tracking-tight text-rainbow-blue">{formatCurrency(r.amount)}</DataTableCell>
                                    <DataTableCell>
                                        <Badge
                                            variant='outline'
                                            className={cn(
                                                "font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm border-0 text-white",
                                                r.status === 'APPROVED' ? 'bg-gradient-to-r from-rainbow-green to-rainbow-cyan' :
                                                    r.status === 'REJECTED' ? 'bg-gradient-to-r from-rainbow-orange to-rainbow-red' :
                                                        'bg-amber-500' // Pending
                                            )}
                                        >
                                            {r.status}
                                        </Badge>
                                    </DataTableCell>
                                    <DataTableCell className="text-xs text-muted-foreground/80 max-w-[200px] truncate">{r.notes || '—'}</DataTableCell>
                                    <DataTableCell className='text-right'>
                                        {r.status === 'PENDING' && (
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    className='h-8 w-8 p-0 rounded-lg border-rainbow-green/30 text-rainbow-green hover:bg-rainbow-green hover:text-white transition-all'
                                                    onClick={() => approveMutation.mutate(r.id)}
                                                    disabled={approveMutation.isPending}
                                                >
                                                    <Check className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    className='h-8 w-8 p-0 rounded-lg border-rainbow-red/30 text-rainbow-red hover:bg-rainbow-red hover:text-white transition-all'
                                                    onClick={() => setRejectId(r.id)}
                                                    disabled={rejectMutation.isPending}
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        )}
                                        {r.status !== 'PENDING' && (
                                            <span className='text-[10px] font-bold text-muted-foreground/40 uppercase'>Processed</span>
                                        )}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        )}
                    </tbody>
                </DataTable>
            </div>

            <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
                <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-2xl soft-shadow-lg">
                    <div className="bg-gradient-to-r from-rainbow-orange/10 to-rainbow-red/10 p-6 border-b border-white/20">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight text-rainbow-red">Reject Request</DialogTitle>
                            <DialogDescription className="font-medium text-muted-foreground/80 text-sm">
                                Please provide a reason for rejecting this fund request.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className='p-6 space-y-4'>
                        <div className='space-y-2'>
                            <label className='text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1'>Rejection Reason</label>
                            <div className='relative'>
                                <MessageSquare className='absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/40' />
                                <Input
                                    className='h-12 pl-10 rounded-2xl border-none ring-1 ring-border/50 bg-card/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-rainbow-red/30 transition-all'
                                    placeholder='Specify why this request is being rejected...'
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='p-6 bg-muted/20 border-t flex gap-3'>
                        <Button variant='outline' onClick={() => setRejectId(null)} className='flex-1 h-11 rounded-2xl font-black uppercase tracking-widest text-xs border-none ring-1 ring-border/50 hover:bg-card'>Cancel</Button>
                        <Button
                            onClick={handleRejectSubmit}
                            disabled={rejectMutation.isPending}
                            className='flex-[2] h-11 bg-gradient-to-r from-rainbow-orange to-rainbow-red text-white border-0 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rainbow-red/30'
                        >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
