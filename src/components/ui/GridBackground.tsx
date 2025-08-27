import React from 'react';
import { cn } from '../../lib/utils';

interface GridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ children, className }) => {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px] -z-10" />
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] -z-10" />
      {children}
    </div>
  );
};