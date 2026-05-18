import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';
import { TooltipProvider } from '../ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: ordersData } = useQuery({
    queryKey: ['orders-count'],
    queryFn: () => ordersApi.getAll({ limit: 1 }),
    refetchInterval: 30000,
  });

  const totalOrdersCount = ordersData?.total ?? 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} pendingCount={totalOrdersCount} />
        </div>
        {/* Mobile sidebar */}
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} pendingCount={totalOrdersCount} />

        {/* Main content */}
        <div className={cn('flex min-h-screen flex-col transition-all duration-300', collapsed ? 'md:pl-[72px]' : 'md:pl-[260px]')}>
          <Header onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 pt-16">
            <div className="mx-auto max-w-[1400px] p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
