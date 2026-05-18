import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { bannersApi, type BannerFormData } from '@/api/banners.api';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { getImageUrl, cn } from '@/lib/utils';
import type { Banner } from '@/types';
import { Plus, Pencil, Trash2, ExternalLink, GripVertical, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  titleRu: z.string().optional(),
  titleTj: z.string().optional(),
  titleEn: z.string().optional(),
  subtitleRu: z.string().optional(),
  subtitleTj: z.string().optional(),
  subtitleEn: z.string().optional(),
  buttonTextRu: z.string().optional(),
  buttonTextTj: z.string().optional(),
  buttonTextEn: z.string().optional(),
  image: z.string().min(1, 'Тасвирро бор кунед'),
  link: z.string().optional(),
  order: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

type Form = z.infer<typeof schema>;

export function BannersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: banners, isLoading } = useQuery({ 
    queryKey: ['banners-admin'], 
    queryFn: bannersApi.getAll 
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, order: 0 },
  });

  const imageVal = watch('image', '');
  const isActiveVal = watch('isActive', true);

  const openCreate = () => {
    reset({ 
      titleRu: '', titleTj: '', titleEn: '', 
      subtitleRu: '', subtitleTj: '', subtitleEn: '', 
      buttonTextRu: '', buttonTextTj: '', buttonTextEn: '',
      image: '', link: '', order: 0, isActive: true 
    });
    setEditId(null); 
    setDialogOpen(true);
  };

  const openEdit = (b: Banner) => {
    reset({ 
      titleRu: b.titleRu || '', titleTj: b.titleTj || '', titleEn: b.titleEn || '', 
      subtitleRu: b.subtitleRu || '', subtitleTj: b.subtitleTj || '', subtitleEn: b.subtitleEn || '', 
      buttonTextRu: b.buttonTextRu || '', buttonTextTj: b.buttonTextTj || '', buttonTextEn: b.buttonTextEn || '',
      image: b.image, link: b.link || '', order: b.order, isActive: b.isActive 
    });
    setEditId(b.id); 
    setDialogOpen(true);
  };

  const mutation = useMutation({
    mutationFn: (data: Form) => {
      const payload: BannerFormData = { ...data };
      return editId ? bannersApi.update(editId, payload) : bannersApi.create(payload);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] }); 
      setDialogOpen(false); 
      toast.success(t('common.success')); 
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: bannersApi.delete,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['banners-admin'] }); 
      setDeleteId(null); 
      toast.success(t('common.success')); 
    },
    onError: () => toast.error(t('common.error')),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" className="text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Боргузории баннерҳо...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title={t('nav.banners')} 
        breadcrumbs={[{ label: 'Admin' }, { label: t('nav.banners') }]}
        action={
          <Button className="gap-2 rounded-xl shadow-lg shadow-indigo-500/20" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('banner.create')}
          </Button>
        }
      />

      {!banners || banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
              <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Баннерҳо мавҷуд нест</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto mb-8">
            Шумо метавонед баннерҳои навро илова кунед, то дар саҳифаи асосӣ намоиш дода шаванд.
          </p>
          <Button 
            onClick={openCreate}
            className="gap-2 rounded-xl shadow-lg shadow-indigo-500/20 px-6 py-5 bg-indigo-600 hover:bg-indigo-700 font-bold"
          >
            <Plus className="h-4 w-4" />
            Баннери аввалро илова кунед
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((b) => (
            <Card key={b.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img 
                    src={getImageUrl(b.image)} 
                    alt={b.titleRu || ''} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={cn(
                      "backdrop-blur-md border-none px-3 py-1 text-[10px] font-black tracking-widest uppercase",
                      b.isActive ? "bg-emerald-500/90 text-white" : "bg-slate-500/90 text-white"
                    )}>
                      {b.isActive ? t('banner.active') : t('product.inactive')}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {b.titleRu && (
                          <h3 className="text-white font-black text-xl leading-tight truncate drop-shadow-md">
                            {b.titleRu}
                          </h3>
                        )}
                        {b.subtitleRu && (
                          <p className="text-white/80 text-xs font-medium truncate mt-1">
                            {b.subtitleRu}
                          </p>
                        )}
                      </div>
                      {b.link && (
                        <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Тартиб</span>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">#{b.order}</span>
                    </div>
                    {b.buttonTextRu && (
                      <div className="flex flex-col ml-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Матни тугма</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none truncate max-w-[150px]">{b.buttonTextRu}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:text-indigo-600 hover:border-indigo-200" 
                      onClick={() => openEdit(b)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-red-500 hover:bg-red-50 hover:border-red-100" 
                      onClick={() => setDeleteId(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl overflow-hidden border-none p-0 bg-white dark:bg-slate-900">
          <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                {editId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              {editId ? t('banner.edit') : t('banner.create')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-black uppercase tracking-widest text-slate-500">{t('banner.image')}</Label>
                {imageVal && (
                  <Badge variant="outline" className="rounded-lg font-bold text-indigo-500 bg-indigo-50/50 border-indigo-100">
                    <ImageIcon className="h-3 w-3 mr-1.5" /> Бор шуд
                  </Badge>
                )}
              </div>
              <div className="aspect-[21/9] rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                <ImageUpload 
                  value={imageVal} 
                  onChange={(url) => setValue('image', url)} 
                  className="h-full w-full"
                />
              </div>
              {errors.image && <p className="text-xs font-bold text-red-500 animate-pulse">{errors.image.message}</p>}
            </div>

            {/* Multilingual Tabs or Sections */}
            <div className="space-y-6">
               <Label className="text-sm font-black uppercase tracking-widest text-slate-500">Маълумоти матнӣ</Label>
               
               <div className="space-y-8">
                 {/* TJ */}
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-4 bg-red-500 rounded-sm" title="TJ" />
                      <span className="text-xs font-black uppercase text-slate-400">Тоҷикӣ (TJ)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs font-bold">{t('banner.titleTj')}</Label><Input className="rounded-xl border-slate-200" {...register('titleTj')} /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-bold">{t('banner.subtitleTj')}</Label><Input className="rounded-xl border-slate-200" {...register('subtitleTj')} /></div>
                      <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-bold">{t('banner.buttonTextTj')}</Label><Input className="rounded-xl border-slate-200" {...register('buttonTextTj')} /></div>
                    </div>
                 </div>

                 {/* RU */}
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-4 bg-blue-500 rounded-sm" title="RU" />
                      <span className="text-xs font-black uppercase text-slate-400">Русский (RU)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs font-bold">{t('banner.titleRu')}</Label><Input className="rounded-xl border-slate-200" {...register('titleRu')} /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-bold">{t('banner.subtitleRu')}</Label><Input className="rounded-xl border-slate-200" {...register('subtitleRu')} /></div>
                      <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-bold">{t('banner.buttonTextRu')}</Label><Input className="rounded-xl border-slate-200" {...register('buttonTextRu')} /></div>
                    </div>
                 </div>

                 {/* EN */}
                 <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-4 bg-emerald-500 rounded-sm" title="EN" />
                      <span className="text-xs font-black uppercase text-slate-400">English (EN)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs font-bold">{t('banner.titleEn')}</Label><Input className="rounded-xl border-slate-200" {...register('titleEn')} /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-bold">{t('banner.subtitleEn')}</Label><Input className="rounded-xl border-slate-200" {...register('subtitleEn')} /></div>
                      <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-bold">{t('banner.buttonTextEn')}</Label><Input className="rounded-xl border-slate-200" {...register('buttonTextEn')} /></div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Links & Settings */}
            <div className="space-y-6">
              <Label className="text-sm font-black uppercase tracking-widest text-slate-500">Пайванд ва Танзимот</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{t('banner.link')}</Label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="https://..." className="pl-10 rounded-xl" {...register('link')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{t('banner.order')}</Label>
                  <div className="relative">
                    <GripVertical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="number" className="pl-10 rounded-xl" {...register('order')} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 transition-all hover:bg-indigo-50/50">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t('banner.active')}</span>
                  <span className="text-xs text-slate-500">Баннерро дар саҳифаи асосӣ нишон диҳед</span>
                </div>
                <Switch checked={isActiveVal} onCheckedChange={(v) => setValue('isActive', v)} />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" className="rounded-xl px-8" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-indigo-500/20" disabled={mutation.isPending}>
                {mutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                {mutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} 
        loading={deleteMutation.isPending} 
      />
    </div>
  );
}
