import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Tag, Users,
  Image, Star, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  pendingCount?: number;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { to: '/orders', icon: ShoppingBag, label: 'nav.orders', badge: true },
  { to: '/products', icon: Package, label: 'nav.products' },
  { to: '/categories', icon: FolderOpen, label: 'nav.categories' },
  { to: '/brands', icon: Tag, label: 'nav.brands' },
  { to: '/users', icon: Users, label: 'nav.users' },
  { to: '/banners', icon: Image, label: 'nav.banners' },
  { to: '/reviews', icon: Star, label: 'nav.reviews' },
  { to: '/settings', icon: Settings, label: 'nav.settings' },
];

export function Sidebar({ collapsed, onToggle, pendingCount }: Props) {
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-900',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b border-slate-200 dark:border-slate-700', collapsed ? 'justify-center px-4' : 'px-6')}>
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">S</div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">S</div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">ShoeStore</p>
              <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showBadge = item.badge && pendingCount && pendingCount > 0;

          if (collapsed) {
            return (
              <Tooltip key={item.to} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-lg transition-all mx-auto',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                        {pendingCount}
                      </span>
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{t(item.label)}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 truncate">{t(item.label)}</span>
              {showBadge && (
                <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-2">
        <button
          onClick={onToggle}
          className={cn(
            'flex h-9 w-full items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors',
            collapsed ? 'justify-center' : 'gap-2 px-3'
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Ҷамъ кардан</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
