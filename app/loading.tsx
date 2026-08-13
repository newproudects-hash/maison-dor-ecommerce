export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="w-48 h-8 bg-neutral-200 rounded-md mx-auto mb-8" />
        
        {/* Carousel Skeleton */}
        <div className="w-full h-64 md:h-96 bg-neutral-100 rounded-2xl" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <div className="w-full aspect-[4/5] bg-neutral-100 rounded-xl" />
              <div className="w-3/4 h-4 bg-neutral-200 rounded" />
              <div className="w-1/4 h-4 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
