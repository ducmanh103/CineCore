import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`skeleton-shimmer rounded-xl border border-white/[0.04] ${className}`}
    aria-hidden="true"
  />
);

export const MovieCardSkeleton: React.FC = () => (
  <div className="rounded-3xl cinema-card p-2.5 space-y-3">
    <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
    <div className="px-2 pb-2 space-y-2">
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-14 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ShowtimeCardSkeleton: React.FC = () => (
  <div className="rounded-3xl cinema-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1">
      <Skeleton className="w-20 h-28 rounded-2xl shrink-0" />
      <div className="space-y-2.5 flex-1 max-w-sm">
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="h-3.5 w-1/2 rounded-md" />
        <Skeleton className="h-3.5 w-1/3 rounded-md" />
      </div>
    </div>
    <div className="flex items-center gap-2.5">
      <Skeleton className="h-11 w-24 rounded-xl" />
      <Skeleton className="h-11 w-28 rounded-xl" />
    </div>
  </div>
);
