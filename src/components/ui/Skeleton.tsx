import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`bg-pink-50 rounded animate-pulse ${className}`} />
);

export const TableRowSkeleton: React.FC = () => (
    <tr>
        <td className="py-3"><div className="skeleton w-10 h-10 rounded" /></td>
        <td className="py-3"><div className="skeleton h-4 w-24" /></td>
        <td className="py-3"><div className="skeleton h-4 w-20" /></td>
        <td className="py-3"><div className="skeleton h-4 w-16" /></td>
        <td className="py-3"><div className="skeleton h-5 w-16 rounded-full" /></td>
        <td className="py-3"><div className="skeleton h-6 w-6 ml-auto" /></td>
    </tr>
);

export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
    </div>
);

export const ChatMessageSkeleton: React.FC = () => (
    <div className="flex gap-3">
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="skeleton h-12 w-48 rounded-lg" />
    </div>
);

export const ScanResultSkeleton: React.FC = () => (
    <div className="card p-6 space-y-4">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-48 rounded-lg" />
        <div className="space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
        </div>
    </div>
);
