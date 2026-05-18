import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, action }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumbs.length - 1 ? 'text-slate-600 dark:text-slate-300 font-medium' : ''}>
                  {b.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
