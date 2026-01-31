import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Smartphone,
    Globe
} from 'lucide-react'
import { productAssignmentsService } from '@/services/company/product-assignments-service'
import type { ScopeProductAssignment } from '@/services/company/product-assignments-service'
import { posService, PaymentMethod } from '@/services/company/pos-service'
import type { CreateSaleDto, SalesOrderDto } from '@/services/company/pos-service'
import { useAuthStore } from '@/store/use-auth-store'
import { toast } from 'sonner'
import { cn } from '@/utils/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface CartItem extends ScopeProductAssignment {
    qty: number
}

export default function POSPage() {
    const { userProfile } = useAuthStore()
    const [products, setProducts] = useState<ScopeProductAssignment[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [currentOrder, setCurrentOrder] = useState<SalesOrderDto | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setIsLoading(true)
            const scopeNodeId = userProfile?.scopeNodeId ? parseInt(userProfile.scopeNodeId) : 0
            if (scopeNodeId > 0) {
                const data = await productAssignmentsService.getScopeProducts(scopeNodeId)
                setProducts(data.filter(p => p.isAllowed))
            } else {
                toast.error('Unable to determine Scope Node ID')
            }
        } catch (error) {
            toast.error('Failed to fetch assigned products')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const addToCart = (product: ScopeProductAssignment) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
            }
            return [...prev, { ...product, qty: 1 }]
        })
        toast.success(`${product.name} added to cart`)
    }

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta)
                return { ...item, qty: newQty }
            }
            return item
        }))
    }

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id))
    }

    const cartTotal = cart.reduce((sum, item) => sum + ((item.effectivePrice ?? item.defaultSalePrice) * item.qty), 0)
    const cartTax = cart.reduce((sum, item) => sum + ((item.effectivePrice ?? item.defaultSalePrice) * item.qty * (item.gstPercent / 100)), 0)
    const grandTotal = cartTotal + cartTax

    const handleCheckout = async () => {
        if (cart.length === 0) return

        const scopeNodeId = userProfile?.scopeNodeId ? parseInt(userProfile.scopeNodeId) : 0
        if (scopeNodeId === 0) {
            toast.error('Unable to determine Scope Node ID. Please contact administrator.')
            return
        }

        try {
            setIsProcessing(true)
            const dto: CreateSaleDto = {
                scopeNodeId,
                items: cart.map(item => ({
                    productId: item.id,
                    qty: item.qty
                }))
            }
            const order = await posService.createSale(dto)
            setCurrentOrder(order)
            setIsPaymentModalOpen(true)
            setCart([])
            toast.success('Order created successfully!')
        } catch (error) {
            toast.error('Failed to create order')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleConfirmPayment = async (method: PaymentMethod) => {
        if (!currentOrder) return

        try {
            setIsProcessing(true)
            await posService.confirmPayment(currentOrder.id, {
                paymentMethod: method,
                paymentRef: `POS-${Date.now()}`
            })
            toast.success('Payment confirmed!')
            setIsPaymentModalOpen(false)
            setCurrentOrder(null)
        } catch (error) {
            toast.error('Failed to confirm payment')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className='flex flex-col h-[calc(100vh-120px)]'>
            <PageHeader
                title={<span className="gradient-text">Point of Sale</span>}
                description="Search products and process sales instantly."
            />

            <div className='flex gap-6 flex-1 overflow-hidden'>
                {/* Product Catalog */}
                <div className='flex-1 flex flex-col gap-4 overflow-hidden'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search by name or SKU...'
                            className='pl-10 h-12 bg-card border-border/50 focus:ring-rainbow-blue rounded-xl'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className='flex-1 overflow-y-auto pr-2'>
                        {isLoading ? (
                            <div className='flex items-center justify-center h-full'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-rainbow-blue'></div>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4'>
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className='premium-card p-4 hover-scale cursor-pointer group flex flex-col justify-between h-full'
                                        onClick={() => addToCart(product)}
                                    >
                                        <div>
                                            <div className='flex justify-between items-start mb-2'>
                                                <Badge variant="outline" className='text-[10px] text-muted-foreground border-muted-foreground/30'>
                                                    {product.sku}
                                                </Badge>
                                                <Badge className='bg-rainbow-green/10 text-rainbow-green border-rainbow-green/20'>
                                                    {product.categoryName}
                                                </Badge>
                                            </div>
                                            <h3 className='font-bold text-lg mb-1 group-hover:text-rainbow-blue transition-colors'>
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className='mt-4 flex items-center justify-between'>
                                            <span className='text-xl font-black text-foreground'>
                                                ₹{(product.effectivePrice ?? product.defaultSalePrice).toFixed(2)}
                                            </span>
                                            <Button size="icon" variant="ghost" className='rounded-full bg-rainbow-blue/5 text-rainbow-blue hover:bg-rainbow-blue hover:text-white transition-all'>
                                                <Plus className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart */}
                <div className='w-96 flex flex-col premium-card border-border/50 shadow-2xl'>
                    <div className='p-4 border-b bg-muted/30 flex items-center gap-2'>
                        <ShoppingCart className='h-5 w-5 text-rainbow-blue' />
                        <h2 className='font-bold'>Current Cart</h2>
                        <Badge className='ml-auto bg-rainbow-violet'>{cart.length} items</Badge>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                        {cart.length === 0 ? (
                            <div className='h-full flex flex-col items-center justify-center opacity-40 select-none'>
                                <ShoppingCart className='h-12 w-12 mb-2' />
                                <p className='text-sm font-medium'>No products in cart</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className='flex gap-3 animate-in fade-in slide-in-from-right-2 duration-300'>
                                    <div className='flex-1'>
                                        <p className='font-bold text-sm truncate'>{item.name}</p>
                                        <p className='text-xs text-muted-foreground'>₹{(item.effectivePrice ?? item.defaultSalePrice).toFixed(2)} / unit</p>
                                        <div className='flex items-center gap-2 mt-2'>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className='h-6 w-6 rounded-md hover:bg-muted'
                                                onClick={() => updateQty(item.id, -1)}
                                            >
                                                <Minus className='h-3 w-3' />
                                            </Button>
                                            <span className='w-8 text-center text-sm font-bold'>{item.qty}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className='h-6 w-6 rounded-md hover:bg-muted'
                                                onClick={() => updateQty(item.id, 1)}
                                            >
                                                <Plus className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='font-black text-sm'>₹{((item.effectivePrice ?? item.defaultSalePrice) * item.qty).toFixed(2)}</p>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className='h-6 w-6 mt-1 text-destructive hover:bg-destructive/10'
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className='h-3 w-3' />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className='p-6 border-t bg-muted/10 space-y-3'>
                        <div className='flex justify-between text-sm text-muted-foreground'>
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-sm text-muted-foreground'>
                            <span>Tax (GST)</span>
                            <span>₹{cartTax.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-xl font-black border-t pt-3 mt-3'>
                            <span className='gradient-text'>Total</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <Button
                            className='w-full h-14 mt-4 vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-lg'
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCheckout}
                        >
                            Process Checkout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className='sm:max-w-md bg-card border-border/50'>
                    <DialogHeader>
                        <DialogTitle className='text-2xl font-black gradient-text text-center'>Select Payment Method</DialogTitle>
                    </DialogHeader>

                    <div className='grid grid-cols-2 gap-4 py-6'>
                        <PaymentButton
                            icon={<Banknote className='h-6 w-6' />}
                            label="Cash"
                            color="rainbow-green"
                            onClick={() => handleConfirmPayment(PaymentMethod.Cash)}
                            disabled={isProcessing}
                        />
                        <PaymentButton
                            icon={<CreditCard className='h-6 w-6' />}
                            label="Card"
                            color="rainbow-blue"
                            onClick={() => handleConfirmPayment(PaymentMethod.Card)}
                            disabled={isProcessing}
                        />
                        <PaymentButton
                            icon={<Smartphone className='h-6 w-6' />}
                            label="UPI"
                            color="rainbow-yellow"
                            onClick={() => handleConfirmPayment(PaymentMethod.UPI)}
                            disabled={isProcessing}
                        />
                        <PaymentButton
                            icon={<Globe className='h-6 w-6' />}
                            label="Online"
                            color="rainbow-violet"
                            onClick={() => handleConfirmPayment(PaymentMethod.Online)}
                            disabled={isProcessing}
                        />
                    </div>

                    <div className='text-center p-4 bg-muted/30 rounded-xl mb-4'>
                        <p className='text-sm text-muted-foreground'>Total Amount Due</p>
                        <p className='text-3xl font-black'>₹{currentOrder?.grandTotal.toFixed(2)}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function PaymentButton({ icon, label, color, onClick, disabled }: {
    icon: React.ReactNode,
    label: string,
    color: string,
    onClick: () => void,
    disabled?: boolean
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center p-6 rounded-2xl border border-transparent transition-all hover-scale bg-muted/50 hover:bg-muted group',
                disabled && 'opacity-50 cursor-not-allowed grayscale'
            )}
        >
            <div className={cn('p-3 rounded-full mb-3 text-white shadow-lg', `bg-${color}`)}>
                {icon}
            </div>
            <span className='font-bold group-hover:scale-110 transition-transform'>{label}</span>
        </button>
    )
}
