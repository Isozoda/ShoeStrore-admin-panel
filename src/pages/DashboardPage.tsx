import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardApi } from '@/api/dashboard.api';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OrdersChart } from '@/components/dashboard/OrdersChart';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function DashboardPage() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">{t('common.error')}</p>
          <p className="text-xs text-slate-400 mt-1">Backend-ро санҷед</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={t('nav.dashboard')} />

      <StatsRow stats={data.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart data={data.revenueChart} />
        </div>
        <OrdersChart data={data.ordersByStatus} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={data.recentOrders} />
        </div>
        <TopProductsChart data={data.topProducts} />
      </div>
    </div>
  );
}
