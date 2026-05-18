import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { uploadsApi } from '@/api/uploads.api';
import toast from 'react-hot-toast';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: Props) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadsApi.upload(file);
        onChange(url);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setUploading(false);
      }
    },
    [onChange, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative inline-block">
          <img src={value.startsWith('http') ? value : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${value}`} alt="Uploaded" className="h-32 w-32 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors',
            isDragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-slate-200 bg-slate-50 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800/50',
            uploading && 'opacity-60 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-indigo-600" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs text-slate-400">{t('common.dragDrop')}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface MultiProps {
  onUpload?: (url: string) => void;
  onUploadFile?: (file: File) => Promise<void>;
  className?: string;
}

export function MultiImageUpload({ onUpload, onUploadFile, className }: MultiProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        for (const file of files) {
          if (onUploadFile) {
            await onUploadFile(file);
          } else if (onUpload) {
            const url = await uploadsApi.upload(file);
            onUpload(url);
          }
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || t('common.error');
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onUploadFile, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors',
        isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800/50',
        className
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-indigo-600" />
      ) : (
        <>
          <Upload className="h-5 w-5 text-slate-400 mb-1" />
          <p className="text-xs text-slate-400">{t('common.dragDrop')}</p>
        </>
      )}
    </div>
  );
}
