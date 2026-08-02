interface SkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className = 'h-6 w-full', count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse rounded-lg bg-slate-200 ${className}`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-6 w-32" />
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
      </div>
      <LoadingSkeleton className="h-4 w-48" />
      <div className="pt-2">
        <LoadingSkeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
