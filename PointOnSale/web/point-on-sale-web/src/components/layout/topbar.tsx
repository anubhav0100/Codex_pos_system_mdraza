import { Search, Bell, Menu, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNav } from './sidebar-nav'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/use-auth-store'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Topbar() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const userProfile = useAuthStore((state) => state.userProfile)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className='h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex items-center px-6 gap-4'>
      <div className='md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='p-0 w-64'>
            <SidebarNav />
          </SheetContent>
        </Sheet>
      </div>

      <div className='flex items-center gap-4 flex-1'>
        <div className='hidden lg:flex items-center gap-2'>
          <Badge variant='outline' className='bg-secondary/50 gap-1.5 font-medium py-1 px-3'>
            <Building2 className='h-3.5 w-3.5' />
            {userProfile?.scopeType === 0 ? 'System Root' : userProfile?.scopeNodeId || 'Main Warehouse'}
          </Badge>
        </div>

        <div className='relative max-w-sm w-full hidden sm:block'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search anything...' className='pl-9 bg-secondary/30 border-none' />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <ThemeToggle />
        <Button variant='ghost' size='icon' className='h-9 w-9 relative'>
          <Bell className='h-5 w-5' />
          <span className='absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-9 w-9 rounded-full p-0'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src='' />
                <AvatarFallback>
                  {userProfile?.fullName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'JD'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>
              <div className='flex flex-col'>
                <span>{userProfile?.fullName || 'John Doe'}</span>
                <span className='text-xs font-normal text-muted-foreground underline'>
                  {userProfile?.email || 'admin@example.com'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive' onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
