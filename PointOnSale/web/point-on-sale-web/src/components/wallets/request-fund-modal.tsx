import { useQuery, useMutation } from '@tanstack/react-query'
import { fundRequestsService, type CreateFundRequestDto } from '@/services/company/fund-requests-service'
import { scopesService, type ScopeNode } from '@/services/company/scopes-service'
import { useAuthStore } from '@/store/use-auth-store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

const flattenScopes = (nodes: ScopeNode[]): ScopeNode[] =>
    nodes.flatMap((node) => [node, ...(node.children ? flattenScopes(node.children) : [])])

interface RequestFundModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function RequestFundModal({ open, onOpenChange, onSuccess }: RequestFundModalProps) {
    const { userProfile } = useAuthStore()
    const [form, setForm] = useState<CreateFundRequestDto>({
        toScopeNodeId: 0,
        amount: 0,
        notes: ''
    })

    const { data: tree = [] } = useQuery({
        queryKey: ['scopes-tree'],
        queryFn: scopesService.getTree,
    })

    const allScopes = useMemo(() => flattenScopes(tree), [tree])

    const parentScopes = useMemo(() => {
        if (!userProfile) return []
        const myType = Number(userProfile.scopeType)
        // Parents have a LOWER scopeType value (Company:1, State:2, District:3, Local:4)
        return allScopes.filter(s => {
            const sType = Number(s.scopeType)
            return sType > 0 && sType < myType
        })
    }, [allScopes, userProfile])

    const createMutation = useMutation({
        mutationFn: (payload: CreateFundRequestDto) => fundRequestsService.createRequest(payload),
        onSuccess: () => {
            toast.success('Fund request submitted successfully')
            onOpenChange(false)
            onSuccess()
            setForm({ toScopeNodeId: 0, amount: 0, notes: '' })
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to submit fund request'
            toast.error(errorMsg)
        },
    })

    const handleSubmit = () => {
        if (!form.toScopeNodeId || !form.amount || form.amount <= 0) {
            toast.error("Please select a parent scope and enter a valid amount")
            return
        }
        createMutation.mutate(form)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none rounded-2xl soft-shadow-lg">
                <div className="bg-gradient-to-r from-rainbow-blue/10 via-rainbow-violet/10 to-rainbow-red/10 p-6 border-b border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight gradient-text-rainbow">Request Funds</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground/80">
                            Submit a request for funds from a higher scope (Company, State, or District).
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className='grow space-y-6 p-6'>
                    <div className='space-y-2 mb-4'>
                        <label className='text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1'>Select Approver (Parent Scope)</label>
                        <Select
                            value={form.toScopeNodeId ? String(form.toScopeNodeId) : ""}
                            onValueChange={val => setForm(prev => ({ ...prev, toScopeNodeId: Number(val) }))}
                        >
                            <SelectTrigger className="h-12 w-full rounded-2xl border-none ring-1 ring-border/50 bg-card/50 px-4 text-sm font-bold focus:ring-2 focus:ring-rainbow-blue/30 transition-all hover:bg-card">
                                <SelectValue placeholder="Select Approver Scope" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none soft-shadow-lg p-2 bg-card/95 backdrop-blur-xl">
                                {parentScopes.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-muted-foreground font-medium">
                                        No parent scopes found for your level.
                                    </div>
                                ) : (
                                    parentScopes.map(scope => (
                                        <SelectItem
                                            key={scope.id}
                                            value={String(scope.id)}
                                            className="font-bold text-sm rounded-xl focus:bg-gradient-to-r focus:from-rainbow-blue/10 focus:to-rainbow-violet/10 focus:text-inherit mb-1 last:mb-0"
                                        >
                                            {scope.name} <span className="text-[10px] text-muted-foreground ml-1">({String(scope.scopeType).toUpperCase()})</span>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <p className='text-[10px] text-muted-foreground px-1 font-medium italic opacity-70'>Only authorities from higher nodes can approve fund requests.</p>
                    </div>

                    <div className='space-y-2 mb-4'>
                        <label className='text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1'>Amount (INR)</label>
                        <Input
                            type='number'
                            placeholder='0.00'
                            className="h-12 rounded-2xl border-none ring-1 ring-border/50 bg-card/50 px-4 text-lg font-black tracking-tight focus-visible:ring-2 focus-visible:ring-rainbow-blue/30 transition-all"
                            value={form.amount || ''}
                            onChange={e => setForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1'>Notes (Reason)</label>
                        <Input
                            placeholder='e.g., Stock replenishment for Feb...'
                            className="h-12 rounded-2xl border-none ring-1 ring-border/50 bg-card/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-rainbow-blue/30 transition-all"
                            value={form.notes}
                            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="p-6 bg-muted/20 border-t flex gap-3">
                    <Button variant='outline' onClick={() => onOpenChange(false)} className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-none ring-1 ring-border/50 hover:bg-card">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="flex-[2] h-12 vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-rainbow-blue/30"
                    >
                        {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
