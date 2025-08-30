import React from "react";

const FeedbackSummary = ({ summary }) => {
    // Nếu không có dữ liệu summary, sử dụng giá trị mặc định
    const defaultSummary = {
        averageRating: 0,
        ratingCounts: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    };
    const { averageRating, ratingCounts } = summary || defaultSummary;

    // Chuyển ratingCounts thành mảng để hiển thị
    const totalRatings = Object.values(ratingCounts).reduce((acc, count) => acc + count, 0);
    const ratings = [5, 4, 3, 2, 1].map((star) => ({
        star,
        percent: totalRatings > 0 ? ((ratingCounts[star] / totalRatings) * 100).toFixed(0) : 0
    }));

    return (
        <div className="p-6 mt-6 bg-white rounded shadow-md border border-solid border-gray-300">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">FEEDBACK SUMMARY</h3>
                <p className="text-center text-gray-700">
                    Average: <span className="font-semibold text-blue-600">{averageRating.toFixed(1)}/5</span>
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-full space-y-2">
                    {ratings.map((rating, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <div className="w-full h-3 bg-gray-200 rounded">
                                <div
                                    className="h-3 bg-red-500 rounded-sm"
                                    style={{ width: `${rating.percent}%` }}
                                ></div>
                            </div>
                            <span className="font-mono text-yellow-500">
                                {[...Array(5)].map((_, index) =>
                                    index < rating.star ? (
                                        <span key={index} className="text-xl">★</span>
                                    ) : (
                                        <span key={index} className="text-xl text-gray-300">★</span>
                                    )
                                )}
                            </span>
                            <span className="w-10 text-sm text-left text-gray-500">{rating.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedbackSummary;