// components/BookingDetailModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const BookingDetailPage = ({ bookingId, bookingProp, onClose }) => {
  const [booking, setBooking] = useState(bookingProp || null);
  const [loading, setLoading] = useState(!bookingProp);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(
          `https://localhost:7280/api/booking-service/get-by-id/${bookingId}`
        );
        setBooking(res.data);
      } catch (err) {
        console.error(err);
        setError("Không tìm thấy thông tin booking.");
      } finally {
        setLoading(false);
      }
    };

    if (!bookingProp) fetchBooking();
  }, [bookingId, bookingProp]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
              {booking?.serviceName || "N/A"}
            </h2>

            <div className="space-y-4 text-base text-gray-700">
              <div>
                <span className="font-semibold">💰 Price:</span>{" "}
                {Number(booking?.price || 0).toLocaleString()} VNĐ
              </div>
              <div>
                <span className="font-semibold">📋 Description:</span>{" "}
                {booking?.description || "No description"}
              </div>
              <div>
                <span className="font-semibold">📌 Status:</span>{" "}
                {booking?.bookingServiceStatus || "Unknown"}
              </div>
              <div>
                <span className="font-semibold">📅 Date Booking:</span>{" "}
                {booking?.bookingServiceAt
                  ? new Date(booking.bookingServiceAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">💳 Date Payment:</span>{" "}
                {booking?.paymentDueDate
                  ? new Date(booking.paymentDueDate).toLocaleString()
                  : "N/A"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingDetailPage;
