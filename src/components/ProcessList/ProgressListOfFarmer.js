import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MenuProgressFarmer from "../MenuProgressFarmer/MenuProgress";
import "./progressListFarmerstyle.css";
import searchIcon from "../../assets/images/material-symbols_search.svg";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";

export default function ProgressListOfFarmer() {
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useState("");
    const [subprocesses, setSuprocesses] = useState([])

    //lấy thông tin người dùng từ storage
    useEffect(() => {
        const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
        const storedAccesstoken = localStorage.getItem("accessToken");
        if (storedAccId) {
            setAccessToken(storedAccesstoken);
        }
    }, []);

    //GỌI API lấy list subprocess
    useEffect(() => {
        const fetchListProcess = async () => {
            try {
                const response = await instance.get("/api/process/subprocesses/farmer-self-view",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })

                console.log(response.data);
                if (response.status === 200) {
                    setSuprocesses(response.data.subprocesses);
                }
            } catch (error) {
                toast.error("Cannot get list sub process")
            }
        }
        fetchListProcess();
    }, [accessToken])

    const handleClickViewProcess = (SubprocessData, ProcessStepsData, isEdit) => {
        navigate(`/ProcessResult/${SubprocessData.subprocessId}`, {
            state: { SubprocessData, ProcessStepsData, isEdit },
        });
    };

    return (
        <div className="progress-managment pt-36">
            <div className="progress-managment-container flex flex-col lg:flex-row justify-center items-center lg:items-start gap-[23px] px-2">
                <MenuProgressFarmer inPage="process" />
                <div className="list-progress-section w-full xl:w-[831px] max-w-[831px]">
                    <div className="status-nav-container w-full">
                        <div className="status-progress-nav w-full">
                            <div className="status-all w-[12.15%]">
                                <div className="text-2">All</div>
                            </div>
                            <div className="status-uncompleted w-[21.5%]">
                                <div className="text-2">Uncompleted</div>
                            </div>
                            <div className="status-completed w-[17.8%]">
                                <div className="text-2">Completed</div>
                            </div>
                            <div className="status-need-info w-[17.8%]">
                                <div className="text-2">Need confirmation</div>
                            </div>
                        </div>
                    </div>
                    <div className="search-progress-container mt-[13px] h-10">
                        <div className="search-bar w-full h-full">
                            <div className="search-bar relative w-full h-full flex items-center">
                                <img className="material-symbols-2 pl-4" src={searchIcon} alt="search icon" />
                                <input type="text" className="search-input w-[38.5%]" placeholder="Search based on service name, expert name, or booking ID" />
                            </div>
                        </div>
                    </div>
                    <div className="progress-list-container mt-[26px] flex flex-col gap-10">

                        {Array.isArray(subprocesses) && subprocesses.length > 0 ? (
                            subprocesses.map((item, index) => (
                                <div key={item.subProcess.subprocessId || index} className="progress-card w-full">
                                    <div className="header-progress-section flex flex-col sm:flex-row justify-between">
                                        <div className="infor-progress-section">
                                            <div className="info-1">
                                                <div className="text-progress-info-1">ID Process:</div>
                                                <div className="text-progress-id">{item.subProcess.subprocessId}</div>
                                            </div>
                                            <div className="info-1">
                                                <div className="text-progress-info-1">ID Booking:</div>
                                                <div className="text-progress-p-1">{item.subProcess.bookingServiceId}</div>
                                            </div>
                                            <div className="info-1">
                                                <div className="text-progress-info-1">Service Name:</div>
                                                <div className="text-progress-p-1">{item.service.serviceName}</div>
                                            </div>
                                            <div className="info-1">
                                                <div className="text-progress-info-1">Expert Name:</div>
                                                <div className="text-progress-p-1">{item.expert.fullName}</div>
                                            </div>
                                            <div className="date-info">
                                                <div className="text-progress-info-1">Lasted updated:</div>
                                                {(() => {
                                                    const d = new Date(item.subProcess.updatedAt || item.subProcess.createdAt);
                                                    const dateStr = d.toLocaleDateString("vi-VN");
                                                    const timeStr = d.toLocaleTimeString("vi-VN");
                                                    return (
                                                        <div className="text-progress-p-1">
                                                            {timeStr} - {dateStr}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {item.subProcess.subProcessStatus === "Not Started" && (
                                            <div style={{ background: "rgba(62, 63, 94, 0.25)", color: "#3E3F5E" }} className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                <div style={{ color: "#3E3F5E" }} className="text-uncompleted-a-need">{item.subProcess.subProcessStatus}</div>
                                            </div>
                                        )}

                                        {item.subProcess.subProcessStatus !== "Completed" && item.subProcess.subProcessStatus !== "Not Started" && (
                                            <div className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                <div className="text-uncompleted-a-need">{item.subProcess.subProcessStatus}</div>
                                            </div>
                                        )}

                                        {item.subProcess.subProcessStatus === "Completed" && (
                                            <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                <div className="text-completed">Completed</div>
                                            </div>
                                        )}

                                    </div>
                                    <div className="progress-step-container w-full">
                                        {item.processSteps.length > 0 && (
                                            item.processSteps.map((step, index) => (
                                                <div className={step.processStep.stepNumber <= item.subProcess.continueStep ? "done-step" : "not-done-step"}>
                                                    <div className="text-progress-info-1">Step {step.processStep.stepNumber}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="footer-progress-section">
                                        {item.subProcess.subProcessStatus === "Completed" && (
                                            <div className="footer-progress-button"
                                                onClick={() => handleClickViewProcess(item.subProcess, item.processSteps, false)}>
                                                <div className="progress-button-text">Continue</div>
                                            </div>
                                        )}

                                        {item.subProcess.subProcessStatus !== "Completed" && (
                                            <div className="footer-progress-button"
                                                onClick={() => handleClickViewProcess(item.subProcess, item.processSteps, true)}>
                                                <div className="progress-button-text">Continue</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))

                        ) : (
                            <p className="text-center text-gray-500 mt-4">No process found.</p>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}