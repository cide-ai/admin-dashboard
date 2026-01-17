'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Copy, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { getUsers } from '@/API/user.api';
import { UserSchema } from '@/schema/user.schema';
import { PaginationSchema, QuerySchema } from '@/schema/common.schema';
import { UserRole, LoginProvider } from '@/lib/enums';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { format } from 'date-fns';

const columns: ColumnDef<UserSchema>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 hover:bg-transparent"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as UserRole;
      return (
        <Badge variant="outline" className="px-2">
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'loginProvider',
    header: 'Provider',
    cell: ({ row }) => {
      const provider = row.getValue('loginProvider') as LoginProvider;
      return (
        <Badge variant="secondary" className="px-2">
          {provider}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Verified',
    cell: ({ row }) => {
      const verified = row.getValue('isEmailVerified') as boolean;
      return (
        <Badge variant={verified ? 'default' : 'outline'} className="px-2">
          {verified ? 'Verified' : 'Not Verified'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 hover:bg-transparent"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!date) return <div className="text-muted-foreground">-</div>;
      try {
        return <div className="text-muted-foreground">{format(new Date(date as string | Date), 'MMM dd, yyyy')}</div>;
      } catch {
        return <div className="text-muted-foreground">-</div>;
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const router = useRouter();

      const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        toast.success('User ID copied to clipboard');
      };

      const handleViewUser = () => {
        router.push(`/users/${user.id}`);
      };

      const handleDeleteUser = () => {
        toast.info('Delete functionality will be implemented soon');
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleViewUser} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyId} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteUser} variant="destructive" className="cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const filter = searchParams.get('filter') || '';

  const query: QuerySchema = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      sort: sort || undefined,
      filter: filter || undefined,
    }),
    [page, limit, search, sort, filter],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', query],
    queryFn: () => getUsers(query),
  });

  const users = useMemo(() => {
    if (!data?.success) return [];
    const response = data.response as { users: UserSchema[]; pagination: PaginationSchema };
    if (Array.isArray(response.users)) return response.users;
    return [];
  }, [data]);

  const pagination = useMemo(() => {
    if (!data?.success) return null;
    const response = data.response as { pagination: PaginationSchema };
    if (response.pagination) return response.pagination;
    return null;
  }, [data]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination?.totalPages || 0,
  });

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('filter');
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    router.push(`/users?${params.toString()}`);
  };

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    if (value) params.set('filter', value);
    else params.delete('filter');

    params.delete('page');
    router.push(`/users?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/users?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newSize);
    params.delete('page');
    router.push(`/users?${params.toString()}`);
  };

  const handleRowClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage and view all users in the system</p>
        </div>
        <div className="rounded-lg border border-destructive bg-card p-4">
          <p className="text-sm text-destructive">Failed to load users. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage and view all users in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter || ''} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort (A-Z)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="email">Email (A-Z)</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
              <SelectItem value="updatedAt">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort || ''} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort (Z-A)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (Z-A)</SelectItem>
              <SelectItem value="email">Email (Z-A)</SelectItem>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="updatedAt">Least Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-lg border overflow-hidden flex flex-col"
        style={{ minHeight: '400px', maxHeight: 'calc(100vh - 320px)' }}
      >
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-card">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => handleRowClick(row.original.id)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={(e) => {
                          if (cell.column.id === 'actions') {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <Pagination
          pagination={pagination}
          currentPage={page}
          currentLimit={limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemName="users"
        />
      )}
    </div>
  );
}
