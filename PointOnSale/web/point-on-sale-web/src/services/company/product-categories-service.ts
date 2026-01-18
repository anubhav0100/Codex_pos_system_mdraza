import apiClient from '@/services/api-client'

export interface ProductCategory {
  id: number
  name: string
}

export interface CreateProductCategoryDto {
  name: string
}

export interface UpdateProductCategoryDto extends CreateProductCategoryDto {}

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

export const productCategoriesService = {
  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<ProductCategory[]> | ProductCategory[]>('product-categories')
    return unwrapResponse(response)
  },
  createCategory: async (data: CreateProductCategoryDto) => {
    const response = await apiClient.post<ApiResponse<string> | string>('product-categories', data)
    return unwrapResponse(response)
  },
  updateCategory: async (categoryId: number, data: UpdateProductCategoryDto) => {
    const response = await apiClient.put<ApiResponse<string> | string>(`/product-categories/${categoryId}`, data)
    return unwrapResponse(response)
  },
  deleteCategory: async (categoryId: number) => {
    const response = await apiClient.delete<ApiResponse<string> | string>(`/product-categories/${categoryId}`)
    return unwrapResponse(response)
  },
}

