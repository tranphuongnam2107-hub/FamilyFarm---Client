import React, { useState } from "react";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";
import Swal from "sweetalert2";

const BookingModal = ({ isOpen, onClose, serviceId }) => {
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [descriptionError, setDescriptionError] = useState('');

    // submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setDescriptionError("Description is required.");
            return;
        }

        setDescriptionError(""); // Reset error nếu hợp lệ
        setIsSubmitting(true);
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        try {
            const res = await instance.post(
                `/api/booking-service/request/${serviceId}`,
                JSON.stringify(description), // Gửi chuỗi thô vì backend dùng [FromBody] string
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json" // gửi string thuần JSON
                    }
                }
            );

            await Swal.fire({
                title: 'Booking Sent!',
                text: 'Your booking request has been submitted successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
                buttonsStyling: false, // ⚠️ Phải có khi dùng customClass
                customClass: {
                    confirmButton: 'bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded'
                },
                allowOutsideClick: false,
                allowEscapeKey: false
            });


            handleClose();
        } catch (err) {
            console.error("❌ Booking request failed:", err);
            toast.error("Booking request failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Đóng popup
    const handleClose = () => {
        setDescription('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Booking service</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-start text-sm font-medium text-gray-700 mb-2">
                            Describe your booking request
                        </label>
                        <textarea
                            placeholder="Please describe the reason for reporting this post..."
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (descriptionError) setDescriptionError("");
                            }}
                            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                            disabled={isSubmitting}
                            maxLength={500}
                        />
                        <div className="note-input w-full mt-1">
                            <div className="flex justify-between text-sm">
                                {/* Cột trái: chỉ hiển thị nếu có lỗi */}
                                {descriptionError ? (
                                <p className="text-red-500">{descriptionError}</p>
                                ) : (
                                <span></span> // giữ vị trí cho lỗi để căn phải luôn đúng
                                )}

                                {/* Cột phải: luôn hiển thị */}
                                <p className="text-gray-500 text-xs">
                                {description.length}/500 characters
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting && <i className="fas fa-spinner fa-spin mr-2"></i>}
                            {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default BookingModal;