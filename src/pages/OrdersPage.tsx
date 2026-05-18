import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ordersApi, type OrdersFilter } from '@/api/orders.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatPrice, getImageUrl, parseAmount, PLACEHOLDER_IMAGE } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { Download, Eye, Search } from 'lucide-react';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function exportCSV(orders: Order[]) {
  const rows = [
    ['#', 'Мизоҷ', 'Телефон', 'Маблағ', 'Ҳолат', 'Тарзи тамос', 'Сана'],
    ...orders.map((o) => [
      o.orderNumber || o.id.slice(0, 8),
      o.name,
      o.phone,
      o.totalAmount,
      o.status,
      o.contactMethod,
      formatDate(o.createdAt),
    ]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `orders-${Date.now()}.csv`;
  a.click();
}

export function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const debouncedSearch = useDebounce(search);

  const filters: OrdersFilter = { 
    page, 
    limit: 20, 
    search: debouncedSearch, 
    status: status === 'ALL' ? '' : status 
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getAll(filters),
  });

  if (error) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Хатогӣ дар боргузорӣ</h2>
        <p className="text-slate-500 mb-4">Дар вақти гирифтани фармоишҳо хатогӣ рух дод.</p>
        <Button onClick={() => window.location.reload()}>Дубора кӯшиш кунед</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={t('nav.orders')}
        breadcrumbs={[{ label: 'Admin' }, { label: t('nav.orders') }]}
        action={
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" 
            onClick={() => data?.data && exportCSV(data.data)}
          >
            <Download className="h-4 w-4 text-indigo-500" />
            {t('order.exportCSV')}
          </Button>
        }
      />

      {/* Filters Section */}
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
          <Select value={status} onValueChange={(v) => { setStatus(v as OrderStatus | 'ALL'); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[200px] bg-slate-50/50 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-indigo-500/20">
              <SelectValue placeholder={t('order.filterByStatus')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 shadow-xl">
              <SelectItem value="ALL" className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400">
                {t('order.allStatuses')}
              </SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20 focus:text-indigo-600 dark:focus:text-indigo-400">
                  {t(`order.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Фармоиш ёфт нашуд</h3>
          <p className="text-slate-500">Кӯшиш кунед, ки филтрҳоро тағйир диҳед.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {data.data.map((order, idx) => {
            const dbTotal = parseAmount(order.totalAmount);
            // Calculate total from items as fallback or validation
            const itemsTotal = order.items?.reduce((sum, item) => {
              // Fallback to current product price if purchase price is 0 (for old/broken data)
              const itemPrice = parseAmount(item.price) || parseAmount(item.product?.finalPrice) || parseAmount(item.product?.price);
              return sum + (itemPrice * (item.quantity || 1));
            }, 0) || 0;
            
            // Use the higher value or dbTotal if valid
            const finalDisplayTotal = dbTotal > 0 ? dbTotal : itemsTotal;

            // Short readable order number
            const displayOrderNum = order.orderNumber ? 
              (order.orderNumber.includes('-') ? order.orderNumber.split('-').reverse()[0] : order.orderNumber.slice(-4)) : 
              order.id.slice(-4).toUpperCase();

            return (
              <div 
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col md:flex-row gap-6"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Left Section: Client Avatar & ID */}
                <div className="flex-shrink-0 w-full md:w-56 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-inner overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                      {order.user?.avatar ? (
                        <img 
                          src={getImageUrl(order.user.avatar)} 
                          alt={order.clientName || order.user?.name || 'Customer'} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span>{(order.clientName || order.user?.name || order.name || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">#{displayOrderNum}</p>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Фармоиш</p>
                      </div>
                      <h4 className="font-mono text-[11px] text-slate-400 truncate max-w-full" title={order.orderNumber || order.id}>
                        ID: {order.orderNumber || order.id}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {order.clientName || order.name || 'Мизоҷи номаълум'}
                    </p>
                    <p className="text-xs font-medium text-indigo-500 flex items-center gap-1.5">
                      <span className="opacity-70">📞</span> {order.clientPhone || order.phone || '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                      <span className="opacity-70">🕒</span> {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Middle Section: Purchased Products */}
                <div className="flex-1 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800/50 py-4 md:py-0 md:px-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Маҳсулотҳо ({order.items?.length || 0})</p>
                  <div className="space-y-3 max-h-32 overflow-hidden relative">
                    {order.items?.slice(0, 2).map((item) => {
                      // Support both camelCase and snake_case from backend
                      const productName = item.product?.nameRu || (item.product as any)?.name_ru || 'Маҳсулот';
                      const productImage = item.product?.images?.[0]?.url || (item.product as any)?.images?.[0]?.url || '';

                      return (
                        <div key={item.id} className="flex items-center gap-3 group/item">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex-shrink-0 shadow-sm">
                            <img 
                              src={getImageUrl(productImage)} 
                              alt={productName}
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                {productName}
                              </p>
                              <span className="text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">
                                {item.product?.category?.nameRu || (item.product as any)?.category?.name_ru || 'Бе категория'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>📦 Андоза: {item.size || '—'}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>× {item.quantity}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {order.items?.length > 2 && (
                      <p className="text-[10px] text-indigo-500 font-bold mt-1 bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-0.5 rounded w-fit">
                        + боз {order.items.length - 2} маҳсулот
                      </p>
                    )}
                    {(!order.items || order.items.length === 0) && (
                      <p className="text-xs text-slate-400 italic">Рӯйхати маҳсулот холӣ аст</p>
                    )}
                  </div>
                </div>

                {/* Right Section: Amount & Status */}
                <div className="flex-shrink-0 w-full md:w-48 flex flex-col justify-between items-end gap-4">
                  <div className="text-right w-full">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('order.amount')}</p>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                      {formatPrice(finalDisplayTotal)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 w-full">
                    <StatusBadge status={order.status} />
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter border shadow-sm ${
                         order.contactMethod === 'TELEGRAM' ? 'bg-sky-50 border-sky-100 text-sky-600 dark:bg-sky-900/20 dark:border-sky-800' :
                         order.contactMethod === 'WHATSAPP' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' :
                         'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800'
                       }`}>
                        {order.contactMethod === 'CALL' ? '📞 CALL' : order.contactMethod === 'TELEGRAM' ? '✈️ TG' : '💬 WA'}
                      </span>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all active:scale-95">
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500">
            Намоиши <span className="font-medium text-slate-900 dark:text-slate-200">{(page - 1) * 20 + 1}</span> - <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(page * 20, data.total)}</span> аз <span className="font-medium text-slate-900 dark:text-slate-200">{data.total}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg"
            >
              Қаблӣ
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg"
            >
              Баъдӣ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

