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
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-slate-200/70 bg-white/70 shadow-[0_0_0_1px_rgba(148,163,184,0.12)] backdrop-blur-xl transition-all duration-300 ease-out dark:border-slate-700/60 dark:bg-slate-950/80',
        collapsed ? 'w-[80px]' : 'w-[264px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b border-slate-200/70 dark:border-slate-700/60', collapsed ? 'justify-center px-4' : 'px-6')}>
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-500/20 ring-1 ring-white/10">
            S
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-500/20 ring-1 ring-white/10">
              S
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">ShoeStore</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin Panel</p>
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
                        'relative flex h-12 w-12 items-center justify-center rounded-3xl border border-transparent transition-all duration-200 ease-out mx-auto',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-[0_10px_30px_-24px_rgba(79,70,229,0.9)] ring-1 ring-indigo-500/30'
                          : 'text-slate-500 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white shadow-sm shadow-black/20">
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
                  'relative flex h-12 items-center gap-3 rounded-3xl px-4 text-sm font-medium transition-all duration-200 ease-out',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-[0_12px_30px_-24px_rgba(79,70,229,0.85)] ring-1 ring-indigo-500/30'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )
              }
            >
              <div className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-2xl bg-slate-100/80 text-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <Icon className="h-5 w-5" />
              </div>
              <span className="flex-1 truncate">{t(item.label)}</span>
              {showBadge && (
                <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white shadow-sm shadow-black/20">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-slate-200/70 dark:border-slate-700/60 p-3">
        <button
          onClick={onToggle}
          className={cn(
            'flex h-11 w-full items-center rounded-3xl border border-slate-200/80 bg-slate-100/70 px-4 text-sm font-medium text-slate-600 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-200 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800',
            collapsed ? 'justify-center' : 'gap-2'
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">Ҷамъ кардан</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
