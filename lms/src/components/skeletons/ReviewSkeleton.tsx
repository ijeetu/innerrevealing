"use client"
// Skeleton component for loading state
 const ReviewsSkeleton = ({ instructorPage }: { instructorPage?: boolean }) => (
    <div className={`${instructorPage ? "p-3 sm:p-6 bg-white rounded-2xl" : ""}`}>
        {
            !instructorPage &&
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">Reviews</h2>
        }
        
        {/* Rating summary skeleton */}
        <div className="p-4 border borderColor rounded-2xl overflow-hidden bg-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-4 w-full">
                {/* Overall score skeleton */}
                <div className="text-center md:text-left bg-gray-100 p-4 rounded-[4px] flexColCenter gap-1 animate-pulse">
                    <div className="h-10 w-16 bg-gray-300 rounded"></div>
                    <div className="flex justify-center md:justify-start mb-1">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 w-4 bg-gray-300 rounded"></div>
                            ))}
                        </div>
                    </div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </div>

                {/* Rating distribution skeleton */}
                <div className="flex-grow md:w-[80%]">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <div className="flex items-center w-20">
                                <div className="flex gap-1 mr-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-3 w-3 bg-gray-300 rounded animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                <div className="h-2 bg-gray-300 rounded-full animate-pulse" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                            <div className="w-10 text-right">
                                <div className="h-3 w-6 bg-gray-300 rounded animate-pulse ml-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Reviews list skeleton */}
        <div className="">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="p-6 border-b borderColor animate-pulse last:border-b-0">
                    <div className="flex items-start">
                        <div className="mr-4 max-575:hidden">
                            <div className="h-[48px] w-[48px] rounded-[4px] bg-gray-300"></div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center mb-1">
                                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-gray-300 rounded mr-1"></div>
                                    <div className="h-3 w-4 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                            <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-300 rounded"></div>
                                <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ReviewsSkeleton;