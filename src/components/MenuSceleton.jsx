const MenuSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
      <div className="w-full h-48 bg-gray-200 rounded-2xl"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
      </div>
      <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
      <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
    </div>
  );
};

export default MenuSkeleton;