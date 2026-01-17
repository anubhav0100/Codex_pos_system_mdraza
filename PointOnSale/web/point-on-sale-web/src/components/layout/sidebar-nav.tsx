import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { MENU_ITEMS } from '@/config/menu-config'

export function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { userProfile, hasPermission } = useAuthStore()

  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    if (userProfile && !item.allowedScopes.includes(userProfile.scopeType)) {
      return false
    }
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false
    }
    return true
  })

  return (
    <aside
      className={cn(
        'relative border-r bg-card h-screen flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      <div className='p-6 flex items-center justify-between'>
        {!isCollapsed && (
          <h1 className='text-xl font-bold tracking-tight text-primary transition-opacity duration-300'>
            PointOnSale
          </h1>
        )}
        <Button
          variant='ghost'
          size='icon'
          className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
          <span className='sr-only'>Toggle sidebar</span>
        </Button>
      </div>

      <ScrollArea className='flex-1 px-4'>
        <nav className='space-y-2 py-4'>
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-primary',
                  isCollapsed && 'justify-center px-0',
                )
              }
            >
              <item.icon className={cn('h-5 w-5 shrink-0', !isCollapsed && 'mr-2')} />
              {!isCollapsed && <span className='font-medium'>{item.label}</span>}
              {isCollapsed && (
                <div className='absolute left-full ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50'>
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className='p-4 border-t'>
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : 'px-2')}>
          <div className='w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs uppercase'>
            {userProfile?.fullName?.charAt(0) || 'JD'}
          </div>
          {!isCollapsed && (
            <div className='flex flex-col overflow-hidden'>
              <span className='text-sm font-medium truncate'>
                {userProfile?.fullName || 'John Doe'}
              </span>
              <span className='text-xs text-muted-foreground truncate'>
                {userProfile?.roles?.[0] || 'User'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
