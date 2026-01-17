import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center p-4 text-center'>
      <div className='w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6'>
        <ShieldAlert className='w-10 h-10 text-destructive' />
      </div>
      <h1 className='text-4xl font-bold tracking-tight mb-2'>Access Denied</h1>
      <p className='text-muted-foreground max-w-md mb-8'>
        You don't have the required permissions to access this page. Please contact your
        administrator if you believe this is an error.
      </p>
      <div className='flex gap-4'>
        <Button variant='outline' onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    </div>
  )
}
