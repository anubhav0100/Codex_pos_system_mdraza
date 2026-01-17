import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'

export default function CompanyAdminsPage() {
    const navigate = useNavigate()

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Company Administrators'
                description='Manage administrative users for this company.'
                onBack={() => navigate('/super/companies')}
            />

            <EmptyState
                icon={<Users className='h-8 w-8 text-muted-foreground/50' />}
                title='No Admins Assigned'
                description='This feature is currently under development. Soon you will be able to assign and manage company-level administrators here.'
            />
        </div>
    )
}
