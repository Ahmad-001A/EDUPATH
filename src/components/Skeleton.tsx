export default function Skeleton({
  className = "",
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/60 dark:bg-gray-700/40 ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-3xl border border-white/40 overflow-hidden">
      <Skeleton className="h-48 w-full" rounded="rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass p-5 rounded-2xl border border-white/40 flex items-center gap-4">
      <Skeleton className="w-12 h-12" rounded="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/30">
      <Skeleton className="w-10 h-10" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" rounded="rounded-full" />
    </div>
  );
}

export function SkeletonTestCard() {
  return (
    <div className="glass rounded-2xl border border-white/40 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-12 h-12" rounded="rounded-2xl" />
        <Skeleton className="h-6 w-20" rounded="rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}