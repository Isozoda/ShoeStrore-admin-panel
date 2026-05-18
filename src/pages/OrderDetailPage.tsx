import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ordersApi } from '@/api/orders.api';
import { OrderStatusSelect } from '@/components/orders/OrderStatusSelect';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice, getImageUrl, parseAmount, PLACEHOLDER_IMAGE } from '@/lib/utils';
import { Phone, ArrowLeft, MapPin, MessageSquare, Send } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" className="text-indigo-600" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Дар ҳоли боргузорӣ...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <MapPin className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Фармоиш ёфт нашуд</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8">
          Бубахшед, фармоиш бо ин ID ёфт нашуд ё дастрасӣ ба он маҳдуд аст.
        </p>
        <Button 
          onClick={() => navigate('/orders')} 
          className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          Ба рӯйхати фармоишҳо
        </Button>
      </div>
    );
  }

  // Safe data extraction
  const orderId = order.id || id || 'N/A';
  const orderNum = order.orderNumber || orderId.slice(-8).toUpperCase();
  const clientPhone = order.clientPhone || order.phone || '';
  const cleanPhone = clientPhone.replace(/\D/g, '');
  const items = order.items || [];
  const status = order.status || 'PENDING';
  const contactMethod = order.contactMethod || 'CALL';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={`${t('order.detail')} #${orderNum}`}
        breadcrumbs={[
          { label: 'Admin' }, 
          { label: t('nav.orders'), href: '/orders' }, 
          { label: `#${orderNum}` }
        ]}
        action={
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('order.back')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: order info + items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {t('order.items')}
                <span className="ml-auto text-xs font-normal text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                  {items.length} номгӯй
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {items.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 italic">Маҳсулот ворид нашудааст</div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-5 p-5 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm bg-slate-50 dark:bg-slate-800/50">
                        <img
                          src={getImageUrl(item.product?.images?.[0]?.url || (item.product as any)?.image || (item.product as any)?.imageUrl || '')}
                          alt={item.product?.nameRu || (item.product as any)?.name_ru || 'Product'}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded uppercase tracking-widest">
                            {item.product?.category?.nameRu || (item.product as any)?.category?.name_ru || 'Бе категория'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">
                          {item.product?.nameRu || (item.product as any)?.name_ru || 'Маҳсулоти номаълум'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {item.size && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              📏 {item.size}
                            </span>
                          )}
                          {item.colorName && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              🎨 {item.colorName}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-indigo-500">
                            ✕ {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-slate-100 text-lg tracking-tight">
                          {formatPrice((parseAmount(item.price) || parseAmount(item.product?.finalPrice) || parseAmount(item.product?.price)) * item.quantity)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatPrice(parseAmount(item.price) || parseAmount(item.product?.finalPrice) || parseAmount(item.product?.price))} / дона
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-6 flex items-center justify-between border-t border-indigo-100/50 dark:border-indigo-900/20">
                <span className="font-bold text-slate-600 dark:text-slate-400 tracking-wide uppercase text-xs">{t('common.total')}</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                  {formatPrice(parseAmount(order.totalAmount) || items.reduce((sum, item) => sum + (parseAmount(item.price) || parseAmount(item.product?.finalPrice) || parseAmount(item.product?.price)) * item.quantity, 0))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status update */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{t('order.updateStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <OrderStatusSelect orderId={orderId} currentStatus={status} />
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          {order.note && (
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden border-l-4 border-l-indigo-500">
              <CardHeader><CardTitle className="text-lg font-bold">{t('order.note')}</CardTitle></CardHeader>
              <CardContent className="pb-8">
                <div className="text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 leading-relaxed italic">
                  "{order.note}"
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: client info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-indigo-600 dark:bg-indigo-700">
              <CardTitle className="text-white flex items-center justify-between">
                <span>{t('order.client')}</span>
                <StatusBadge status={status} className="bg-white/20 border-white/30 text-white" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                <UserAvatar 
                  user={order.user || { name: order.clientName || order.name || '?' }} 
                  size="lg" 
                  className="rounded-full h-14 w-14" 
                />
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100 leading-none">
                    {order.clientName || order.name || 'Маҳсулоти номаълум'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4 text-sm group">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{clientPhone || 'Рақам мавҷуд нест'}</span>
                </div>
                {order.address && (
                  <div className="flex items-start gap-4 text-sm group">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {order.address || order.clientAddress || 'Суроға ворид нашудааст'}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm group">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {contactMethod === 'CALL' ? '📞 Занг' : contactMethod === 'TELEGRAM' ? '✈️ Telegram' : '💬 WhatsApp'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-6">
                {clientPhone && (
                  <a href={`tel:${clientPhone}`} className="w-full">
                    <Button className="w-full gap-2 rounded-2xl h-12 font-bold" variant="outline">
                      <Phone className="h-4 w-4" />
                      {t('order.call')}
                    </Button>
                  </a>
                )}
                
                {contactMethod === 'TELEGRAM' && cleanPhone && (
                  <a href={`https://t.me/+${cleanPhone}`} target="_blank" rel="noreferrer" className="w-full">
                    <Button className="w-full gap-2 rounded-2xl h-12 font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 border-none transition-all hover:scale-[1.02] active:scale-95">
                      <Send className="h-4 w-4" />
                      Telegram
                    </Button>
                  </a>
                )}
                
                {contactMethod === 'WHATSAPP' && cleanPhone && (
                  <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="w-full">
                    <Button className="w-full gap-2 rounded-2xl h-12 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-none transition-all hover:scale-[1.02] active:scale-95">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
