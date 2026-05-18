import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { reviewsApi, type ReviewsFilter } from '@/api/reviews.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { formatDate, getImageUrl, cn } from '@/lib/utils';
import type { Review } from '@/types';
import { Star, Trash2, Check, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
    </div>
  );
}

export function ReviewsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | 'ALL'>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filters: ReviewsFilter = { 
    page, 
    limit: 20, 
    rating: rating === 'ALL' ? undefined : rating,
    status: status === 'ALL' ? undefined : status
  };

  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['reviews', filters], 
    queryFn: () => reviewsApi.getAll(filters) 
  });

  const updateStatusMutation = useMutation({
    mutationFn: reviewsApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Ҳолати шарҳ бовафо тағйир дода шуд');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Хатогӣ ҳангоми тағйири ҳолат';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setDeleteId(null);
      toast.success('Шарҳ бовафо нест карда шуд');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Хатогӣ ҳангоми нест кардани шарҳ';
      toast.error(msg);
    },
  });

  const columns: Column<Review>[] = [
    {
      key: 'user',
      header: t('review.user') || 'Корбар',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={r.user} className="h-9 w-9" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 dark:text-slate-100">{r.user?.name || '—'}</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">{r.user?.phone || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      header: t('review.product') || 'Маҳсулот',
      cell: (r) => {
        const image = r.product?.images?.[0]?.url;
        return (
          <div className="flex items-center gap-3">
            {image ? (
              <img 
                src={getImageUrl(image)} 
                alt={r.product?.nameRu || ''} 
                className="h-10 w-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm shrink-0" 
              />
            ) : (
              <div className="flex h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 text-slate-400" />
              </div>
            )}
            <div className="flex flex-col min-w-0 max-w-[200px]">
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{r.product?.nameRu || '—'}</span>
              <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">{r.product?.sku || '—'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'rating',
      header: t('review.rating') || 'Рейтинг',
      cell: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: 'comment',
      header: t('review.comment') || 'Шарҳ',
      cell: (r) => r.comment ? (
        <div className="max-w-xs space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed truncate hover:text-indigo-500 hover:cursor-pointer transition-colors" title={r.comment}>
            {r.comment}
          </p>
        </div>
      ) : <span className="text-slate-300 dark:text-slate-700">—</span>,
    },
    {
      key: 'status',
      header: 'Ҳолат',
      cell: (r) => {
        const val = r.status || 'PENDING';
        return (
          <Badge
            className={cn(
              "font-black uppercase tracking-widest text-[9px] px-2.5 py-1 rounded-full border-none",
              val === 'APPROVED' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              val === 'REJECTED' && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              val === 'PENDING' && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            {val === 'APPROVED' ? 'Тасдиқшуда' : val === 'REJECTED' ? 'Радшуда' : 'Интизор'}
          </Badge>
        );
      }
    },
    {
      key: 'date',
      header: t('review.date') || 'Сана',
      cell: (r) => <span className="text-xs font-bold text-slate-400 dark:text-slate-500 leading-none">{formatDate(r.createdAt)}</span>
    },
    {
      key: 'actions',
      header: t('common.actions') || 'Амалҳо',
      cell: (r) => {
        const isApproving = updateStatusMutation.isPending && updateStatusMutation.variables?.id === r.id && updateStatusMutation.variables?.status === 'APPROVED';
        const isRejecting = updateStatusMutation.isPending && updateStatusMutation.variables?.id === r.id && updateStatusMutation.variables?.status === 'REJECTED';
        
        return (
          <div className="flex items-center gap-1">
            {r.status !== 'APPROVED' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20" 
                onClick={() => updateStatusMutation.mutate({ id: r.id, status: 'APPROVED' })}
                disabled={updateStatusMutation.isPending}
                title="Тасдиқ кардан"
              >
                {isApproving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            )}
            {r.status !== 'REJECTED' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20" 
                onClick={() => updateStatusMutation.mutate({ id: r.id, status: 'REJECTED' })}
                disabled={updateStatusMutation.isPending}
                title="Рад кардан"
              >
                {isRejecting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20" 
              onClick={() => setDeleteId(r.id)}
              disabled={deleteMutation.isPending || updateStatusMutation.isPending}
              title="Нест кардан"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl p-6">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/5">
          <X className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Ҳангоми боргузории шарҳҳо хатогӣ рӯй дод</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[280px] text-center">Лутфан саҳифаро аз нав бор кунед ё дертар кӯшиш намоед.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader title={t('nav.reviews')} breadcrumbs={[{ label: 'Admin' }, { label: t('nav.reviews') }]} />

      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none ml-1">Ҳолати шарҳ</span>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300">
              <SelectValue placeholder="Ҳамаи ҳолатҳо" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
              <SelectItem value="ALL" className="font-medium rounded-xl">Ҳамаи ҳолатҳо</SelectItem>
              <SelectItem value="PENDING" className="font-medium rounded-xl">Интизор (PENDING)</SelectItem>
              <SelectItem value="APPROVED" className="font-medium rounded-xl">Тасдиқшуда (APPROVED)</SelectItem>
              <SelectItem value="REJECTED" className="font-medium rounded-xl">Радшуда (REJECTED)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none ml-1">Рейтинги шарҳ</span>
          <Select value={String(rating)} onValueChange={(v) => { setRating(v === 'ALL' ? 'ALL' : Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300">
              <SelectValue placeholder={t('review.filterByRating')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
              <SelectItem value="ALL" className="font-medium rounded-xl">{t('review.allRatings')}</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)} className="font-medium rounded-xl">
                  <div className="flex items-center gap-1">
                    {'★'.repeat(r)}{'☆'.repeat(5 - r)} ({r})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!data || !data.data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
              <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Шарҳҳо мавҷуд нест</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto">
            Дар айни замон ягон шарҳ ё фикру мулоҳиза аз тарафи мизоҷон сабт نشدهаст.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={data.data} 
            loading={isLoading} 
            page={page} 
            totalPages={data.totalPages} 
            onPageChange={setPage} 
            total={data.total} 
          />
        </div>
      )}

      <ConfirmDialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} 
        loading={deleteMutation.isPending} 
      />
    </div>
  );
}
