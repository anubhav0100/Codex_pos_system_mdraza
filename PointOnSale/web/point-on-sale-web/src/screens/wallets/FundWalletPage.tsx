import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/page-header'
import WalletsLedgerPage from './WalletsLedgerPage' // Reuse the ledger logic but we might need to filter it.

// For now, let's reuse WalletsLedgerPage but wrap it or customize it.
// Actually, WalletsLedgerPage fetches ledger for a "walletId". 
// But we don't know the walletId of "Fund" wallet without fetching wallets first.
// So let's create a wrapper that fetches "Fund" wallet ID first.

import { useQuery } from '@tanstack/react-query'
import { walletsService } from '@/services/company/wallets-service'
import { StatCard } from '@/components/ui/stat-card'
import { Wallet } from 'lucide-react'

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

export default function FundWalletPage() {
    const { data: wallets = [] } = useQuery({
        queryKey: ['wallets-mine'],
        queryFn: () => walletsService.getWalletsMine(),
    })

    const fundWallet = wallets.find(w => w.walletType === 'FUND')

    if (!fundWallet && wallets.length > 0) return <div>Fund Wallet not found (or not created yet).</div>

    // WalletsLedgerPage expects 'walletId' in query param usually, 
    // or we can pass it as a prop if we refactor WalletsLedgerPage. 
    // Let's modify logic to assume if we are on this page, we show ledger for this specific wallet.
    // For V1 of this task, I'll direct render a simplified ledger here or 
    // instruct user to use existing Ledger logic.
    // Given usage, I should probably render the transactions list here as asked: "fund wallet transaction list (credit debit)"

    // Check if fundWallet is loaded
    if (!fundWallet) return <div className="p-8">Loading wallet...</div>

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Fund Wallet'
                description='Manage your operating funds.'
            />

            <div className='grid gap-6 md:grid-cols-3'>
                <StatCard
                    title='Current Balance'
                    value={formatCurrency(fundWallet.balance)}
                    icon={<Wallet className='h-4 w-4' />}
                    description='Available for transfers'
                />
            </div>

            {/* Embed Ledger logic here by reusing WalletsLedgerPage? */}
            {/* The existing WalletsLedgerPage reads from URL query param ?walletId. */}
            {/* I can render it but I need to force the walletId into context or URL? */}
            {/* Easier: Just use the service directly here to list transactions. */}

            <FundWalletTransactions walletId={fundWallet.id} />
        </div>
    )
}

// Sub-component for transactions
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

function FundWalletTransactions({ walletId }: { walletId: number }) {
    const { data: ledger = [], isLoading } = useQuery({
        queryKey: ['wallet-ledger', walletId],
        queryFn: () => walletsService.getWalletLedger(String(walletId)),
    })

    return (
        <div className='rounded-md border bg-card'>
            <div className="p-4 font-semibold">Transactions</div>
            <DataTable>
                <thead>
                    <DataTableRow>
                        <DataTableCell isHeader>Date</DataTableCell>
                        <DataTableCell isHeader>Type</DataTableCell>
                        <DataTableCell isHeader>Amount</DataTableCell>
                        <DataTableCell isHeader>Notes</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow><DataTableCell colSpan={4}>Loading...</DataTableCell></DataTableRow>
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
                                <DataTableCell>{l.notes}</DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </tbody>
            </DataTable>
        </div>
    )
}
