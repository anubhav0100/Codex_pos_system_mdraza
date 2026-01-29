import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { MENU_ITEMS } from '@/config/menu-config'
import { useNavigate } from 'react-router-dom'

export function SidebarNav() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { userProfile, hasPermission, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
        <nav className='space-y-4 py-4'>
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className="block"
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group hover-scale border border-transparent relative overflow-hidden',
                    isActive
                      ? 'text-white border-white/20'
                      : 'text-muted-foreground hover:text-foreground',
                    isCollapsed && 'justify-center px-0'
                  )}
                  style={isActive ? {
                    backgroundColor: `hsl(var(--${item.color || 'primary'}))`,
                    boxShadow: `0 10px 20px -5px hsla(var(--${item.color || 'primary'}), 0.4)`
                  } : {
                    // Subtle hover color background
                    '--hover-bg': `hsla(var(--${item.color || 'primary'}), 0.1)`
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = `hsla(var(--${item.color || 'primary'}), 0.1)`
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10',
                      !isCollapsed && 'mr-2'
                    )}
                    style={{
                      color: isActive ? 'white' : `hsl(var(--${item.color || 'primary'}))`
                    }}
                  />

                  {!isCollapsed && (
                    <span className='font-bold tracking-tight relative z-10'>
                      {item.label}
                    </span>
                  )}

                  {isCollapsed && (
                    <div
                      className='absolute left-full ml-2 px-3 py-1.5 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 whitespace-nowrap z-50 shadow-xl'
                      style={{ backgroundColor: `hsl(var(--${item.color || 'primary'}))` }}
                    >
                      {item.label}
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className='p-4 border-t'>
        <div className={cn('flex items-center justify-between', isCollapsed ? 'flex-col gap-4' : 'gap-3')}>
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className='w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs uppercase shrink-0'>
              {userProfile?.fullName
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'JD'}
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
