import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star } from 'lucide-react';
import { productsApi } from '@/api/products.api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MultiImageUpload } from '../ui/ImageUpload';
import { Button } from '../ui/button';
import { cn, getImageUrl } from '@/lib/utils';
import type { ProductImage } from '@/types';

interface Props {
  productId: string;
  images: ProductImage[];
}

export function ProductImagesManager({ productId, images }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleUploadFile = async (file: File) => {
    const isFirst = images.length === 0;
    try {
      await productsApi.addImage(productId, file, isFirst);
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (imageId: string) => {
    setDeleting(imageId);
    try {
      await productsApi.deleteImage(productId, imageId);
      queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={getImageUrl(img.url)}
              alt="product"
              className={cn(
                'h-32 w-full rounded-xl object-cover border-2 transition-all',
                img.isMain ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'
              )}
            />
            {img.isMain && (
              <div className="absolute top-1 left-1 rounded-full bg-indigo-600 p-1">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            )}
            <button
              onClick={() => handleDelete(img.id)}
              disabled={deleting === img.id}
              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <MultiImageUpload onUploadFile={handleUploadFile} />
    </div>
  );
}
