const StatusSkeleton = () => (
  <div className="p-6 max-w-xl mx-auto animate-pulse">
    {/* Title Skeleton */}
    <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-6"></div>
    
    {/* Info Skeletons */}
    <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-6"></div>

    {/* Card Skeleton */}
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="h-5 bg-gray-200 rounded w-20 mb-4"></div>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center mb-3">
          <div className="w-16 h-16 bg-gray-100 rounded-lg mr-3"></div>
          <div className="h-4 bg-gray-100 rounded w-32"></div>
        </div>
      ))}
      <div className="h-6 bg-gray-200 rounded w-24 mt-6"></div>
    </div>
    
    {/* Text Skeletons */}
    <div className="mt-8 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
    </div>
  </div>
);

export default StatusSkeleton;

