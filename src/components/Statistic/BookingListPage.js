import React, { useEffect, useState } from "react";
import axios from "axios";
import * as signalR from "@microsoft/signalr";
import BookingDetailPage from "./BookingDetailPage";

const statuses = ["Pending", "Accepted", "Paid", "On Process", "Completed"];

const BookingListPage = () => {
  const [selectedStatus, setSelectedStatus] = useState("Paid");
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBookingData, setSelectedBookingData] = useState(null);

  useEffect(() => {
    fetchBookings(selectedStatus);
  }, [selectedStatus]);

  const fetchBookings = async (status) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `https://localhost:7280/api/statistic/by-status?status=${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  // Kết nối SignalR khi mount
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7280/topengagedposthub", {
        accessTokenFactory: () => localStorage.getItem("accessToken"),
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected");
        const expertId = localStorage.getItem("accId");
        connection.invoke("JoinGroup", expertId);
      })
      .catch((err) => console.error("SignalR error:", err));

    connection.on("BookingCreated", (booking) => {
      console.log("Booking created:", booking);
      setBookings((prev) => [booking, ...prev]);
    });

    connection.on("BookingCancelled", (booking) => {
      console.log("Booking cancelled:", booking);
      setBookings((prev) =>
        prev.filter((b) => b.bookingServiceId !== booking.bookingServiceId)
      );
    });

    connection.on("BookingAccepted", (booking) => {
      console.log("Booking accepted:", booking);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingServiceId === booking.bookingServiceId ? booking : b
        )
      );
    });

    connection.on("BookingRejected", (booking) => {
      console.log("Booking rejected:", booking);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingServiceId === booking.bookingServiceId ? booking : b
        )
      );
    });
    connection.on("BookingPaid", (booking) => {
      console.log("Booking rejected:", booking);
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingServiceId === booking.bookingServiceId ? booking : b
        )
      );
    });
    return () => connection.stop();
  }, [selectedStatus]);

  const openBookingDetail = (booking) => {
    setSelectedBookingId(booking.bookingServiceId);
    setSelectedBookingData(booking);
  };

  const closeModal = () => {
    setSelectedBookingId(null);
    setSelectedBookingData(null);
  };

  return (
    <div className="mt-6 bg-gray-100 p-6 relative text-gray-800 border border-gray-300 rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Filter booking by status
      </h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {statuses.map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg border font-medium transition-all ${
              selectedStatus === status
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="border rounded-xl shadow-inner bg-white p-4">
        <div className="max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(bookings || []).length === 0 ? (
              <p className="text-center text-gray-500 col-span-full">
                No booking
              </p>
            ) : (
                  (bookings || []).map((booking) => (
                <div
                  key={booking.bookingServiceId}
                  onClick={() => openBookingDetail(booking)}
                  className="p-4 bg-white rounded-xl shadow hover:shadow-md hover:bg-gray-50 cursor-pointer transition-all"
                >
                  <h3 className="font-bold text-lg text-blue-800">
                              {booking?.serviceName || "N/A"}
                  </h3>
                  <p className="text-gray-700">        Price: {booking?.price?.toLocaleString?.() || 0} VNĐ</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span className="font-semibold text-indigo-600">
                           {booking?.bookingServiceStatus || "Unknown"}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedBookingId && (
        <BookingDetailPage
          bookingId={selectedBookingId}
          bookingProp={selectedBookingData}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default BookingListPage;
