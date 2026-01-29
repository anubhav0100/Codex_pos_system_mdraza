import { useQuery } from '@tanstack/react-query'
import { walletsService } from '@/services/company/wallets-service'
import { StatCard } from '@/components/ui/stat-card'
import { Wallet } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function IncomeWalletPage() {
    const { data: wallets = [] } = useQuery({
        queryKey: ['wallets-mine'],
        queryFn: () => walletsService.getWalletsMine(),
    })

    const incomeWallet = wallets.find(w => w.walletType === 'INCOME')

    if (!incomeWallet && wallets.length > 0) return <div>Income Wallet not found.</div>
    if (!incomeWallet) return <div className="p-8">Loading wallet...</div>

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Income Wallet'
                description='Track your earnings, commissions, and charges.'
            />

            <div className='grid gap-6 md:grid-cols-3'>
                <StatCard
                    title='Income Balance'
                    value={formatCurrency(incomeWallet.balance)}
                    icon={<Wallet className='h-4 w-4' />}
                    description='Withdrawable earnings'
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

    // Ledger item should now have adminCharges, tds, commission if updated backend
    // But frontend service might need update if I haven't done it yet.
    // I updated backend controller, and DTO. Frontend receives whatever JSON backend sends.
    // So 'l.adminCharges' should exist if backend definition used CamelCase formatter (standard).
    // Controller DTO uses PascalCase in C#, but default JSON serializer is CamelCase. So 'adminCharges', 'tds', 'commission'.

    return (
        <div className='rounded-md border bg-card'>
            <div className="p-4 font-semibold">Income Transactions</div>
            <DataTable>
                <thead>
                    <DataTableRow>
                        <DataTableCell isHeader>Date</DataTableCell>
                        <DataTableCell isHeader>Type</DataTableCell>
                        <DataTableCell isHeader>Amount</DataTableCell>
                        <DataTableCell isHeader>Commission</DataTableCell>
                        <DataTableCell isHeader>TDS</DataTableCell>
                        <DataTableCell isHeader>Admin Charges</DataTableCell>
                        <DataTableCell isHeader>Notes</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow><DataTableCell colSpan={7}>Loading...</DataTableCell></DataTableRow>
                    ) : (
                        ledger.map((l: any) => (
                            <DataTableRow key={l.id}>
                                <DataTableCell>{new Date(l.createdAt).toLocaleDateString()}</DataTableCell>
                                <DataTableCell>
                                    <Badge variant={l.toWalletId === walletId ? 'default' : 'destructive'}>
                                        {l.toWalletId === walletId ? 'CREDIT' : 'DEBIT'}
                                    </Badge>
                                </DataTableCell>
                                <DataTableCell>{formatCurrency(l.amount)}</DataTableCell>
                                {/* Displaying extra fields req by user: "income transaction credit debit admin changes/commision,tds etc fields" */}
                                <DataTableCell>{l.commission ? formatCurrency(l.commission) : '-'}</DataTableCell>
                                <DataTableCell>{l.tds ? formatCurrency(l.tds) : '-'}</DataTableCell>
                                <DataTableCell>{l.adminCharges ? formatCurrency(l.adminCharges) : '-'}</DataTableCell>
                                <DataTableCell>{l.notes}</DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </tbody>
            </DataTable>
        </div>
    )
}
