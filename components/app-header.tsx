'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { logout } from '@/API/auth.api';
import { toast } from 'sonner';
import { TOKEN_KEY } from '@/lib/constants';
import useDebounce from '@/hooks/use-debounce';

import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/breadcrumb';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

export function AppHeader({ onSidebarToggle }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout: logoutStore } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchValue(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const trimmedDebounced = debouncedSearchValue.trim();

    if (trimmedDebounced !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());

      if (trimmedDebounced) {
        params.set('search', trimmedDebounced);
        params.delete('page');
      } else {
        params.delete('search');
      }

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
    }
  }, [debouncedSearchValue, pathname, router]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

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

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (paths.length === 0 || pathname === '/') {
      return [{ label: 'Dashboard' }];
    }

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({
        label,
        href: index < paths.length - 1 ? currentPath : undefined,
      });
    });

    return breadcrumbs;
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onSidebarToggle} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:flex items-center">
          <Breadcrumb items={getBreadcrumbs()} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/user.webp" alt={user?.name || 'User'} />
                <AvatarFallback className="bg-muted text-muted-foreground">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button onClick={() => router.push('/profile')} className="w-full cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
