import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usersApi, type UsersFilter } from '@/api/users.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, cn } from '@/lib/utils';
import type { User, Role } from '@/types';
import { Search, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function UsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'ALL'>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const filters: UsersFilter = { 
    page, 
    limit: 20, 
    search: debouncedSearch, 
    role: role === 'ALL' ? '' : role 
  };
  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.getAll(filters),
  });

  const updateRoleMutation = useMutation({
    mutationFn: usersApi.updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('common.error');
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteId(null); toast.success(t('common.success')); },
    onError: () => toast.error(t('common.error')),
  });

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      header: '',
      cell: (u) => <UserAvatar user={u} size="sm" />,
      className: 'w-12',
    },
    {
      key: 'name',
      header: t('user.name'),
      cell: (u) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
          {u.email && <p className="text-xs text-slate-400">{u.email}</p>}
        </div>
      ),
    },
    { key: 'phone', header: t('user.phone'), cell: (u) => <span className="text-slate-600 dark:text-slate-300">{u.phone}</span> },
    {
      key: 'role',
      header: t('user.role'),
      cell: (u) => <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>,
    },
    { key: 'orders', header: t('user.orders'), cell: (u) => <Badge variant="outline">{u._count?.orders || 0}</Badge> },
    { key: 'date', header: t('user.joinDate'), cell: (u) => <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions',
      header: t('common.actions'),
      cell: (u) => {
        const isUpdating = updateRoleMutation.isPending && updateRoleMutation.variables?.id === u.id;
        const isSelf = u.id === currentUser?.id;
        return (
          <div className="flex gap-1">
            {!isSelf && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  u.role === 'ADMIN' ? "text-amber-500 hover:text-amber-600" : "text-indigo-600 hover:text-indigo-700"
                )}
                title={u.role === 'ADMIN' ? (t('user.removeAdmin') || 'Remove Admin') : t('user.makeAdmin')}
                onClick={() =>
                  updateRoleMutation.mutate({
                    id: u.id,
                    role: u.role === 'ADMIN' ? 'USER' : 'ADMIN',
                  })
                }
                disabled={updateRoleMutation.isPending}
              >
                {isUpdating ? (
                  <LoadingSpinner size="sm" />
                ) : u.role === 'ADMIN' ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
              </Button>
            )}
            {!isSelf && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={() => setDeleteId(u.id)}
                disabled={deleteMutation.isPending || updateRoleMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t('nav.users')} breadcrumbs={[{ label: 'Admin' }, { label: t('nav.users') }]} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder={t('common.search')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as Role | 'ALL'); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('user.filterByRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('user.allRoles')}</SelectItem>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} page={page} totalPages={data?.totalPages} onPageChange={setPage} total={data?.total} />

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </div>
  );
}
