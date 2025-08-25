import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${className} bg-gray-200 rounded animate-pulse mb-2`} />
            ))}
        </>
    );
};

export const BoardColumnSkeleton: React.FC = () => (
    <div className="flex-shrink-0 w-80 bg-white rounded-lg shadow p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    </div>
);

export const TaskDetailSkeleton: React.FC = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-24 w-full" />
        </div>
        <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="space-y-2">
                <Skeleton count={3} />
            </div>
        </div>
    </div>
);

export const CardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg shadow p-4">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
    </div>
);

export default Skeleton;
