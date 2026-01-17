import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { CompanyForm } from '@/components/super/companies/CompanyForm'
import { companyService } from '../../../services/super/company-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export default function CompanyCreatePage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: companyService.createCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-companies'] })
            toast.success('Company created successfully')
            navigate('/super/companies')
        },
        onError: (error: Error | AxiosError) => {
            const message = error instanceof AxiosError ? (error.response?.data as any)?.message : error.message
            toast.error(message || 'Failed to create company')
        },
    })

    return (
        <div className='space-y-6 max-w-2xl mx-auto'>
            <PageHeader
                title='Add New Company'
                description='Create a new company account in the system.'
                onBack={() => navigate('/super/companies')}
            />

            <Card className='premium-card'>
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CompanyForm
                        onSubmit={async (values) => {
                            createMutation.mutate(values)
                        }}
                        isLoading={createMutation.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
