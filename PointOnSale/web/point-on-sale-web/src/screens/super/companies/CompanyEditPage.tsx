import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { CompanyForm } from '@/components/super/companies/CompanyForm'
import { companyService, type UpdateCompanyDto } from '../../../services/super/company-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function CompanyEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: company, isLoading: isLoadingCompany } = useQuery({
        queryKey: ['super-company', id],
        queryFn: () => companyService.getCompany(id!),
        enabled: !!id,
    })

    const updateMutation = useMutation({
        mutationFn: (data: UpdateCompanyDto) => companyService.updateCompany(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-companies'] })
            queryClient.invalidateQueries({ queryKey: ['super-company', id] })
            toast.success('Company updated successfully')
            navigate('/super/companies')
        },
        onError: (error: Error | AxiosError) => {
            const message = error instanceof AxiosError ? (error.response?.data as any)?.message : error.message
            toast.error(message || 'Failed to update company')
        },
    })

    if (isLoadingCompany) {
        return <div className='flex items-center justify-center min-h-[400px] text-foreground'>Loading company details...</div>
    }

    if (!company) {
        return <div className='text-center py-12 text-foreground'>Company not found.</div>
    }

    return (
        <div className='space-y-6 max-w-2xl mx-auto'>
            <PageHeader
                title='Edit Company'
                description={`Modify details for ${company.name}`}
                onBack={() => navigate('/super/companies')}
            />

            <Card className='premium-card'>
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CompanyForm
                        initialValues={{
                            name: company.name,
                            gstin: company.gstin,
                            status: company.status,
                        }}
                        onSubmit={async (values) => {
                            updateMutation.mutate(values)
                        }}
                        isLoading={updateMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
