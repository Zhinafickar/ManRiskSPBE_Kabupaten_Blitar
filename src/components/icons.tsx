import Image from 'next/image';
import { cn } from '@/lib/utils';

export const Icons = {
  Logo: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('relative', className)} {...props}>
      <Image
        src="/logo.png"
        alt="Manajemen Resiko Logo"
        fill
        sizes="100px"
        className="object-contain"
      />
    </div>
  ),
};
