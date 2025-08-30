import React from "react";

const PostCardSkeleton = () => {
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md animate-pulse">
            {/* Header: Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-300 rounded"></div>
                    <div className="w-16 h-3 mt-2 bg-gray-300 rounded"></div>
                </div>
            </div>
            {/* Content */}
            <div className="mb-3">
                <div className="w-full h-4 mb-2 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
            </div>
            {/* Image Placeholder */}
            <div className="w-full h-64 mb-3 bg-gray-300 rounded-md"></div>
            {/* Action Buttons */}
            <div className="flex justify-between">
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
            </div>
        </div>
    );
};

export default PostCardSkeleton;