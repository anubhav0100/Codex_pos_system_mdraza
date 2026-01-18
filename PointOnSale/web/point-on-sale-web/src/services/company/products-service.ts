import apiClient from '@/services/api-client'

export interface ProductSummary {
  id: number
  sku: string
  name: string
  hsn?: string
  gstPercent: number
  mrp: number
  defaultSalePrice: number
  isActive: boolean
  categoryId?: number | null
  categoryName?: string
}

export interface CreateProductDto {
  sku: string
  name: string
  hsn?: string
  gstPercent: number
  mrp: number
  defaultSalePrice: number
  categoryId?: number | null
}

export interface UpdateProductDto extends CreateProductDto {}

interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

const unwrapResponse = <T,>(response: { data: T | ApiResponse<T> }) => {
  const payload = response.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

const normalizeProduct = (product: ProductSummary) => ({
  ...product,
  sku: product.sku ?? (product as unknown as { SKU?: string }).SKU ?? '',
  hsn: product.hsn ?? (product as unknown as { HSN?: string }).HSN ?? '',
  gstPercent: product.gstPercent ?? (product as unknown as { GstPercent?: number }).GstPercent ?? 0,
  mrp: product.mrp ?? (product as unknown as { MRP?: number }).MRP ?? 0,
  defaultSalePrice:
    product.defaultSalePrice ??
    (product as unknown as { DefaultSalePrice?: number }).DefaultSalePrice ??
    0,
  categoryId:
    product.categoryId ?? (product as unknown as { CategoryId?: number | null }).CategoryId ?? null,
  categoryName:
    product.categoryName ?? (product as unknown as { CategoryName?: string }).CategoryName ?? '',
})

export const productsService = {
  getProducts: async () => {
    const response = await apiClient.get<ApiResponse<ProductSummary[]> | ProductSummary[]>('products')
    const data = unwrapResponse(response)
    return data.map((product) => normalizeProduct(product))
  },
  createProduct: async (data: CreateProductDto) => {
    const response = await apiClient.post<ApiResponse<string> | string>('products', data)
    return unwrapResponse(response)
  },
  updateProduct: async (productId: number, data: UpdateProductDto) => {
    const response = await apiClient.put<ApiResponse<string> | string>(`/products/${productId}`, data)
    return unwrapResponse(response)
  },
  deleteProduct: async (productId: number) => {
    const response = await apiClient.delete<ApiResponse<string> | string>(`/products/${productId}`)
    return unwrapResponse(response)
  },
  activateProduct: async (productId: number) => {
    const response = await apiClient.patch<ApiResponse<string> | string>(`/products/${productId}/activate`)
    return unwrapResponse(response)
  },
  deactivateProduct: async (productId: number) => {
    const response = await apiClient.patch<ApiResponse<string> | string>(`/products/${productId}/deactivate`)
    return unwrapResponse(response)
  },
}

