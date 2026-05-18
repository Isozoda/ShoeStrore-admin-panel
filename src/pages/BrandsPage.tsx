import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brandsApi, type BrandFormData } from '@/api/brands.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getImageUrl, slugify } from '@/lib/utils';
import type { Brand } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function BrandsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: brands, isLoading } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.getAll });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const logoVal = watch('logo', '');

  const openCreate = () => { reset({ name: '', slug: '', logo: '' }); setEditId(null); setDialogOpen(true); };
  const openEdit = (b: Brand) => { reset({ name: b.name, slug: b.slug, logo: b.logo || '' }); setEditId(b.id); setDialogOpen(true); };

  const mutation = useMutation({
    mutationFn: (data: Form) => editId ? brandsApi.update(editId, data as BrandFormData) : brandsApi.create(data as BrandFormData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); setDialogOpen(false); toast.success(t('common.success')); },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: brandsApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); setDeleteId(null); toast.success(t('common.success')); },
    onError: () => toast.error(t('common.error')),
  });

  const columns: Column<Brand>[] = [
    {
      key: 'logo',
      header: t('brand.logo'),
      cell: (b) => b.logo ? <img src={getImageUrl(b.logo)} alt={b.name} className="h-10 w-10 rounded-xl object-contain border border-slate-200 dark:border-slate-700 bg-white p-1" /> : <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{b.name.charAt(0)}</div>,
      className: 'w-16',
    },
    { key: 'name', header: t('brand.name'), cell: (b) => <span className="font-medium text-slate-900 dark:text-slate-100">{b.name}</span> },
    { key: 'slug', header: 'Slug', cell: (b) => <span className="font-mono text-xs text-slate-400">{b.slug}</span> },
    { key: 'products', header: t('brand.products'), cell: (b) => <Badge variant="secondary">{b._count?.products || 0}</Badge> },
    {
      key: 'actions',
      header: t('common.actions'),
      cell: (b) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t('nav.brands')} breadcrumbs={[{ label: 'Admin' }, { label: t('nav.brands') }]}
        action={<Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />{t('brand.create')}</Button>}
      />

      <DataTable columns={columns} data={brands || []} loading={isLoading} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? t('brand.edit') : t('brand.create')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('brand.name')}</Label>
              <Input {...register('name')} onChange={(e) => { setValue('name', e.target.value); setValue('slug', slugify(e.target.value)); }} />
              {errors.name && <p className="text-xs text-red-500">Номро ворид кунед</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input className="font-mono" {...register('slug')} />
              {errors.slug && <p className="text-xs text-red-500">Slug ворид кунед</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t('brand.logo')}</Label>
              <ImageUpload value={logoVal} onChange={(url) => setValue('logo', url)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? t('common.loading') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} />
    </div>
  );
}
