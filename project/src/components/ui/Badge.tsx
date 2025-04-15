import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        {
          'bg-pink-100 text-pink-700': variant === 'default',
          'border border-pink-200 bg-transparent': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}