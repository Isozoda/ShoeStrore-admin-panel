import { ShoppingBag, TrendingUp, Users, Clock } from 'lucide-react';
import { StatsCard } from '../ui/StatsCard';
import { useTranslation } from 'react-i18next';
import type { DashboardStats } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  stats: DashboardStats;
}

export function StatsRow({ stats }: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title={t('dashboard.totalOrders')}
        value={stats.totalOrders.toLocaleString()}
        icon={ShoppingBag}
        color="blue"
      />
      <StatsCard
        title={t('dashboard.monthRevenue')}
        value={formatPrice(stats.monthRevenue)}
        icon={TrendingUp}
        color="green"
        growth={stats.monthRevenueGrowth}
        subtitle={t('dashboard.growthVsLastMonth')}
      />
      <StatsCard
        title={t('dashboard.activeUsers')}
        value={stats.activeUsers.toLocaleString()}
        icon={Users}
        color="purple"
      />
      <StatsCard
        title={t('dashboard.pendingOrders')}
        value={stats.pendingOrders.toLocaleString()}
        icon={Clock}
        color="amber"
      />
    </div>
  );
}
