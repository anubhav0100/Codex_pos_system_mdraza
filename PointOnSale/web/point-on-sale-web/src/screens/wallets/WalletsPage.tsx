import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet, ArrowRightLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { PermissionGate } from '@/components/auth/permission-gate'
import { walletsService, type WalletTransferDto } from '@/services/company/wallets-service'

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

const walletLabels: Record<string, string> = {
  FUND: 'Fund Wallet',
  INCOME: 'Income Wallet',
  INCENTIVE: 'Incentive Wallet',
}

export default function WalletsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferForm, setTransferForm] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    note: '',
  })

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets-mine'],
    queryFn: () => walletsService.getWalletsMine(),
  })

  const transferMutation = useMutation({
    mutationFn: (payload: WalletTransferDto) => walletsService.transferWallets(payload),
    onSuccess: () => {
      toast.success('Wallet transfer submitted')
      queryClient.invalidateQueries({ queryKey: ['wallets-mine'] })
      setTransferOpen(false)
    },
    onError: () => toast.error('Failed to submit transfer'),
  })

  const walletCards = useMemo(() => {
    if (isLoading) {
      return (
        <div className='grid gap-6 md:grid-cols-3'>
          {[1, 2, 3].map((value) => (
            <StatCard key={value} title='Loading...' value='--' icon={<Wallet className='h-4 w-4' />} />
          ))}
        </div>
      )
    }

    if (wallets.length === 0) {
      return (
        <EmptyState
          icon={<Wallet className='h-8 w-8 text-muted-foreground/60' />}
          title='No wallets available'
          description='Wallet balances will appear here once assigned.'
        />
      )
    }

    return (
      <div className='grid gap-6 md:grid-cols-3'>
        {wallets.map((wallet) => (
          <StatCard
            key={wallet.id}
            title={walletLabels[wallet.walletType] ?? wallet.walletType}
            value={formatCurrency(wallet.balance)}
            description={undefined}
            icon={<Wallet className='h-4 w-4' />}
          />
        ))}
      </div>
    )
  }, [isLoading, wallets])

  const handleTransferSubmit = () => {
    if (!transferForm.fromWalletId || !transferForm.toWalletId || !transferForm.amount) {
      toast.error('Please complete all transfer fields')
      return
    }

    transferMutation.mutate({
      fromWalletId: transferForm.fromWalletId,
      toWalletId: transferForm.toWalletId,
      amount: Number(transferForm.amount),
      note: transferForm.note || undefined,
    })
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Wallets'
        description='Monitor balances across fund, income, and incentive wallets.'
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' onClick={() => navigate('/wallets/ledger')}>
              View Ledger
            </Button>
            <PermissionGate perm='WALLETS_TRANSFER'>
              <Button onClick={() => setTransferOpen(true)} className='gap-2'>
                <ArrowRightLeft className='h-4 w-4' />
                Transfer
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {walletCards}

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Admin Transfer</DialogTitle>
            <DialogDescription>Move funds between wallets.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>From Wallet</label>
              <select
                className={selectClassName}
                value={transferForm.fromWalletId}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    fromWalletId: event.target.value,
                  }))
                }
              >
                <option value=''>Select wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {walletLabels[wallet.walletType] ?? wallet.walletType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>To Wallet</label>
              <select
                className={selectClassName}
                value={transferForm.toWalletId}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    toWalletId: event.target.value,
                  }))
                }
              >
                <option value=''>Select wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {walletLabels[wallet.walletType] ?? wallet.walletType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Amount</label>
              <Input
                type='number'
                min={1}
                placeholder='0.00'
                value={transferForm.amount}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Note</label>
              <Input
                placeholder='Optional transfer note'
                value={transferForm.note}
                onChange={(event) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferSubmit} disabled={transferMutation.isPending}>
              Submit Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
