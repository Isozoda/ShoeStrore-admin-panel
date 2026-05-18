import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import type { OrdersByStatus } from '@/types';

interface Props {
  data: OrdersByStatus[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#3B82F6',
  PROCESSING: '#8B5CF6',
  SHIPPED: '#6366F1',
  DELIVERED: '#10B981',
  CANCELLED: '#EF4444',
};

export function OrdersChart({ data }: Props) {
  const { t } = useTranslation();

  const chartData = data.map((d) => ({
    name: t(`order.${d.status}`),
    count: d.count,
    status: d.status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.ordersChart')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }}
              cursor={{ fill: 'rgba(100,116,139,0.08)' }}
            />
            <Bar dataKey="count" name="Шумора" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={STATUS_COLORS[entry.status] || '#6366F1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
