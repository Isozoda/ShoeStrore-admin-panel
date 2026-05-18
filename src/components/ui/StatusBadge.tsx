import { Badge } from './badge';
import type { OrderStatus } from '@/types';
import { useTranslation } from 'react-i18next';

const statusConfig: Record<OrderStatus, { variant: 'warning' | 'blue' | 'purple' | 'indigo' | 'success' | 'destructive'; label: string }> = {
  PENDING: { variant: 'warning', label: 'order.PENDING' },
  CONFIRMED: { variant: 'blue', label: 'order.CONFIRMED' },
  PROCESSING: { variant: 'purple', label: 'order.PROCESSING' },
  SHIPPED: { variant: 'indigo', label: 'order.SHIPPED' },
  DELIVERED: { variant: 'success', label: 'order.DELIVERED' },
  CANCELLED: { variant: 'destructive', label: 'order.CANCELLED' },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  return <Badge variant={config.variant} className={className}>{t(config.label)}</Badge>;
}
