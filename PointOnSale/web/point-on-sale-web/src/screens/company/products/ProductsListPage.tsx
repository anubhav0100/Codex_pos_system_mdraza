import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PackagePlus, Pencil, Power, PowerOff, Layers } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PermissionGate } from '@/components/auth/permission-gate'
import { productsService, type ProductSummary } from '@/services/company/products-service'

const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

export default function ProductsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
  })

  const statusMutation = useMutation({
    mutationFn: ({ productId, isActive }: { productId: number; isActive: boolean }) =>
      isActive ? productsService.deactivateProduct(productId) : productsService.activateProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product status updated')
    },
    onError: () => toast.error('Failed to update product status'),
  })

  const handleEdit = (product: ProductSummary) => {
    navigate(`/products/${product.id}/edit`, { state: { product } })
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={<span className="gradient-text">Products</span>}
        description='Maintain your product catalog and pricing.'
      >
        <div className='flex flex-wrap gap-2'>
          <PermissionGate perm='PRODUCT_CATEGORIES_READ'>
            <Button variant='outline' onClick={() => navigate('/categories')} className="hover:border-rainbow-blue hover:text-rainbow-blue transition-colors">
              <Layers className='h-4 w-4 mr-2' />
              Categories
            </Button>
          </PermissionGate>
          <PermissionGate perm='PRODUCTS_CREATE'>
            <Button onClick={() => navigate('/products/new')} className="bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 hover:opacity-90">
              <PackagePlus className='h-4 w-4 mr-2' />
              Add Product
            </Button>
          </PermissionGate>
        </div>
      </PageHeader>

      {isLoading ? (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={8} className='text-center py-8 text-foreground'>
                Loading products...
              </DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<PackagePlus className='h-8 w-8 text-muted-foreground/50' />}
          title='No Products Yet'
          description='Create your first product to start selling.'
        />
      ) : (
        <DataTable>
          <thead>
            <DataTableRow>
              <DataTableCell isHeader>SKU</DataTableCell>
              <DataTableCell isHeader>Name</DataTableCell>
              <DataTableCell isHeader>HSN</DataTableCell>
              <DataTableCell isHeader>GST %</DataTableCell>
              <DataTableCell isHeader>MRP</DataTableCell>
              <DataTableCell isHeader>Price</DataTableCell>
              <DataTableCell isHeader>Status</DataTableCell>
              <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
            </DataTableRow>
          </thead>
          <tbody>
            {products.map((product) => (
              <DataTableRow key={product.id} className="hover:bg-white/5 transition-colors">
                <DataTableCell className='font-medium text-rainbow-cyan'>{product.sku}</DataTableCell>
                <DataTableCell className='text-foreground'>{product.name}</DataTableCell>
                <DataTableCell className='text-foreground'>{product.hsn || '-'}</DataTableCell>
                <DataTableCell className='text-foreground'>{product.gstPercent ?? 0}%</DataTableCell>
                <DataTableCell className='text-foreground'>{formatAmount(product.mrp)}</DataTableCell>
                <DataTableCell className='text-foreground'>{formatAmount(product.defaultSalePrice)}</DataTableCell>
                <DataTableCell>
                  <Badge className={product.isActive ? 'bg-rainbow-green text-white hover:bg-rainbow-green/90' : 'bg-rainbow-red text-white hover:bg-rainbow-red/90'}>
                    {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </DataTableCell>
                <DataTableCell className='text-right space-x-2'>
                  <PermissionGate perm='PRODUCTS_UPDATE'>
                    <Button variant='ghost' size='sm' onClick={() => handleEdit(product)}>
                      <Pencil className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  </PermissionGate>
                  <PermissionGate perm='PRODUCTS_ACTIVATE'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => statusMutation.mutate({ productId: product.id, isActive: product.isActive })}
                    >
                      {product.isActive ? (
                        <>
                          <PowerOff className='h-4 w-4 mr-2' />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className='h-4 w-4 mr-2' />
                          Activate
                        </>
                      )}
                    </Button>
                  </PermissionGate>
                </DataTableCell>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  )
}
