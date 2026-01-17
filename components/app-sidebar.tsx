'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Settings, User, LogOut, ChevronLeft, ChevronRight, Home, MoreVertical } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { logout } from '@/API/auth.api';
import { toast } from 'sonner';
import { TOKEN_KEY } from '@/lib/constants';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/enums';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onMobileNav?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function AppSidebar({ isCollapsed = false, onToggle, onMobileNav }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem(TOKEN_KEY);
      logoutStore();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        onClick={() => onMobileNav?.()}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          isCollapsed && 'justify-center px-2',
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {isCollapsed ? (
          <div className="flex items-center justify-center w-full">
            <span className="text-lg font-bold text-foreground">C</span>
          </div>
        ) : (
          <h1 className="text-lg font-bold text-foreground flex-1">CIDE</h1>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-auto p-2 hover:bg-accent data-[state=open]:bg-accent',
                isCollapsed && 'justify-center p-2',
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src="/images/user.webp" alt={user?.name || 'User'} />
                <AvatarFallback className="bg-muted text-muted-foreground">{getUserInitials()}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-medium text-foreground">{user?.name || 'User'}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.role || UserRole.ADMIN.toString()}
                    </span>
                  </div>
                  <MoreVertical className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isCollapsed ? 'right' : 'top'} sideOffset={4} className="w-56">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="/images/user.webp" alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-muted text-muted-foreground">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-medium text-foreground">{user?.name || 'User'}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email || 'user@example.com'}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" onClick={() => onMobileNav?.()} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
