import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Tag, Users,
  Image, Star, Settings, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
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

export function MobileSidebar({ open, onClose, pendingCount }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 animate-slide-in">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">S</div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">ShoeStore Admin</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const showBadge = item.badge && pendingCount && pendingCount > 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{t(item.label)}</span>
                {showBadge && (
                  <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
