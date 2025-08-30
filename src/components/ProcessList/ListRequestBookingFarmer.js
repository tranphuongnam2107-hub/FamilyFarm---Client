import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MenuProgressFarmer from "../MenuProgressFarmer/MenuProgress";
import "./progressListFarmerstyle.css";
import searchIcon from "../../assets/images/material-symbols_search.svg";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { useSignalR } from "../../context/SignalRContext";
import { useNotification } from "../../context/NotificationContext";
import formatTime from "../../utils/formatTime";

const ListRequestBookingFarmer = () => {
    const { hubConnection } = useNotification();
    const { connection } = useSignalR();
    const [listBooking, setListBooking] = useState([]);
    const [accessToken, setAccessToken] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Lấy thông tin người dùng từ storage
    useEffect(() => {
        const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
        const storedAccesstoken = localStorage.getItem("accessToken");
        if (storedAccId) {
            setAccessToken(storedAccesstoken);
        }
    }, []);

    useEffect(() => {
        if (!accessToken) return;

        const fetchListBooking = async () => {
            try {
                const response = await instance.get("/api/booking-service/farmer-all-booking", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                console.log(response.data.data);

                if (response.status === 200) {
                    setListBooking(response.data.data);
                }
            } catch (error) {
                console.log("cannot get list booking " + error);
            }
        };

        fetchListBooking();
    }, [accessToken]);

    const handleCancelBooking = async (bookingId) => {
        if (!accessToken) {
            toast.error("Token is missing, cannot cancel");
            return;
        }

        try {
            const response = await instance.put(
                `/api/booking-service/cancel-booking/${bookingId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Cancel booking service successfully");
            }
        } catch (error) {
            console.log(error);
            toast.error("Cannot cancel booking service");
        }
    };

    useEffect(() => {
        if (!hubConnection) return;

        const handleBookingCancelled = (bookingId, status) => {
            setListBooking((prevList) => {
                const updatedList = prevList.map((b) =>
                    b.booking?.bookingServiceId === bookingId
                        ? {
                            ...b,
                            booking: {
                                ...b.booking,
                                bookingServiceStatus: status,
                            },
                        }
                        : b
                );
                console.log(`SignalR update for booking ${bookingId}`);
                return updatedList;
            });
        };


        hubConnection.on("ReceiveBookingStatusChanged", handleBookingCancelled);
        return () => {
            hubConnection.off("ReceiveBookingStatusChanged", handleBookingCancelled);
        };
    }, [hubConnection]);

    const handlePayment = async (bookingId, price) => {
        if (!accessToken) {
            toast.error("Token missing");
            return;
        }

        try {
            const res = await instance.post(
                "/api/payment/create-payment",
                {
                    bookingServiceId: bookingId,
                    subprocessId: null,
                    amount: price
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const paymentUrl = res.data?.paymentUrl;
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                toast.error("Không lấy được link thanh toán");
            }
        } catch (err) {
            console.error("Payment error", err);
            toast.error("Có lỗi xảy ra khi thanh toán");
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter bookings based on search query
    const filteredBookings = listBooking.filter((booking) => {
        const searchLower = searchQuery.toLowerCase();
        const expertName = booking.account.fullName?.toLowerCase() || "";
        const serviceName = booking.service.serviceName?.toLowerCase() || "";
        const bookingDate = formatTime(booking.booking.bookingServiceAt)?.toLowerCase() || "";
        return (
            expertName.includes(searchLower) ||
            serviceName.includes(searchLower) ||
            bookingDate.includes(searchLower)
        );
    });

    const handldeReview = (serviceId, bookingServiceId) => {
        navigate(`/ReviewService/${serviceId}`, {
            state: { bookingServiceId }
        })
    }

    const handleClickRequest = (bookingData, serviceData) => {
        navigate("/RequestExtra", {
            state: {
                bookingData,
                serviceData
            }
        })
    }

    return (
        <div className="ListRequestBookingFarmer">
            <div className="progress-managment pt-36">
                <div className="progress-managment-container flex flex-col lg:flex-row justify-center items-center lg:items-start gap-[23px] px-2">
                    <MenuProgressFarmer inPage="booking" />
                    <div className="list-progress-section w-full xl:w-[831px] max-w-[831px]">
                        {/* FILTER */}
                        <div className="status-nav-container w-full">
                            <div className="status-progress-nav w-full">
                                <div className="status-all w-[12.15%]">
                                    <div className="text-2">All</div>
                                </div>
                                <div className="status-uncompleted w-[21.5%]">
                                    <div className="text-2">Pending</div>
                                </div>
                                <div className="status-completed w-[17.8%]">
                                    <div className="text-2">Accept</div>
                                </div>
                                <div className="status-need-info w-[17.8%]">
                                    <div className="text-2">Reject</div>
                                </div>
                            </div>
                        </div>

                        {/* SEARCH */}
                        <div className="search-progress-container mt-[13px] h-10">
                            <div className="search-bar w-full h-full">
                                <div className="search-bar relative w-full h-full flex items-center">
                                    <img className="material-symbols-2 pl-4" src={searchIcon} alt="search icon" />
                                    <input
                                        type="text"
                                        className="search-input w-[38.5%] text-black"
                                        placeholder="Search based on service name, expert name, or booking date"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="progress-list-container mt-[26px] flex flex-col gap-10">
                            {Array.isArray(filteredBookings) && filteredBookings.length > 0 ? (
                                filteredBookings.map((booking, index) => (
                                    <div key={booking.booking.bookingServiceId || index} className="progress-card w-full">
                                        <div className="header-progress-section flex flex-col sm:flex-row justify-between">
                                            <div className="infor-progress-section">
                                                <div className="info-1">
                                                    <div className="text-progress-info-1">ID Booking:</div>
                                                    <div className="text-progress-id">{booking.booking.bookingServiceId}</div>
                                                </div>
                                                <div className="info-1">
                                                    <div className="text-progress-info-1">Expert: </div>
                                                    <div className="text-progress-p-1">{booking.account.fullName}</div>
                                                </div>
                                                <div className="date-info">
                                                    <div className="text-progress-info-1">Booking at:</div>
                                                    <div className="text-progress-p-1">{formatTime(booking.booking.bookingServiceAt)}</div>
                                                </div>
                                                <div className="info-1">
                                                    <div className="text-progress-info-1">Service name:</div>
                                                    <div className="text-progress-p-1">{booking.service.serviceName}</div>
                                                </div>
                                            </div>
                                            {booking.booking.bookingServiceStatus === "Pending" && (
                                                <div className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-uncompleted-a-need">Pending</div>
                                                </div>
                                            )}
                                            {booking.booking.bookingServiceStatus === "Accepted" && (
                                                <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-completed">Accepted</div>
                                                </div>
                                            )}

                                            {booking.booking.bookingServiceStatus === "On Process" && (
                                                <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-completed">On Process</div>
                                                </div>
                                            )}

                                            {booking.booking.bookingServiceStatus === "Completed" && !booking.booking.isCompletedFinal && (
                                                <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-completed">Completed</div>
                                                </div>
                                            )}

                                            {booking.booking.bookingServiceStatus === "Extra Request" && (
                                                <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-completed">Extra Request</div>
                                                </div>
                                            )}

                                            {booking.booking.bookingServiceStatus === "Paid" && (
                                                <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-completed">Paid</div>
                                                </div>
                                            )}
                                            {booking.booking.bookingServiceStatus === "Rejected" && (
                                                <div className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-uncompleted-a-need">Rejected</div>
                                                </div>
                                            )}
                                            {booking.booking.bookingServiceStatus === "Cancel" && (
                                                <div className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-uncompleted-a-need">Cancelled</div>
                                                </div>
                                            )}

                                            {booking.booking.bookingServiceStatus === "Completed" && booking.booking.isCompletedFinal && (
                                                <div style={{ background: "rgba(61, 179, 251, 0.25)" }} className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                    <div style={{ color: "#3DB3FB" }} className="text-uncompleted-a-need">Finish</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="footer-booking-card">
                                            {booking.booking.bookingServiceStatus === "Completed" && !booking.booking.isCompletedFinal && !booking.booking.hasExtraProcess && (
                                                <div className="left-footer-booking-card">
                                                    <div className="extra-process-btn" onClick={() => handleClickRequest(booking.booking, booking.service)}>
                                                        Request Extra
                                                    </div>
                                                </div>
                                            )}


                                            <div className="footer-wrapper">
                                                {booking.booking.bookingServiceStatus === "Pending" && (
                                                    <div
                                                        className="footer-booking-button"
                                                        onClick={() => handleCancelBooking(booking.booking.bookingServiceId)}
                                                    >
                                                        <div className="progress-button-text">Cancel</div>
                                                    </div>
                                                )}
                                                {booking.booking.bookingServiceStatus === "Accepted" && (
                                                    <div
                                                        className="footer-booking-button"
                                                        onClick={() => handlePayment(booking.booking.bookingServiceId, booking.booking.price)}
                                                    >
                                                        <div className="progress-button-text">Payment</div>
                                                    </div>
                                                )}

                                                {booking.booking.bookingServiceStatus === "Completed" && !booking.booking.isCompletedFinal && (
                                                    <div
                                                        className="footer-booking-button"
                                                        onClick={() => handldeReview(booking.booking.serviceId, booking.booking.bookingServiceId)}
                                                    >
                                                        <div className="progress-button-text">Review</div>
                                                    </div>
                                                )}

                                                {booking.booking.bookingServiceStatus === "On Process" && (
                                                    <div
                                                        className="footer-booking-button"
                                                    // onClick={() => handlePayment(booking.booking.bookingServiceId, booking.booking.price)}
                                                    >
                                                        <div className="progress-button-text">Go to process</div>
                                                    </div>
                                                )}

                                                <div className="footer-booking-price">
                                                    <div className="total-price">
                                                        TOTAL:{" "}
                                                        <span>
                                                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                                                booking.booking.price
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 mt-4">No bookings found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListRequestBookingFarmer;