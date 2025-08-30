import React from "react";

const FeedbackList = ({ reviews }) => {
    return (
        <div className="p-6 mt-5 bg-white rounded shadow-md border border-solid border-gray-300">
            <h3 className="mb-4 text-lg font-semibold">FEEDBACK: {reviews.length}</h3>
            {reviews.length > 0 ? (
                reviews.map((fb, index) => (
                    <div className="flex gap-3 mt-5" key={fb.review.reviewId || index}>
                        <div className="flex items-start">
                            <img
                                src={fb.reviewer.avatar || "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"}
                                className="h-auto rounded-full w-14"
                                alt="User"
                            />
                        </div>
                        <div className="flex flex-col w-full p-4 bg-gray-100 border rounded-lg">
                            <div className="flex items-start justify-between pb-2">
                                <div>
                                    <p className="font-semibold">{fb.reviewer.fullName}</p>
                                    <p className="text-sm text-blue-500">{fb.reviewer.city}</p>
                                    <p className="text-sm text-blue-500">
                                        Rate at{" "}
                                        <span className="text-gray-500">
                                            {new Date(fb.review.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "2-digit",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    {[...Array(fb.review.rating)].map((_, i) => (
                                        <span key={i} className="text-xl text-yellow-500">★</span>
                                    ))}
                                    {[...Array(5 - fb.review.rating)].map((_, i) => (
                                        <span key={i} className="text-xl text-gray-300">★</span>
                                    ))}
                                </div>
                            </div>
                            <p className="py-3 mt-1 text-gray-900">{fb.review.comment || "Không có bình luận"}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">Chưa có đánh giá nào.</p>
            )}
        </div>
    );
};

export default FeedbackList;