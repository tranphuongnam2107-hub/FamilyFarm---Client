import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProcessNav from "../ProcessNav/ProcessNav";
import "./progressListstyle.css";
// import '@fortawesome/fontawesome-free/css/all.min.css';
import searchIcon from "../../assets/images/material-symbols_search.png";
import ProgressMenu from "./ProgressMenu";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

export default function ProcessList() {
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
                const response = await instance.get("/api/process/subprocesses/expert-self-view",
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
                // toast.error("Cannot get list sub process")
                console.log(error)
            }
        }
        fetchListProcess();
    }, [accessToken])

    const handleClickViewProcess = (SubprocessData, ProcessStepsData) => {
        navigate(`/ProcessResult/${SubprocessData.subprocessId}`, {
            state: { SubprocessData, ProcessStepsData },
        });
    };
    return (
        <div className="pt-16 progress-management progress-managment">
            <div className="px-2 mx-auto div max-w-7xl">
                <ProcessNav inPage="Process" />

                <div className="flex flex-col w-full gap-6 mt-6 progress-container lg:mt-14 lg:flex-row lg:justify-center">
                    {/* MENU  */}
                    <div className="progress-left w-full lg:w-[32%] xl:w-[344px] lg:max-w-[344px]">
                        <ProgressMenu inPage="ProcessList" />
                    </div>

                    {/* CONTENT  */}
                    <div className="progress-right w-full lg:w-[66.5%] xl:w-[830px] lg:max-w-[830px]">
                        <div className="flex flex-col w-full gap-5 filter-progress-container lg:flex-row lg:justify-between lg:gap-0">
                            <div className="frame-6 flex flex-row justify-center items-center gap-3 sm:gap-[40px]">
                                <div className="frame-7">
                                    <div className="text-wrapper-9">Completed</div>
                                </div>
                                <div className="frame-8">
                                    <div className="text-wrapper-10">Not completed</div>
                                </div>
                                <div className="frame-9">
                                    <div className="text-wrapper-11">Service</div>
                                    {/* <i className="polygon fa-solid fa-caret-down"></i> */}
                                    <i className="polygon fa-solid fa-caret-down"></i>
                                </div>
                            </div>
                            <div className="frame-10">
                                <img className="img-2" src={searchIcon} />
                                <input type="text" className="text-wrapper-12" placeholder="Search in list progress" />
                            </div>
                        </div>


                        <div className="flex flex-col gap-6 mt-4 mb-12 progress-list-container">
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
                                                    <div className="text-progress-info-1">ID booking:</div>
                                                    <div className="text-progress-p-1">{item.subProcess.bookingServiceId}</div>
                                                </div>
                                                <div className="info-1">
                                                    <div className="text-progress-info-1">Service Name:</div>
                                                    <div className="text-progress-p-1">{item.service.serviceName}</div>
                                                </div>
                                                <div className="info-1">
                                                    <div className="text-progress-info-1">Farmer Name:</div>
                                                    <div className="text-progress-p-1">{item.farmer.fullName}</div>
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

                                            {item.subProcess.subProcessStatus === "Completed" && (
                                                <div className="status-info-completed max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-completed">Completed</div>
                                                </div>
                                            )}

                                            {item.subProcess.subProcessStatus !== "Completed" && item.subProcess.subProcessStatus !== "Not Started" && (
                                                <div className="status-info-uncompleted max-h-[30px] mt-4 sm:mt-0">
                                                    <div className="text-uncompleted-a-need">{item.subProcess.subProcessStatus}</div>
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
                                            <div className="footer-progress-button" onClick={() => handleClickViewProcess(item.subProcess, item.processSteps)}>
                                                <div className="progress-button-text">View</div>
                                            </div>
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
        </div >
    );
}