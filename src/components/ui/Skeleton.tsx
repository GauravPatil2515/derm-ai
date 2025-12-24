import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
}

export function TableRowSkeleton() {
    return (
        <tr className="border-b border-pink-100">
            <td className="px-6 py-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
            </td>
            <td className="px-6 py-4">
                <Skeleton className="h-4 w-32" />
            </td>
            <td className="px-6 py-4">
                <Skeleton className="h-4 w-24" />
            </td>
            <td className="px-6 py-4">
                <Skeleton className="h-4 w-28" />
            </td>
            <td className="px-6 py-4">
                <Skeleton className="h-4 w-16" />
            </td>
            <td className="px-6 py-4">
                <Skeleton className="h-6 w-20 rounded-full" />
            </td>
            <td className="px-6 py-4">
                <Skeleton className="h-4 w-8" />
            </td>
        </tr>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg bg-white p-6 shadow-sm border border-pink-100">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-pink-100">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="overflow-hidden rounded-lg border border-pink-100">
                    <table className="min-w-full">
                        <thead className="bg-pink-50">
                            <tr>
                                {['Image', 'Report ID', 'Date', 'Condition', 'Confidence', 'Status', 'Actions'].map((h) => (
                                    <th key={h} className="px-6 py-3">
                                        <Skeleton className="h-3 w-16" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRowSkeleton key={i} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function ChatMessageSkeleton() {
    return (
        <div className="flex items-start gap-3 animate-pulse">
            <div className="rounded-full bg-gray-200 p-2 h-10 w-10" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function ScanResultSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Skeleton */}
                <Skeleton className="h-64 w-full rounded-lg" />

                {/* Analysis Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="mt-6 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
