import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { imgUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MenuItemImageProps {
  src: string | undefined | null;
  alt: string;
  className?: string;
  iconSize?: number;
}

export function MenuItemImage({ src, alt, className, iconSize = 32 }: MenuItemImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = src ? imgUrl(src) : '';

  if (!resolved || failed) {
    return (
      <div className={cn('bg-muted flex items-center justify-center', className)}>
        <ImageIcon style={{ width: iconSize, height: iconSize }} className="text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className={cn('bg-muted overflow-hidden', className)}>
      <img
        src={resolved}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
