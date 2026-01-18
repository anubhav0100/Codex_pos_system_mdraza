import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PermissionGate } from '@/components/auth/permission-gate'
import { productCategoriesService, type ProductCategory } from '@/services/company/product-categories-service'

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [editName, setEditName] = useState('')

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['product-categories'],
    queryFn: productCategoriesService.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => productCategoriesService.createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      setNewName('')
      toast.success('Category created')
    },
    onError: () => toast.error('Failed to create category'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      productCategoriesService.updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      setEditingCategory(null)
      setEditName('')
      toast.success('Category updated')
    },
    onError: () => toast.error('Failed to update category'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productCategoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Failed to delete category'),
  })

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      toast.error('Category name is required')
      return
    }
    createMutation.mutate(trimmed)
  }

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category)
    setEditName(category.name)
  }

  const handleUpdate = () => {
    if (!editingCategory) return
    const trimmed = editName.trim()
    if (!trimmed) {
      toast.error('Category name is required')
      return
    }
    updateMutation.mutate({ id: editingCategory.id, name: trimmed })
  }

  const handleDelete = (category: ProductCategory) => {
    const confirmed = window.confirm(`Delete ${category.name}? This cannot be undone.`)
    if (!confirmed) return
    deleteMutation.mutate(category.id)
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Categories'
        description='Maintain product categories for your catalog.'
      />

      <Card className='premium-card'>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
            <div className='flex-1 space-y-2'>
              <label className='text-sm font-medium'>New Category</label>
              <Input
                placeholder='Category name'
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />
            </div>
            <PermissionGate perm='PRODUCT_CATEGORIES_CREATE'>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className='md:self-end'
              >
                {createMutation.isPending ? 'Saving...' : 'Add Category'}
              </Button>
            </PermissionGate>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={3} className='text-center py-8 text-foreground'>
                Loading categories...
              </DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Layers className='h-8 w-8 text-muted-foreground/50' />}
          title='No Categories Yet'
          description='Add categories to organize your products.'
        />
      ) : (
        <DataTable>
          <thead>
            <DataTableRow>
              <DataTableCell isHeader>Name</DataTableCell>
              <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
            </DataTableRow>
          </thead>
          <tbody>
            {categories.map((category) => (
              <DataTableRow key={category.id}>
                <DataTableCell className='font-medium text-foreground'>{category.name}</DataTableCell>
                <DataTableCell className='text-right space-x-2'>
                  <PermissionGate perm='PRODUCT_CATEGORIES_UPDATE'>
                    <Button variant='ghost' size='sm' onClick={() => handleEdit(category)}>
                      <Pencil className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  </PermissionGate>
                  <PermissionGate perm='PRODUCT_CATEGORIES_DELETE'>
                    <Button variant='ghost' size='sm' onClick={() => handleDelete(category)}>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </Button>
                  </PermissionGate>
                </DataTableCell>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      )}

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category name.</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Category Name</label>
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
          </div>
          <DialogFooter>
            <Button variant='ghost' onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <PermissionGate perm='PRODUCT_CATEGORIES_UPDATE'>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </PermissionGate>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
