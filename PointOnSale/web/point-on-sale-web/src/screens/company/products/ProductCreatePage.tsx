import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { productCategoriesService } from '@/services/company/product-categories-service'
import { productsService } from '@/services/company/products-service'
import { Layers } from 'lucide-react'

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  hsn: z.string().optional(),
  gstPercent: z.coerce.number().min(0, 'GST must be 0 or more').max(100, 'GST must be 100 or less'),
  mrp: z.coerce.number().min(0, 'MRP must be 0 or more'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  categoryId: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: productCategoriesService.getCategories,
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      hsn: '',
      gstPercent: 0,
      mrp: 0,
      price: 0,
      categoryId: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      productsService.createProduct({
        sku: values.sku,
        name: values.name,
        hsn: values.hsn?.trim() || undefined,
        gstPercent: values.gstPercent,
        mrp: values.mrp,
        defaultSalePrice: values.price,
        categoryId: values.categoryId ? Number(values.categoryId) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
      navigate('/products')
    },
    onError: () => toast.error('Failed to create product'),
  })

  return (
    <div className='space-y-6 max-w-3xl mx-auto'>
      <PageHeader
        title='Create Product'
        description='Add a new product to your catalog.'
        onBack={() => navigate('/products')}
      />

      <Card className='premium-card'>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isCategoriesLoading ? (
            <div className='text-sm text-muted-foreground'>Loading categories...</div>
          ) : (
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-4'>
              {categories.length === 0 && (
                <EmptyState
                  icon={<Layers className='h-8 w-8 text-muted-foreground/50' />}
                  title='No Categories Found'
                  description='You can still add products, or create categories later.'
                />
              )}
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>SKU</label>
                  <Input placeholder='SKU-001' {...form.register('sku')} />
                  {form.formState.errors.sku && (
                    <p className='text-sm text-destructive'>{form.formState.errors.sku.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Product Name</label>
                  <Input placeholder='Product name' {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
                  )}
                </div>
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>HSN</label>
                  <Input placeholder='HSN code' {...form.register('hsn')} />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>GST %</label>
                  <Input type='number' step='0.01' {...form.register('gstPercent', { valueAsNumber: true })} />
                  {form.formState.errors.gstPercent && (
                    <p className='text-sm text-destructive'>{form.formState.errors.gstPercent.message}</p>
                  )}
                </div>
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>MRP</label>
                  <Input type='number' step='0.01' {...form.register('mrp', { valueAsNumber: true })} />
                  {form.formState.errors.mrp && (
                    <p className='text-sm text-destructive'>{form.formState.errors.mrp.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Default Price</label>
                  <Input type='number' step='0.01' {...form.register('price', { valueAsNumber: true })} />
                  {form.formState.errors.price && (
                    <p className='text-sm text-destructive'>{form.formState.errors.price.message}</p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Category</label>
                <select className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm' {...form.register('categoryId')}>
                  <option value=''>Unassigned</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex justify-end gap-3'>
                <Button type='button' variant='ghost' onClick={() => navigate('/products')}>
                  Cancel
                </Button>
                <Button type='submit' disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
