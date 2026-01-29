import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { fundRequestsService, type CreateFundRequestDto } from '@/services/company/fund-requests-service'

// Helper to format currency
const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function FundRequestsPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [createOpen, setCreateOpen] = useState(false)

    // Hardcoded for now: Requesting FROM parent. 
    // In a real app, we might need a dropdown of parents if multiple exist, or just assume parent.
    // We'll need the Scope ID of the "To" node. 
    // Since we don't easily have it here without fetching Scope Tree, 
    // we might need a helper method or input.
    // For V1, let's ask user to input ToScopeNodeId or fetch it?
    // Ideally, valid "To" scopes should be fetched.
    // Let's use a simple input for ToScopeNodeId ID for now to unblock, or hardcode if simple hierarchy.
    const [form, setForm] = useState<CreateFundRequestDto>({
        toScopeNodeId: 0,
        amount: 0,
        notes: ''
    })

    // Fetch OUTGOING requests (requests I made)
    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['fund-requests', 'outgoing'],
        queryFn: () => fundRequestsService.getMyRequests(false),
    })

    const createMutation = useMutation({
        mutationFn: (payload: CreateFundRequestDto) => fundRequestsService.createRequest(payload),
        onSuccess: () => {
            toast.success('Fund request created')
            setCreateOpen(false)
            queryClient.invalidateQueries({ queryKey: ['fund-requests'] })
        },
        onError: (err) => toast.error('Failed to create request'),
    })

    const handleSubmit = () => {
        if (!form.toScopeNodeId || !form.amount) {
            toast.error("Please fill required fields")
            return
        }
        createMutation.mutate(form)
    }

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Fund Requests'
                description='Track requests for funds sent to higher authorities.'
                actions={
                    <Button onClick={() => setCreateOpen(true)} className='gap-2'>
                        <Plus className='h-4 w-4' /> New Request
                    </Button>
                }
            />

            <div className='rounded-md border bg-card'>
                <DataTable>
                    <thead>
                        <DataTableRow>
                            <DataTableCell isHeader>Date</DataTableCell>
                            <DataTableCell isHeader>To Scope</DataTableCell>
                            <DataTableCell isHeader>Amount</DataTableCell>
                            <DataTableCell isHeader>Status</DataTableCell>
                            <DataTableCell isHeader>Notes</DataTableCell>
                        </DataTableRow>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <DataTableRow>
                                <DataTableCell colSpan={5} className='text-center py-4'>Loading...</DataTableCell>
                            </DataTableRow>
                        ) : requests.length === 0 ? (
                            <DataTableRow>
                                <DataTableCell colSpan={5} className='text-center py-4'>No requests found</DataTableCell>
                            </DataTableRow>
                        ) : (
                            requests.map(r => (
                                <DataTableRow key={r.id}>
                                    <DataTableCell>{new Date(r.requestedAt).toLocaleDateString()}</DataTableCell>
                                    <DataTableCell>{r.toScopeName || r.toScopeNodeId}</DataTableCell>
                                    <DataTableCell>{formatCurrency(r.amount)}</DataTableCell>
                                    <DataTableCell>
                                        <Badge variant={r.status === 'APPROVED' ? 'default' : r.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                            {r.status}
                                        </Badge>
                                    </DataTableCell>
                                    <DataTableCell>{r.notes}</DataTableCell>
                                </DataTableRow>
                            ))
                        )}
                    </tbody>
                </DataTable>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Funds</DialogTitle>
                        <DialogDescription>Submit a request for funds from a higher scope.</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>To Scope ID (Parent)</label>
                            <Input
                                type='number'
                                placeholder='Enter Scope ID of Approver'
                                value={form.toScopeNodeId || ''}
                                onChange={e => setForm(prev => ({ ...prev, toScopeNodeId: Number(e.target.value) }))}
                            />
                            <p className='text-xs text-muted-foreground'>Enter the ID of the Company/State/District node you are requesting from.</p>
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Amount</label>
                            <Input
                                type='number'
                                placeholder='0.00'
                                value={form.amount || ''}
                                onChange={e => setForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Notes</label>
                            <Input
                                placeholder='Reason for funds...'
                                value={form.notes}
                                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={createMutation.isPending}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
