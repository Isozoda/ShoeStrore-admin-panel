import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoriesApi, type CategoryFormData } from '@/api/categories.api';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getImageUrl, slugify } from '@/lib/utils';
import type { Category } from '@/types';
import { Plus, Pencil, Trash2, Folder } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  nameRu: z.string().min(1),
  nameTj: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  image: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function CategoriesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const nameRu = watch('nameRu', '');
  const imageVal = watch('image', '');

  const openCreate = () => { reset({ nameRu: '', nameTj: '', nameEn: '', slug: '', parentId: '', image: '' }); setEditId(null); setDialogOpen(true); };
  const openEdit = (cat: Category) => {
    reset({ nameRu: cat.nameRu, nameTj: cat.nameTj, nameEn: cat.nameEn, slug: cat.slug, parentId: cat.parentId || '', image: cat.image || '' });
    setEditId(cat.id); setDialogOpen(true);
  };

  const mutation = useMutation({
    mutationFn: (data: Form) => {
      return editId ? categoriesApi.update(editId, data) : categoriesApi.create(data);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['categories'] }); 
      setDialogOpen(false); 
      toast.success(t('common.success')); 
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['categories'] }); 
      setDeleteId(null); 
      toast.success(t('common.success')); 
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error');
      toast.error(msg);
    },
  });

  const topLevel = categories?.filter((c) => !c.parentId) || [];
  const children = (parentId: string) => categories?.filter((c) => c.parentId === parentId) || [];

  if (isLoading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t('nav.categories')} breadcrumbs={[{ label: 'Admin' }, { label: t('nav.categories') }]}
        action={<Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" />{t('category.create')}</Button>}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('category.image')}</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('category.name')}</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Slug</th>
              <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('category.products')}</th>
              <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {topLevel.length === 0 ? (
              <tr><td colSpan={5}><EmptyState /></td></tr>
            ) : (
              topLevel.map((cat) => (
                <React.Fragment key={cat.id}>
                  {/* Parent Row */}
                  <tr className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        {cat.image ? (
                          <img src={getImageUrl(cat.image)} alt={cat.nameRu} className="h-12 w-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-indigo-500 border border-indigo-100/50 dark:border-indigo-500/30">
                            <Folder className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{cat.nameRu}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Root Category</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900/60 text-slate-500 font-mono text-[10px] border border-slate-200/50 dark:border-slate-700/50">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex -space-x-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-white dark:border-slate-800 shadow-sm">
                            {cat._count?.products || 0}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/50" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30" onClick={() => setDeleteId(cat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Child Rows */}
                  {children(cat.id).map((child, idx) => (
                    <tr key={child.id} className="group/child bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-200">
                      <td className="px-6 py-3 pl-14 relative whitespace-nowrap">
                        {/* Tree Line Connector */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="absolute left-8 top-1/2 w-4 h-px bg-slate-200 dark:bg-slate-700" />
                        
                        {child.image ? (
                          <img src={getImageUrl(child.image)} alt={child.nameRu} className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs group-hover/child:scale-105 transition-transform" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Folder className="h-4 w-4 opacity-60" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover/child:text-indigo-500 transition-colors">
                            {child.nameRu}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-400 font-mono text-[9px] tracking-tight">{child.slug}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 shadow-inner">
                          {child._count?.products || 0}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover/child:opacity-100 transition-all duration-200">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEdit(child)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500" onClick={() => setDeleteId(child.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? t('category.edit') : t('category.create')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[['nameRu', t('category.nameRu')], ['nameTj', t('category.nameTj')], ['nameEn', t('category.nameEn')]].map(([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    className="h-8"
                    {...register(field as keyof Form, {
                      onChange: (e) => {
                        if (field === 'nameRu') setValue('slug', slugify(e.target.value));
                      }
                    })}
                  />
                  {errors[field as keyof Form] && <p className="text-xs text-red-500">Майдонро пур кунед</p>}
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">Slug</Label>
                <Input className="h-8 font-mono" {...register('slug')} />
                {errors.slug && <p className="text-xs text-red-500">Slug ворид кунед</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('category.parent')}</Label>
                <Select value={watch('parentId') || ''} onValueChange={(v) => setValue('parentId', v === 'none' ? '' : v)}>
                  <SelectTrigger className="h-8"><SelectValue placeholder={t('category.noParent')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('category.noParent')}</SelectItem>
                    {categories?.filter((c) => !c.parentId && c.id !== editId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nameRu}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('category.image')}</Label>
                <input type="hidden" {...register('image')} />
                <ImageUpload value={imageVal} onChange={(url) => setValue('image', url)} />
              </div>
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
