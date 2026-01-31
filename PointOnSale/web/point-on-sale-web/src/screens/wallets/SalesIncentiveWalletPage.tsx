import { useQuery } from '@tanstack/react-query'
import { walletsService } from '@/services/company/wallets-service'
import { StatCard } from '@/components/ui/stat-card'
import { Award, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function SalesIncentiveWalletPage() {
    const { data: wallets = [] } = useQuery({
        queryKey: ['wallets-mine'],
        queryFn: () => walletsService.getWalletsMine(),
    })

    const incentiveWallet = wallets.find(w => w.walletType.toUpperCase() === 'SALESINCENTIVE')

    if (!incentiveWallet && wallets.length > 0) return <div className="p-8 text-center text-muted-foreground font-medium">Sales Incentive Wallet not found.</div>
    if (!incentiveWallet) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading incentive details...</div>

    return (
        <div className='space-y-6'>
            <PageHeader
                title={<span className="gradient-text-rainbow">Sales Incentive Wallet</span>}
                description='Track your sales-based incentives and performance bonuses.'
            />

            <div className='grid gap-6 md:grid-cols-3'>
                <StatCard
                    title='Total Incentives'
                    value={formatCurrency(incentiveWallet.balance)}
                    icon={<Award className='h-5 w-5 text-white/80' />}
                    description='Earned through sales performance'
                    className='bg-gradient-to-br from-rainbow-orange to-rainbow-red text-white hover-scale shadow-xl shadow-rainbow-orange/20 border-none'
                />
            </div>

            <IncentiveWalletTransactions walletId={incentiveWallet.id} />
        </div>
    )
}

function IncentiveWalletTransactions({ walletId }: { walletId: number }) {
    const { data: ledger = [], isLoading } = useQuery({
        queryKey: ['wallet-ledger', walletId],
        queryFn: () => walletsService.getWalletLedger(String(walletId)),
    })

    return (
        <div className='premium-card p-0 overflow-hidden soft-shadow border-none'>
            <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-bold tracking-tight text-lg">Incentive History</h3>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <DataTable>
                <thead>
                    <DataTableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                        <DataTableCell isHeader className="font-bold">Date</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Type</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Amount</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Notes</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow><DataTableCell colSpan={4} className="py-20 text-center text-muted-foreground animate-pulse">Fetching incentive records...</DataTableCell></DataTableRow>
                    ) : ledger.length === 0 ? (
                        <DataTableRow><DataTableCell colSpan={4} className="py-20 text-center text-muted-foreground font-medium">No records found.</DataTableCell></DataTableRow>
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
                                <DataTableCell className={cn("font-black tracking-tight", l.toWalletId === walletId ? "text-rainbow-green" : "text-rainbow-red")}>
                                    {l.toWalletId === walletId ? '+' : '-'}{formatCurrency(l.amount)}
                                </DataTableCell>
                                <DataTableCell className="text-xs text-muted-foreground/80 max-w-[300px] truncate">
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
