import { useQuery } from '@tanstack/react-query'
import { walletsService } from '@/services/company/wallets-service'
import { StatCard } from '@/components/ui/stat-card'
import { ArrowDownRight, IndianRupee } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/utils'

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function IncomeWalletPage() {
    const { data: wallets = [] } = useQuery({
        queryKey: ['wallets-mine'],
        queryFn: () => walletsService.getWalletsMine(),
    })

    const incomeWallet = wallets.find(w => w.walletType === 'INCOME')

    if (!incomeWallet && wallets.length > 0) return <div className="p-8 text-center text-muted-foreground font-medium">Income Wallet not found.</div>
    if (!incomeWallet) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading income details...</div>

    return (
        <div className='space-y-6'>
            <PageHeader
                title={<span className="gradient-text-rainbow">Income Wallet</span>}
                description='Track your earnings, commissions, and relevant deductions.'
            />

            <div className='grid gap-6 md:grid-cols-3'>
                <StatCard
                    title='Total Earnings'
                    value={formatCurrency(incomeWallet.balance)}
                    icon={<IndianRupee className='h-5 w-5 text-white/80' />}
                    description='Withdrawable income balance'
                    className='bg-gradient-to-br from-rainbow-green to-rainbow-cyan text-white hover-scale shadow-xl shadow-rainbow-green/20 border-none'
                />
            </div>

            <IncomeWalletTransactions walletId={incomeWallet.id} />
        </div>
    )
}

function IncomeWalletTransactions({ walletId }: { walletId: number }) {
    const { data: ledger = [], isLoading } = useQuery({
        queryKey: ['wallet-ledger', walletId],
        queryFn: () => walletsService.getWalletLedger(String(walletId)),
    })

    return (
        <div className='premium-card p-0 overflow-hidden soft-shadow border-none'>
            <div className="p-6 border-b bg-muted/30 flex items-center justify-between">
                <h3 className="font-bold tracking-tight text-lg">Income Statements</h3>
                <ArrowDownRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <DataTable>
                <thead>
                    <DataTableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                        <DataTableCell isHeader className="font-bold">Date</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Type</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Amount</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Comm.</DataTableCell>
                        <DataTableCell isHeader className="font-bold">TDS</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Admin</DataTableCell>
                        <DataTableCell isHeader className="font-bold">Notes</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow><DataTableCell colSpan={7} className="py-20 text-center text-muted-foreground animate-pulse">Fetching financial records...</DataTableCell></DataTableRow>
                    ) : ledger.length === 0 ? (
                        <DataTableRow><DataTableCell colSpan={7} className="py-20 text-center text-muted-foreground font-medium">No income records available.</DataTableCell></DataTableRow>
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

                                <DataTableCell className="text-xs font-bold text-rainbow-blue/80">
                                    {l.commission > 0 ? formatCurrency(l.commission) : '—'}
                                </DataTableCell>
                                <DataTableCell className="text-xs font-bold text-rainbow-orange/80">
                                    {l.tds > 0 ? formatCurrency(l.tds) : '—'}
                                </DataTableCell>
                                <DataTableCell className="text-xs font-bold text-rainbow-red/80">
                                    {l.adminCharges > 0 ? formatCurrency(l.adminCharges) : '—'}
                                </DataTableCell>

                                <DataTableCell className="text-xs text-muted-foreground/80 max-w-[200px] truncate">
                                    {l.notes || '—'}
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </tbody>
            </DataTable>
        </div >
    )
}
