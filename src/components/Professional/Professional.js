import { Link } from "react-router-dom";
import reject_icon from "../../assets/icons/Reject_icon.svg";
import accept_icon from "../../assets/icons/Accept_icon.svg";
import { getOwnProfile } from "../../services/accountService";
import { useEffect, useState } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { useNotification } from "../../context/NotificationContext";
import BookingListPage from "../../components/Statistic/BookingListPage";
import ExpertRevenue from "../../components/Statistic/ExpertRevenue";
import BookingDetailPage from "../../components/Statistic/BookingDetailPage";
import BookingStatisticPage from "../../components/Statistic/BookingStatisticPage";
const Professional = () => {
  const { hubConnection } = useNotification();
  // const [bookingRequests, setBookingRequests] = useState([]);
  // const { connection: signalRConnection } = useSignalR(); // giả sử hook này đã trả về connection
  const [profileData, setProfileData] = useState(null);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // Trạng thái loading cho từng booking
  const [showStatistic, setShowStatistic] = useState(false); //show cái thống kê lên

  // Hàm lấy danh sách booking requests của expert
  const getExpertBookingRequests = async () => {
    try {
      const response = await instance.get(
        "/api/booking-service/expert-list-request-booking"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!hubConnection) return;

    const handleNewBookingRequest = (newBooking) => {
      // ✅ Thêm vào đầu danh sách (tuỳ UI)
      setBookingRequests((prev) => [
        {
          booking: {
            bookingServiceId: newBooking.bookingServiceId,
            bookingServiceAt: newBooking.bookingServiceAt,
            bookingServiceStatus: newBooking.status,
          },
          account: {
            fullName: newBooking.farmerName,
            avatar: newBooking.farmerAvatar || "", // ✅ tránh null
          },
          service: {
            serviceName: newBooking.serviceName,
          },
        },
        ...prev,
      ]);

      console.log("SignalR new booking:", newBooking);
    };

    hubConnection.on("ReceiveNewBookingRequest", handleNewBookingRequest);
    return () => {
      hubConnection.off("ReceiveNewBookingRequest", handleNewBookingRequest);
    };
  }, [hubConnection]);

  // Hàm chấp nhận booking
  const acceptBooking = async (bookingId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
      // const response = await instance.put(`/api/booking-service/accept-booking/${bookingId}`);
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const response = await instance.put(
        `/api/booking-service/accept-booking/${bookingId}`,
        null, // Vì PUT này không có body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Booking accepted successfully!");
        // Cập nhật danh sách để loại bỏ booking đã chấp nhận
        setBookingRequests((prev) =>
          prev.filter((req) => req.booking.bookingServiceId !== bookingId)
        );
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error(error.response?.data?.message || "Failed to accept booking");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Hàm hủy booking
  const cancelBooking = async (bookingId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
      const response = await instance.put(
        `/api/booking-service/reject-booking/${bookingId}`
      );
      if (response.data) {
        toast.success("Booking rejected successfully!");
        // Cập nhật danh sách để loại bỏ booking đã hủy
        setBookingRequests((prev) =>
          prev.filter((req) => req.booking.bookingServiceId !== bookingId)
        );
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // Lấy profile và booking requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Lấy profile
        const profileResponse = await getOwnProfile();
        setProfileData(profileResponse.data);

        // Lấy danh sách booking requests
        const bookingResponse = await getExpertBookingRequests();
        setBookingRequests(bookingResponse.data || []);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-28 mt-14">
      <div className="w-full md:w-1/4 flex flex-col items-center text-center gap-1">
        <img
          src={
            profileData?.avatar ||
            "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2F638841241684706439_default-avatar.jpg?alt=media&token=8190d336-e471-4a34-bf8e-7853e969b04f"
          }
          alt="Expert Avatar"
          className="w-full max-w-[223px] h-full max-h-[223px] object-cover rounded-full border"
        />
        <h2 className="mt-4 text-2xl font-semibold">
          {profileData?.fullName || "Unknown"}
        </h2>
        <p className="text-red-500 font-semibold mt-1">Expert</p>

        <Link
          to="/PersonalPage"
          className="mt-5 bg-[#393A4F]/25 px-12 py-3 rounded-xl hover:bg-gray-300 border border-solid"
        >
          Go to your Profile
        </Link>

        {!showStatistic ? (
          <button
            onClick={() => setShowStatistic(true)}
            className="mt-5 text-blue-500 hover:underline"
          >
            Statistic
          </button>
        ) : (
          <button
            onClick={() => setShowStatistic(false)}
            className="mt-5 text-gray-500 hover:underline"
          >
            Back to Booking Requests
          </button>
        )}
      </div>

      <div className="w-full md:w-3/4">
        {showStatistic ? (
          <div className="pt-6">
            <ExpertRevenue />
            <BookingListPage />
            <BookingDetailPage />
            <BookingStatisticPage />
          </div>
        ) : bookingRequests.length > 0 ? (
          bookingRequests.map((req, index) => {
            const fullName = req?.account?.fullName || "-";
            const avatar =
              req?.account?.avatar || "https://i.imgur.com/hYVzLgm.png";
            const serviceName = req?.service?.serviceName || "Unknown Service";
            const bookingAt = req?.booking?.bookingServiceAt
              ? new Date(req.booking.bookingServiceAt).toLocaleString()
              : "Invalid Date";

            return (
              <div key={req.booking.bookingServiceId}>
                <div className="flex items-center justify-between py-4 border-b text-left">
                  <div className="flex items-center space-x-3">
                    <img
                      src={avatar}
                      alt={fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="space-y-2">
                      <p className="font-semibold">
                        {fullName} - in{" "}
                        <span className="text-blue-500 underline cursor-pointer">
                          {serviceName}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Request at {bookingAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <button
                      className="text-red-500 hover:underline flex items-center gap-2 disabled:opacity-50"
                      onClick={() =>
                        cancelBooking(req.booking.bookingServiceId)
                      }
                      disabled={actionLoading[req.booking.bookingServiceId]}
                    >
                      <img src={reject_icon} alt="" /> <span>Reject</span>
                    </button>
                    <button
                      className="text-blue-500 hover:underline flex items-center gap-2 disabled:opacity-50"
                      onClick={() =>
                        acceptBooking(req.booking.bookingServiceId)
                      }
                      disabled={actionLoading[req.booking.bookingServiceId]}
                    >
                      <img src={accept_icon} alt="" /> <span>Accept</span>
                    </button>
                  </div>
                </div>
                {index < bookingRequests.length - 1 && (
                  <hr className="border-t border-gray-300" />
                )}
              </div>
            );
          })
        ) : (
          <div>No booking requests found.</div>
        )}
      </div>
    </div>
  );
};

export default Professional;
