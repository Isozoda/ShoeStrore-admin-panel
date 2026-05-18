import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Номро ворид кунед'),
  phone: z.string().min(9, 'Рақами телефонро дуруст ворид кунед'),
  password: z.string().min(6, 'Парол ҳадди ақал 6 аломат бошад'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Паролҳо мувофиқат намекунанд',
  path: ['confirmPassword'],
});
type Form = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const res = await authApi.register(data.name, data.phone, data.password);
      if (res.user.role !== 'ADMIN') {
        toast.error(t('auth.noAccess'));
        return;
      }
      setAuth(res.user, res.accessToken);
      toast.success(t('common.success'));
      navigate('/dashboard');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-100/50 blur-3xl dark:bg-violet-900/20" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-xl p-8 dark:border-slate-700/50 dark:bg-slate-900/80">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('auth.register')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('auth.adminOnly')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('auth.name')}</Label>
              <Input placeholder="Ном ва насаб" className="h-11" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t('auth.phone')}</Label>
              <Input type="tel" placeholder="+992 XX XXX XXXX" className="h-11" {...register('phone')} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t('auth.password')}</Label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="h-11 pr-10" {...register('password')} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t('auth.confirmPassword')}</Label>
              <Input type="password" placeholder="••••••••" className="h-11" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? t('common.loading') : t('auth.register')}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Аллакай аккаунт дорид?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
