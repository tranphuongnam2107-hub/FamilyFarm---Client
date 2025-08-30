import React, { useEffect, useState } from "react";
import { useSignalR } from "../../context/SignalRContext";
import { useNotification } from "../../context/NotificationContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProcessNav from "../ProcessNav/ProcessNav";
import "./waitingListstyle.css";
import "../../components/ProcessList/progressListFarmerstyle.css";
import avaiProcess from "../../assets/images/fluent_person-available-20-filled.png";
import unpaidOrder from "../../assets/images/material-symbols_warning.png";
import waitingOrder from "../../assets/images/medical-icon_waiting-area.png";
import attentionIcon from "../../assets/images/icon-park-solid_attention.png";
import searchIcon from "../../assets/images/material-symbols_search.png";
import nameFilterIcon from "../../assets/images/hugeicons_arrange-by-letters-az.png";
import workGray from "../../assets/images/material-symbols_work_gray.png";
import deatilIcon from "../../assets/images/material-symbols_read-more.png";
import ProgressMenu from "../ProcessList/ProgressMenu";
import instance from "../../Axios/axiosConfig";

export default function UnpaidList() {
    const { hubConnection } = useNotification();
    const { connection } = useSignalR();
    const [listBooking, setListBooking] = useState([]);
    const [accessToken, setAccessToken] = useState("");
    const navigate = useNavigate();

    //lấy thông tin người dùng từ storage
    useEffect(() => {
        const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
        const storedAccesstoken = localStorage.getItem("accessToken");
        if (storedAccId) {
            setAccessToken(storedAccesstoken);
        }
    }, []);

    //LAY DS request Extra process
    useEffect(() => {
        if (!accessToken) return;

        const fetchListBooking = async () => {
            try {
                const response = await instance.get("/api/booking-service/request-extra",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
                console.log(response.data.data)
                if (response.status === 200) {
                    setListBooking(response.data.data)
                }
            } catch (error) {
                console.log("cannot get list booking " + error)
            }
        }

        fetchListBooking();
    }, [accessToken])

    const handleNavigateCreate = (service, booking) => {
        navigate('/CreateSubprocess', {
            state: { service, booking, IsExtraProcess: true }
        })
    }

    return (
        <div className="pt-16 progress-management progress-managment">
            <div className="px-2 div">
                <ProcessNav inPage="Process" />
                <div className="flex flex-col w-full gap-6 mt-6 progress-container lg:mt-14 lg:flex-row lg:justify-center">
                    <div className="progress-left w-full lg:w-[32%] xl:w-[344px] lg:max-w-[344px]">
                        <ProgressMenu inPage="Unpaid" />
                    </div>

                    <div className="progress-right w-full lg:w-[66.5%] xl:w-[830px] lg:max-w-[830px]">
                        <div className="flex flex-col w-full gap-5 header-waiting-container lg:flex-row lg:justify-between lg:gap-0">
                            <div className="frame-6 flex flex-row justify-center items-center gap-3 sm:gap-[40px]">
                                <div className="text-wrapper-title">Extra Process Requests</div>
                            </div>
                            <div className="frame-10">
                                <img className="img-2" src={searchIcon} alt="" />
                                <input type="text" className="text-wrapper-12" placeholder="Search in list process" />
                            </div>
                        </div>

                        <div className="w-full xl:w-[831px] max-w-[831px]">

                            <div className="progress-list-container mt-[26px] flex flex-col gap-10">
                                {Array.isArray(listBooking) && listBooking.length > 0 ? (
                                    listBooking.map((booking, index) => (

                                        <div key={booking.booking.bookingServiceId || index} className="progress-card w-full">
                                            <div className="header-progress-section flex flex-col sm:flex-row justify-between">
                                                <div className="infor-progress-section">
                                                    <div className="info-1">
                                                        <div className="text-progress-info-1">ID Booking:</div>
                                                        <div className="text-progress-id">{booking.booking.bookingServiceId}</div>
                                                    </div>
                                                    <div className="info-1">
                                                        <div className="text-progress-info-1">Farmer Name: </div>
                                                        <div className="text-progress-p-1">{booking.account.fullName}</div>
                                                    </div>
                                                    <div className="date-info">
                                                        <div className="text-progress-info-1">Booking at:</div>
                                                        {(() => {
                                                            const d = new Date(booking.booking.bookingServiceAt);
                                                            const dateStr = d.toLocaleDateString("vi-VN");
                                                            const timeStr = d.toLocaleTimeString("vi-VN");
                                                            return (
                                                                <div className="text-progress-p-1">
                                                                    {timeStr} - {dateStr}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="info-1">
                                                        <div className="text-progress-info-1">Service name:</div>
                                                        <div className="text-progress-p-1">{booking.service.serviceName}</div>
                                                    </div>
                                                </div>

                                                <div className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-uncompleted-a-need">Request Extra</div>
                                                </div>

                                            </div>

                                            <div className="footer-booking-card">
                                                <div className="footer-wrapper">
                                                    <div className="footer-booking-button" onClick={() => handleNavigateCreate(booking.service, booking.booking)}>
                                                        <div className="progress-button-text">Create Process</div>
                                                    </div>
                                                    
                                                    <div className="footer-booking-price">
                                                        <div className="total-price">
                                                            TOTAL: <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.booking.price)}</span>
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
        </div>
    );
}