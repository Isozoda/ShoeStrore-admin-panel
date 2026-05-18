import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { settingsApi } from '@/api/settings.api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Settings } from '@/types';
import { Save, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });

  const { register, handleSubmit, setValue, watch, reset } = useForm<Settings>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const logoVal = watch('logo', '');
  const faviconVal = watch('favicon', '');

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Танзимот нигоҳ дошта шуд');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || t('common.error');
      const displayMsg = Array.isArray(errMsg) ? errMsg.join(', ') : errMsg;
      toast.error(displayMsg, { id: 'settings-save-error' });
    },
  });

  const testMutation = useMutation({
    mutationFn: settingsApi.testTelegram,
    onSuccess: () => toast.success(t('settings.testSent')),
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || t('common.error');
      const displayMsg = Array.isArray(errMsg) ? errMsg.join(', ') : errMsg;
      toast.error(displayMsg, { id: 'telegram-test-error' });
    },
  });

  if (isLoading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title={t('nav.settings')} breadcrumbs={[{ label: 'Admin' }, { label: t('nav.settings') }]} />

      <form onSubmit={handleSubmit((d) => {
        if (saveMutation.isPending) return;
        saveMutation.mutate(d);
      })}>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
            <TabsTrigger value="telegram">{t('settings.telegram')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">{t('settings.storeName')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[['storeNameRu', t('settings.storeNameRu')], ['storeNameTj', t('settings.storeNameTj')], ['storeNameEn', t('settings.storeNameEn')]].map(([f, l]) => (
                      <div key={f} className="space-y-1.5">
                        <Label className="text-xs">{l}</Label>
                        <Input {...register(f as keyof Settings)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">{t('settings.phone')}</Label><Input {...register('phone')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('settings.email')}</Label><Input type="email" {...register('email')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('settings.whatsapp')}</Label><Input {...register('whatsapp')} /></div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">{t('settings.address')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[['addressRu', t('settings.addressRu')], ['addressTj', t('settings.addressTj')], ['addressEn', t('settings.addressEn')]].map(([f, l]) => (
                      <div key={f} className="space-y-1.5">
                        <Label className="text-xs">{l}</Label>
                        <Input {...register(f as keyof Settings)} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram */}
          <TabsContent value="telegram">
            <Card>
              <CardContent className="p-6 space-y-4 max-w-lg">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Telegram Bot тарҳбандӣ</p>
                  <p className="text-xs opacity-80">1. @BotFather → /newbot → Bot token-ро гиред</p>
                  <p className="text-xs opacity-80">2. Ботро ба каналтон илова кунед</p>
                  <p className="text-xs opacity-80">3. Chat ID-ро аз @userinfobot гиред</p>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('settings.botToken')}</Label>
                  <Input type="password" placeholder="1234567890:AAH..." {...register('telegramBotToken')} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('settings.chatId')}</Label>
                  <Input placeholder="-100..." {...register('telegramChatId')} />
                </div>
                <Button type="button" variant="secondary" className="gap-2" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
                  <Send className="h-4 w-4" />
                  {testMutation.isPending ? t('common.loading') : t('settings.testTelegram')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>{t('settings.logo')}</Label>
                    <ImageUpload value={logoVal} onChange={(url) => setValue('logo', url)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('settings.favicon')}</Label>
                    <ImageUpload value={faviconVal} onChange={(url) => setValue('favicon', url)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button type="submit" className="gap-2" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
