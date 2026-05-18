import { PackageSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  message?: string;
}

export function EmptyState({ message }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
          <PackageSearch className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('common.noData')}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">
        {message || 'Дар айни замон ягон маълумот барои намоиш мавҷуд нест.'}
      </p>
    </div>
  );
}
