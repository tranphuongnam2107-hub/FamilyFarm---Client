import React from "react";
import { Link } from "react-router-dom";
import "./progressNavstyle.css";
import overviewIcon from "../../assets/images/tdesign_personal-information-filled_svg.svg";
import serviceIcon from "../../assets/images/eos-icons_service_svg.svg";
import processIcon from "../../assets/icons/Nam_ProcessIcon.svg";
import processHighLighIcon from "../../assets/images/fluent_step-16-filled_svg.svg"
import overviewHighligh from "../../assets/icons/Nam_overviewHighligh_icon.svg";
import serviceHighligh from "../../assets/icons/Nam_serviceHighLigh_icon.svg";

export default function ProcessNav({inPage}) {
    return (
        <div className="overflow-x-auto md:overflow-x-visible mt-7">
            <div className="flex flex-row w-full mx-auto frame lg:max-w-7xl md:justify-center lg:justify-start">
                {inPage === "Overview" && (
                    <>
                        <Link to="/Professional" className="profes-nav-item highlight-page">
                            <img className="imgIconNav" src={overviewHighligh} alt="" />
                            <div className="">Overview</div>
                        </Link>
                        <Link to="/ServiceManagement" className="profes-nav-item">
                            <img className="imgIconNav" src={serviceIcon} alt="" />
                            <div className="">
                                Service Management
                            </div>
                        </Link>
                        <Link to="/ProcessList" className="profes-nav-item">
                            <img className="imgIconNav" src={processIcon} alt="" />
                            <div className="">
                                Process Management
                            </div>
                        </Link>
                    </>
                )}

                {inPage === "Service" && (
                    <>
                        <Link to="/Professional" className="profes-nav-item">
                            <img className="imgIconNav" src={overviewIcon} alt="" />
                            <div className="">Overview</div>
                        </Link>
                        <Link to="/ServiceManagement" className="profes-nav-item highlight-page">
                            <img className="imgIconNav" src={serviceHighligh} alt="" />
                            <div className="">
                                Service Management
                            </div>
                        </Link>
                        <Link to="/ProcessList" className="profes-nav-item">
                            <img className="imgIconNav" src={processIcon} alt="" />
                            <div className="">
                                Process Management
                            </div>
                        </Link>
                    </>
                )}

                {inPage === "Process" && (
                    <>
                        <Link to="/Professional" className="profes-nav-item">
                            <img className="imgIconNav" src={overviewIcon} alt="" />
                            <div className="">Overview</div>
                        </Link>
                        <Link to="/ServiceManagement" className="profes-nav-item">
                            <img className="imgIconNav" src={serviceIcon} alt="" />
                            <div className="">
                                Service Management
                            </div>
                        </Link>
                        <Link to="/ProcessList" className="profes-nav-item highlight-page">
                            <img className="imgIconNav" src={processHighLighIcon} alt="" />
                            <div className="">
                                Process Management
                            </div>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}