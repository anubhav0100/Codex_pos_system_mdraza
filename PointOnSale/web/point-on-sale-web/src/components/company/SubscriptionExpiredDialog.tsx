import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CreditCard } from 'lucide-react'

export function SubscriptionExpiredDialog() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handleSubscriptionExpired = () => {
            setOpen(true)
        }

        window.addEventListener('subscription-expired', handleSubscriptionExpired)

        return () => {
            window.removeEventListener('subscription-expired', handleSubscriptionExpired)
        }
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='sm:max-w-md premium-card border-destructive/20'>
                <DialogHeader className='space-y-4'>
                    <div className='flex justify-center'>
                        <div className='p-3 rounded-full bg-destructive/10'>
                            <AlertTriangle className='h-8 w-8 text-destructive' />
                        </div>
                    </div>
                    <DialogTitle className='text-center text-xl'>Subscription Expired</DialogTitle>
                    <DialogDescription className='text-center text-muted-foreground'>
                        Your company subscription has expired. Access to company features is restricted.
                        Please renew your subscription to continue using PointOnSale.
                    </DialogDescription>
                </DialogHeader>
                <div className='flex justify-center pt-4'>
                    <Button className='w-full bg-gradient-vibrant hover:opacity-90 transition-opacity' onClick={() => window.location.href = '/subscription/renew'}>
                        <CreditCard className='mr-2 h-4 w-4' />
                        Renew Subscription
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
