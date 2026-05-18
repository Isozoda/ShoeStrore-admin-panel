import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDate, formatPrice, getImageUrl } from '@/lib/utils';
import type { Order } from '@/types';
import { ExternalLink } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';

interface Props {
  orders: Order[];
}

export function RecentOrdersTable({ orders }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('order.number')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('order.client')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('order.amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('order.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('order.date')}</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={`border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'}`}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">
                    #{order.orderNumber || order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        user={order.user || { name: order.clientName || order.name || '?' }} 
                        size="sm" 
                        className="h-8 w-8" 
                      />
                      <span className="text-slate-600 dark:text-slate-300 truncate">
                        {order.clientName || order.user?.name || order.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{formatPrice(order.totalAmount)}</td>
                  <td className="px-6 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-3">
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
