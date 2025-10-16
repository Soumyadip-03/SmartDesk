interface SkeletonLoaderProps {
  type: 'room' | 'building' | 'list';
  count?: number;
}

export const SkeletonLoader = ({ type, count = 1 }: SkeletonLoaderProps) => {
  const RoomSkeleton = () => (
    <div className="bg-white/10 rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-white/20 rounded mb-2"></div>
      <div className="h-3 bg-white/15 rounded mb-1"></div>
      <div className="h-3 bg-white/15 rounded w-2/3"></div>
    </div>
  );

  const BuildingSkeleton = () => (
    <div className="bg-white/10 rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-white/20 rounded mb-4"></div>
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/15 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="bg-white/10 rounded-xl p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded w-32"></div>
          <div className="h-3 bg-white/15 rounded w-24"></div>
        </div>
        <div className="h-8 bg-white/15 rounded w-20"></div>
      </div>
    </div>
  );

  const skeletons = {
    room: RoomSkeleton,
    building: BuildingSkeleton,
    list: ListSkeleton
  };

  const SkeletonComponent = skeletons[type];

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};