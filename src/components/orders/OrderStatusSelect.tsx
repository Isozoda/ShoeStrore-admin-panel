import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { ordersApi } from '@/api/orders.api';
import { type OrderStatus } from '@/types';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<OrderStatus>(currentStatus);

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success(t('common.success'));
    },
    onError: () => toast.error(t('common.error')),
  });

  return (
    <div className="flex gap-2 items-center">
      <Select value={selected} onValueChange={(v) => setSelected(v as OrderStatus)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{t(`order.${s}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={() => mutation.mutate(selected)}
        disabled={selected === currentStatus || mutation.isPending}
        className="gap-1"
      >
        <Check className="h-3.5 w-3.5" />
        {t('common.confirm')}
      </Button>
    </div>
  );
}
