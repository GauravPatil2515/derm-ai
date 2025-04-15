import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-pink-600 text-white hover:bg-pink-700': variant === 'primary',
          'bg-pink-50 text-pink-900 hover:bg-pink-100': variant === 'secondary',
          'border border-pink-200 bg-white hover:bg-pink-50 text-pink-700': variant === 'outline',
          'h-9 px-4 py-2 text-sm': size === 'sm',
          'h-10 px-6 py-2': size === 'md',
          'h-11 px-8 py-2 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}