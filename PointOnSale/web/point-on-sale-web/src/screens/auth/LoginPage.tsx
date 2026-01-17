import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/store/use-auth-store'
import { authService } from '@/services/auth-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)
    try {
      const response = await authService.login(data)
      login(response.accessToken, response.userProfile)
      toast.success('Successfully logged in!')
      navigate(from, { replace: true })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to login. Please check your credentials.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-secondary/30 p-4'>
      <Card className='w-full max-w-md soft-shadow border-none'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='text-3xl font-bold tracking-tight'>Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Email</label>
              <Input
                type='email'
                placeholder='admin@example.com'
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className='text-xs text-destructive'>{errors.email.message}</p>}
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Password</label>
              <Input
                type='password'
                placeholder='••••••••'
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className='text-xs text-destructive'>{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className='w-full' type='submit' disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
