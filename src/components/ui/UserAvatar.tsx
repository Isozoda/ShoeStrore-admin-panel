import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  user?: {
    name: string;
    avatar?: string;
    image?: string;
    photo?: string;
    profileImage?: string;
    avatarUrl?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function UserAvatar({ user, className, size = 'md' }: Props) {
  const [hasError, setHasError] = useState(false);

  // Extract avatar path
  const avatarPath = user?.avatar || user?.image || user?.photo || user?.profileImage || user?.avatarUrl;

  // Reset error state if the user object or avatar path changes
  useEffect(() => {
    setHasError(false);
  }, [avatarPath]);

  if (!user) return null;

  const name = user.name || 'User';
  
  // Custom initials generator: "Iso Musoev" -> "I", "Ситора Саидова" -> "С"
  const getInitials = (fullName: string) => {
    return fullName.trim().charAt(0).toUpperCase() || 'U';
  };
  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs font-bold',
    md: 'h-10 w-10 text-sm font-black',
    lg: 'h-12 w-12 text-base font-black',
    xl: 'h-16 w-16 text-xl font-black',
  };

  const showImage = avatarPath && !hasError;

  return (
    <div 
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full overflow-hidden border shadow-sm transition-all',
        showImage 
          ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900' 
          : 'border-indigo-100/50 dark:border-indigo-900/30 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={getImageUrl(avatarPath!)}
          alt={name}
          className="h-full w-full object-cover animate-in fade-in duration-300"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="tracking-wider uppercase select-none">
          {initials}
        </span>
      )}
    </div>
  );
}
