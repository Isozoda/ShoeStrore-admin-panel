import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { productsApi, type ProductsFilter } from '@/api/products.api';
import { categoriesApi } from '@/api/categories.api';
import { brandsApi } from '@/api/brands.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice, getImageUrl, PLACEHOLDER_IMAGE } from '@/lib/utils';
import type { Product } from '@/types';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const filters: ProductsFilter = { page, limit: 20, search: debouncedSearch, categoryId, brandId };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', filters],
    queryFn: () => productsApi.getAll(filters),
  });
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: brands, isLoading: isBrandsLoading } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.getAll });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => productsApi.toggleActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteId(null);
      toast.success(t('common.success'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: '',
      cell: (p) => (
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
          <img
            src={p.images?.[0]?.url ? getImageUrl(p.images[0].url) : PLACEHOLDER_IMAGE}
            alt={p.nameRu}
            className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
          />
        </div>
      ),
      className: 'w-16',
    },
    {
      key: 'name',
      header: t('product.name'),
      cell: (p) => (
        <div className="min-w-[120px]">
          <p className="font-bold text-slate-900 dark:text-slate-100 leading-snug">{p.nameRu || (p as any).name_ru}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-tight">{p.sku}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('product.category'),
      cell: (p) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
          {p.category?.nameRu || p.category?.nameTj || (p.category as any)?.name_ru || 'Бе категория'}
        </span>
      ),
    },
    {
      key: 'price',
      header: t('product.price'),
      cell: (p) => (
        <div>
          <p className="font-medium">{formatPrice(p.finalPrice)}</p>
          {p.discountPercent > 0 && (
            <p className="text-xs text-slate-400 line-through">{formatPrice(p.price)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: t('product.stock'),
      cell: (p) => (
        <Badge variant={p.stock > 0 ? 'success' : 'destructive'}>{p.stock}</Badge>
      ),
    },
    {
      key: 'active',
      header: t('product.active'),
      cell: (p) => (
        <Switch
          checked={p.isActive}
          onCheckedChange={(v) => toggleMutation.mutate({ id: p.id, isActive: v })}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      cell: (p) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/products/${p.id}/edit`)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteId(p.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title={t('nav.products')}
        breadcrumbs={[{ label: 'Admin' }, { label: t('nav.products') }]}
        action={
          <Button className="gap-2" onClick={() => navigate('/products/new')}>
            <Plus className="h-4 w-4" />
            {t('product.create')}
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={t('common.search')} 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            className="pl-9 bg-slate-50/50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20" 
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <Select 
            value={categoryId || 'all'} 
            onValueChange={(v) => { setCategoryId(v === 'all' ? '' : v); setPage(1); }}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-slate-50/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20">
              <SelectValue placeholder={t('product.category')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <SelectItem value="all" className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400">
                {t('common.allCategories') || 'Ҳама категорияҳо'}
              </SelectItem>
              {isCategoriesLoading ? (
                <div className="p-4 text-center">
                  <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[10px] text-slate-400">Боргузорӣ...</p>
                </div>
              ) : categories && categories.length > 0 ? (
                categories.map((c) => (
                  <SelectItem 
                    key={c.id} 
                    value={c.id} 
                    className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400"
                  >
                    {c.nameRu || c.nameTj || (c as any).name_ru || 'Бе ном'}
                  </SelectItem>
                ))
              ) : (
                <p className="p-3 text-center text-xs text-slate-400 italic">Категория ёфт нашуд</p>
              )}
            </SelectContent>
          </Select>

          {/* Brand Filter */}
          <Select 
            value={brandId || 'all'} 
            onValueChange={(v) => { setBrandId(v === 'all' ? '' : v); setPage(1); }}
          >
            <SelectTrigger className="w-full md:w-[150px] bg-slate-50/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20">
              <SelectValue placeholder={t('product.brand')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <SelectItem value="all" className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400">
                {t('common.allBrands') || 'Ҳама брендҳо'}
              </SelectItem>
              {isBrandsLoading ? (
                <div className="p-4 text-center">
                  <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[10px] text-slate-400">Боргузорӣ...</p>
                </div>
              ) : brands && brands.length > 0 ? (
                brands.map((b) => (
                  <SelectItem 
                    key={b.id} 
                    value={b.id} 
                    className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400"
                  >
                    {b.name}
                  </SelectItem>
                ))
              ) : (
                <p className="p-3 text-center text-xs text-slate-400 italic">Бренд ёфт нашуд</p>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        total={data?.total}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
