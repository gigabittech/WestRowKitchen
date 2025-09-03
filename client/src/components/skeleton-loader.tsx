interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className = "", children }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function MenuItemCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
      <div className="flex items-start space-x-6">
        <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-10 w-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FoodDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-2/3 mb-6" />
              <div className="flex items-center space-x-4 mb-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <Skeleton className="h-32 rounded-lg" />
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}