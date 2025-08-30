import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./progressMenustyle.css";
import avaiProcess from "../../assets/images/fluent_person-available-20-filled.png";
import unpaidOrder from "../../assets/images/material-symbols_warning.png";
import waitingOrder from "../../assets/images/medical-icon_waiting-area.png";
import attentionIcon from "../../assets/images/icon-park-solid_attention.png";

export default function ProgressMenu({ inPage }) {
    return (
        <div className="progress-left w-full lg:w-[32%] xl:w-[344px] lg:max-w-[344px]">
            <div className="w-full overlap-wrapper">
                <div className="flex flex-col w-full overlap-3">
                    <div className="text-wrapper-7 mt-[16px] ml-[16px] font-bold">Menu</div>
                    <div className="status-process-container mt-[13px] flex flex-col justify-center items-center gap-6">

                        {inPage === "ProcessList" && (
                            <>
                                <Link to="/ProcessList" className="item-process highlight-item">
                                    <img className="img-2" src={avaiProcess} alt="" />
                                    <div className="text-wrapper-8">Available Processes</div>
                                </Link>
                                <Link to="/UnpaidBooking" className="item-process">
                                    <img className="img-2" src={unpaidOrder} alt="" />
                                    <div className="text-wrapper-8">Extra Process Requests</div>
                                </Link>
                                <Link to="/WaitingOrderList" className="item-process">
                                    <img className="img-2" src={waitingOrder} alt="" />
                                    <div className="text-wrapper-8">Waiting Bookings</div>
                                </Link>
                            </>
                        )}

                        {inPage === "Unpaid" && (
                            <>
                                <Link to="/ProcessList" className="item-process">
                                    <img className="img-2" src={avaiProcess} alt="" />
                                    <div className="text-wrapper-8">Available Processes</div>
                                </Link>
                                <Link to="/UnpaidBooking" className="item-process highlight-item">
                                    <img className="img-2" src={unpaidOrder} alt="" />
                                    <div className="text-wrapper-8">Extra Process Requests</div>
                                </Link>
                                <Link to="/WaitingOrderList" className="item-process">
                                    <img className="img-2" src={waitingOrder} alt="" />
                                    <div className="text-wrapper-8">Waiting Bookings</div>
                                </Link>
                            </>
                        )}

                        {inPage === "Waiting" && (
                            <>
                                <Link to="/ProcessList" className="item-process">
                                    <img className="img-2" src={avaiProcess} alt="" />
                                    <div className="text-wrapper-8">Available Processes</div>
                                </Link>
                                <Link to="/UnpaidBooking" className="item-process">
                                    <img className="img-2" src={unpaidOrder} alt="" />
                                    <div className="text-wrapper-8">Extra Process Requests</div>
                                </Link>
                                <Link to="/WaitingOrderList" className="item-process highlight-item">
                                    <img className="img-2" src={waitingOrder} alt="" />
                                    <div className="text-wrapper-8">Waiting Bookings</div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}