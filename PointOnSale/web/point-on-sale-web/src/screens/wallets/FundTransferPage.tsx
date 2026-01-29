import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { fundRequestsService } from '@/services/company/fund-requests-service'

// Helper to format currency
const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function FundTransferPage() {
    const queryClient = useQueryClient()
    const [rejectOpen, setRejectOpen] = useState(false)
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    // Fetch INCOMING requests (requests needing my approval)
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['fund-requests', 'incoming'],
        queryFn: () => fundRequestsService.getMyRequests(true),
    })

    const approveMutation = useMutation({
        mutationFn: (id: number) => fundRequestsService.approveRequest(id),
        onSuccess: () => {
            toast.success('Request approved and funds transferred')
            queryClient.invalidateQueries({ queryKey: ['fund-requests'] })
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to approve request'),
    })

    const rejectMutation = useMutation({
        mutationFn: (payload: { id: number, reason: string }) => fundRequestsService.rejectRequest(payload.id, { reason: payload.reason }),
        onSuccess: () => {
            toast.success('Request rejected')
            setRejectOpen(false)
            setRejectReason('')
            setSelectedRequestId(null)
            queryClient.invalidateQueries({ queryKey: ['fund-requests'] })
        },
        onError: () => toast.error('Failed to reject request'),
    })

    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this transfer?')) {
            approveMutation.mutate(id)
        }
    }

    const handleRejectClick = (id: number) => {
        setSelectedRequestId(id)
        setRejectOpen(true)
    }

    const handleRejectSubmit = () => {
        if (selectedRequestId && rejectReason) {
            rejectMutation.mutate({ id: selectedRequestId, reason: rejectReason })
        }
    }

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Fund Transfer Requests'
                description='Approve or reject fund requests from subordinate scopes.'
            />

            <div className='rounded-md border bg-card'>
                <DataTable>
                    <thead>
                        <DataTableRow>
                            <DataTableCell isHeader>Date</DataTableCell>
                            <DataTableCell isHeader>From Scope</DataTableCell>
                            <DataTableCell isHeader>Amount</DataTableCell>
                            <DataTableCell isHeader>Status</DataTableCell>
                            <DataTableCell isHeader>Notes</DataTableCell>
                            <DataTableCell isHeader>Actions</DataTableCell>
                        </DataTableRow>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className='text-center py-4'>Loading...</DataTableCell>
                            </DataTableRow>
                        ) : requests.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={6} className='text-center py-4'>No pending requests found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            requests.map(r => (
                                <DataTableRow key={r.id}>
                                    <DataTableCell>{new Date(r.requestedAt).toLocaleDateString()}</DataTableCell>
                                    <DataTableCell>{r.fromScopeName || r.fromScopeNodeId}</DataTableCell>
                                    <DataTableCell>{formatCurrency(r.amount)}</DataTableCell>
                                    <DataTableCell>
                                        <Badge variant={r.status === 'APPROVED' ? 'default' : r.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                            {r.status}
                                        </Badge>
                                    </DataTableCell>
                                    <DataTableCell>{r.notes}</DataTableCell>
                                    <DataTableCell>
                                        {r.status === 'PENDING' && (
                                            <div className='flex items-center gap-2'>
                                                <Button size='sm' onClick={() => handleApprove(r.id)} disabled={approveMutation.isPending}>
                                                    <Check className='h-4 w-4 mr-1' /> Approve
                                                </Button>
                                                <Button size='sm' variant='destructive' onClick={() => handleRejectClick(r.id)} disabled={rejectMutation.isPending}>
                                                    <X className='h-4 w-4 mr-1' /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </DataTableCell>
                                </DataTableRow>
                            ))
                        )}
                    </tbody>
                </DataTable>
            </div>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>Please provide a reason for rejection.</DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
                        <Input
                            placeholder='Reason...'
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button variant='destructive' onClick={handleRejectSubmit} disabled={rejectMutation.isPending}>Reject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
