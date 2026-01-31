import { useQuery, useQueryClient } from '@tanstack/react-query'
import { walletsService } from '@/services/company/wallets-service'
import { StatCard } from '@/components/ui/stat-card'
import { Wallet, Plus, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { cn } from '@/utils/utils'
import { PageHeader } from '@/components/ui/page-header'
import { RequestFundModal } from '@/components/wallets/request-fund-modal'

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function FundWalletPage() {
    const queryClient = useQueryClient()
    const [requestModalOpen, setRequestModalOpen] = useState(false)

    const { data: wallets = [] } = useQuery({
        queryKey: ['wallets-mine'],
        queryFn: () => walletsService.getWalletsMine(),
    })

    const fundWallet = wallets.find(w => w.walletType.toUpperCase() === 'FUND')

    if (!fundWallet && wallets.length > 0) return <div className="p-8 text-center text-muted-foreground font-medium">Fund Wallet not found.</div>
    if (!fundWallet) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading wallet information...</div>

    return (
        <div className='space-y-6'>
            <PageHeader
                title={<span className="gradient-text-rainbow">Fund Wallet</span>}
                description='Manage your operating funds and request balance from higher scopes.'
                actions={
                    <Button
                        onClick={() => setRequestModalOpen(true)}
                        className='vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 shadow-lg shadow-rainbow-blue/20 px-6 font-bold'
                    >
                        <Plus className='h-4 w-4 mr-2' />
                        Request Funds
                    </Button>
                }
            />

            <div className='grid gap-6 md:grid-cols-3'>
                <StatCard
                    title='Total Balance'
                    value={formatCurrency(fundWallet.balance)}
                    icon={<Wallet className='h-5 w-5 text-white/80' />}
                    description='Available for stock requests'
                    className='bg-gradient-to-br from-rainbow-blue to-rainbow-violet text-white hover-scale shadow-xl shadow-rainbow-blue/20 border-none'
                />
            </div>

            <FundWalletTransactions walletId={fundWallet.id} />

            <RequestFundModal
                open={requestModalOpen}
                onOpenChange={setRequestModalOpen}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['fund-requests'] })
                    queryClient.invalidateQueries({ queryKey: ['wallets-mine'] })
                }}
            />
        </div>
    )
}

function FundWalletTransactions({ walletId }: { walletId: number }) {
    const { data: ledger = [], isLoading } = useQuery({
        queryKey: ['wallet-ledger', walletId],
        queryFn: () => walletsService.getWalletLedger(String(walletId)),
    })

    return (
        <div className='premium-card p-0 overflow-hidden soft-shadow border-none'>
            <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-bold tracking-tight text-lg">Recent Transactions</h3>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <DataTable>
                <thead>
                    <DataTableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                        <DataTableCell isHeader className="font-bold">Date</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Type</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Ref</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Amount</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Notes</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow><DataTableCell colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse">Loading transaction history...</DataTableCell></DataTableRow>
                    ) : ledger.length === 0 ? (
                        <DataTableRow><DataTableCell colSpan={5} className="py-20 text-center text-muted-foreground font-medium">No transactions found in this wallet.</DataTableCell></DataTableRow>
                    ) : (
                        ledger.map((l: any) => (
                            <DataTableRow key={l.id} className="hover:bg-muted/5 transition-colors">
                                <DataTableCell className="text-sm font-medium">{new Date(l.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</DataTableCell>
                                <DataTableCell>
                                    <Badge
                                        className={cn(
                                            "font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm",
                                            l.toWalletId === walletId
                                                ? 'bg-gradient-to-r from-rainbow-green to-rainbow-cyan text-white border-0'
                                                : 'bg-gradient-to-r from-rainbow-orange to-rainbow-red text-white border-0'
                                        )}
                                    >
                                        {l.toWalletId === walletId ? 'CREDIT' : 'DEBIT'}
                                    </Badge>
                                </DataTableCell>
                                <DataTableCell className="text-[10px] font-mono text-muted-foreground/80 font-bold uppercase tracking-tighter">
                                    {l.refType} <span className="text-muted-foreground/40 font-normal">#</span>{l.refId}
                                </DataTableCell>
                                <DataTableCell className={cn("font-black tracking-tight", l.toWalletId === walletId ? "text-rainbow-green" : "text-rainbow-red")}>
                                    {l.toWalletId === walletId ? '+' : '-'}{formatCurrency(l.amount)}
                                </DataTableCell>
                                <DataTableCell className="text-xs text-muted-foreground/80 max-w-[240px] truncate">
                                    {l.notes || '—'}
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </tbody>
            </DataTable>
        </div>
    )
}
