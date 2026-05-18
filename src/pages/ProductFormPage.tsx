import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productsApi, type ProductFormData } from '@/api/products.api';
import { categoriesApi } from '@/api/categories.api';
import { brandsApi } from '@/api/brands.api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProductImagesManager } from '@/components/products/ProductImagesManager';
import { MultiImageUpload } from '@/components/ui/ImageUpload';
import { generateSKU } from '@/lib/utils';
import { ArrowLeft, Wand2, Plus, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  nameRu: z.string().min(1, 'Ному (РУ) ворид кунед'),
  nameTj: z.string().min(1, 'Ному (ТД) ворид кунед'),
  nameEn: z.string().min(1, 'Ному (EN) ворид кунед'),
  descriptionRu: z.string().optional(),
  descriptionTj: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.coerce.number().min(1, 'Нарх ворид кунед'),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  sku: z.string().min(1, 'SKU ворид кунед'),
  stock: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, 'Категорияро интихоб кунед'),
  brandId: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42'];

interface ColorEntry { nameRu: string; nameTj: string; nameEn: string; hexCode: string; }
interface SizeEntry { size: string; stock: number; }

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [sizes, setSizes] = useState<SizeEntry[]>([]);
  const [newColor, setNewColor] = useState<ColorEntry>({ nameRu: '', nameTj: '', nameEn: '', hexCode: '#4F46E5' });
  const [localImages, setLocalImages] = useState<{ file: File; isMain: boolean; previewUrl: string }[]>([]);

  const handleAddLocalImage = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setLocalImages((prev) => [
      ...prev,
      { file, isMain: prev.length === 0, previewUrl },
    ]);
  };

  const handleRemoveLocalImage = (index: number) => {
    setLocalImages((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const next = prev.filter((_, i) => i !== index);
      if (target?.isMain && next.length > 0) {
        next[0].isMain = true;
      }
      return next;
    });
  };

  const handleSetLocalMainImage = (index: number) => {
    setLocalImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isMain: i === index,
      }))
    );
  };

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productsApi.getOne(id!),
    enabled: isEdit,
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.getAll });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, isFeatured: false, discountPercent: 0, stock: 0 },
  });

  const price = watch('price') || 0;
  const discountPercent = watch('discountPercent') || 0;
  const finalPrice = Math.round(price - (price * discountPercent) / 100);

  useEffect(() => {
    if (product) {
      reset({
        nameRu: product.nameRu, nameTj: product.nameTj, nameEn: product.nameEn,
        descriptionRu: product.descriptionRu, descriptionTj: product.descriptionTj, descriptionEn: product.descriptionEn,
        price: product.price, discountPercent: product.discountPercent, sku: product.sku,
        stock: product.stock, isActive: product.isActive, isFeatured: product.isFeatured,
        categoryId: product.categoryId, brandId: product.brandId || '',
      });
      if (product.colors) setColors(product.colors.map((c) => ({ nameRu: c.nameRu, nameTj: c.nameTj, nameEn: c.nameEn, hexCode: c.hexCode })));
      if (product.sizes) setSizes(product.sizes.map((s) => ({ size: s.size, stock: s.stock })));
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => isEdit ? productsApi.update(id!, data) : productsApi.create(data),
    onSuccess: async (p) => {
      if (!isEdit && p && p.id && localImages.length > 0) {
        try {
          for (const img of localImages) {
            await productsApi.addImage(p.id, img.file, img.isMain);
          }
        } catch (err) {
          console.error('Failed to upload product images', err);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(t('common.success'), { id: 'product-form-toast' });
      navigate('/products');
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const errorMessage = Array.isArray(serverMessage)
        ? serverMessage.join(', ')
        : typeof serverMessage === 'string'
        ? serverMessage
        : t('common.error');
      toast.error(errorMessage, { id: 'product-form-toast' });
    },
  });

  const onSubmit = (data: Form) => {
    mutation.mutate({
      ...data,
      brandId: data.brandId || undefined,
      colors,
      sizes,
    } as any);
  };

  const toggleSize = (size: string) => {
    setSizes((prev) => prev.find((s) => s.size === size) ? prev.filter((s) => s.size !== size) : [...prev, { size, stock: 0 }]);
  };

  if (isEdit && loadingProduct) return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader
        title={isEdit ? t('product.edit') : t('product.create')}
        breadcrumbs={[{ label: 'Admin' }, { label: t('nav.products'), href: '/products' }, { label: isEdit ? t('product.edit') : t('product.create') }]}
        action={
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4" />
            {t('order.back')}
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">{t('product.basicInfo')}</TabsTrigger>
            <TabsTrigger value="images">{t('product.images')}</TabsTrigger>
            <TabsTrigger value="variants">{t('product.colors')} & {t('product.sizes')}</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic info */}
          <TabsContent value="basic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Names */}
                <Card>
                  <CardContent className="p-6 grid grid-cols-1 gap-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">{t('product.name')}</h3>
                    {[['nameRu', t('product.nameRu')], ['nameTj', t('product.nameTj')], ['nameEn', t('product.nameEn')]] .map(([field, label]) => (
                      <div key={field} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Input {...register(field as keyof Form)} />
                        {errors[field as keyof Form] && <p className="text-xs text-red-500">{String(errors[field as keyof Form]?.message)}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Descriptions */}
                <Card>
                  <CardContent className="p-6 grid grid-cols-1 gap-4">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">Тавсиф</h3>
                    {[['descriptionRu', t('product.descRu')], ['descriptionTj', t('product.descTj')], ['descriptionEn', t('product.descEn')]].map(([field, label]) => (
                      <div key={field} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Textarea rows={3} {...register(field as keyof Form)} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Price */}
                <Card>
                  <CardContent className="p-6 grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>{t('product.price')} (сом)</Label>
                      <Input type="number" {...register('price')} />
                      {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('product.discount')} (%)</Label>
                      <Input type="number" min={0} max={100} {...register('discountPercent')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('product.finalPrice')}</Label>
                      <Input value={`${finalPrice.toLocaleString()} сом`} readOnly className="bg-slate-50 dark:bg-slate-900 text-slate-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label>{t('product.sku')}</Label>
                      <div className="flex gap-2">
                        <Input {...register('sku')} />
                        <Button type="button" variant="outline" size="icon" onClick={() => setValue('sku', generateSKU())}>
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('product.stock')}</Label>
                      <Input type="number" min={0} {...register('stock')} />
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('product.category')}</Label>
                      <Select value={watch('categoryId')} onValueChange={(v) => setValue('categoryId', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Интихоб кунед" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.nameRu}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label>{t('product.brand')}</Label>
                      <Select value={watch('brandId') || ''} onValueChange={(v) => setValue('brandId', v === 'none' ? '' : v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ихтиёрӣ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {brands?.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <Label>{t('product.active')}</Label>
                      <Switch checked={watch('isActive')} onCheckedChange={(v) => setValue('isActive', v)} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label>{t('product.featured')}</Label>
                      <Switch checked={watch('isFeatured')} onCheckedChange={(v) => setValue('isFeatured', v)} />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? t('common.loading') : isEdit ? t('common.update') : t('common.save')}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Images */}
          <TabsContent value="images">
            <Card>
              <CardContent className="p-6">
                {isEdit && product ? (
                  <ProductImagesManager productId={product.id} images={product.images || []} />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {localImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.previewUrl}
                            alt="product preview"
                            className={`h-32 w-full rounded-xl object-cover border-2 transition-all ${
                              img.isMain ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          {img.isMain ? (
                            <div className="absolute top-1 left-1 rounded-full bg-indigo-600 p-1">
                              <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetLocalMainImage(index)}
                              className="absolute top-1 left-1 rounded-full bg-slate-800/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                            >
                              <Star className="h-3 w-3 text-yellow-400" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveLocalImage(index)}
                            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <MultiImageUpload
                      onUploadFile={async (file) => {
                        handleAddLocalImage(file);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Variants */}
          <TabsContent value="variants">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colors */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-medium">{t('product.colors')}</h3>
                  <div className="space-y-2">
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2">
                        <div className="h-5 w-5 rounded-full border border-slate-200" style={{ background: c.hexCode }} />
                        <span className="flex-1">{c.nameRu}</span>
                        <span className="text-xs text-slate-400">{c.hexCode}</span>
                        <button type="button" onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}>
                          <X className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label className="text-xs">Ном (РУ)</Label><Input className="h-8 text-xs" value={newColor.nameRu} onChange={(e) => setNewColor({ ...newColor, nameRu: e.target.value })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Ном (ТД)</Label><Input className="h-8 text-xs" value={newColor.nameTj} onChange={(e) => setNewColor({ ...newColor, nameTj: e.target.value })} /></div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1"><Label className="text-xs">{t('product.colorHex')}</Label><Input className="h-8 text-xs" value={newColor.hexCode} onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })} /></div>
                      <input type="color" value={newColor.hexCode} onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-slate-200" />
                      <Button type="button" size="sm" className="gap-1 h-8" onClick={() => { if (newColor.nameRu) { setColors([...colors, newColor]); setNewColor({ nameRu: '', nameTj: '', nameEn: '', hexCode: '#4F46E5' }); } }}>
                        <Plus className="h-3.5 w-3.5" />{t('product.addColor')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sizes */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-medium">{t('product.sizes')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((size) => {
                      const entry = sizes.find((s) => s.size === size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`rounded-lg border py-2 text-sm font-medium transition-all ${entry ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {sizes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">{t('product.sizeStock')}</p>
                      {sizes.map((s, i) => (
                        <div key={s.size} className="flex items-center gap-2">
                          <span className="w-8 text-sm font-medium text-indigo-600">{s.size}</span>
                          <Input
                            type="number" min={0}
                            value={s.stock}
                            onChange={(e) => setSizes(sizes.map((item, j) => j === i ? { ...item, stock: +e.target.value } : item))}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
