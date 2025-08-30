import React from "react";
import { Link } from "react-router-dom";
import './profile.css';

const BasicInfo = ({ info, isOwner}) => {
    const defaultInfo = {
        gender: "Updating",
        location: "Updating",
        study: "Updating",
        work: "Updating",
    };
    const userInfo = { ...defaultInfo, ...info };

    return (
        <div className="bg-white p-5 rounded-lg shadow-md text-left">
            <h2 className="text-lg font-bold mb-3">Basic Information</h2>
            <div className="flex justify-between items-center pb-3">
                <div>
                    <p className="font-bold pt-1 pb-1">Gender</p> <p className="basic-info-item">{userInfo.gender}</p>
                </div>
                <i className="fa-solid fa-venus-mars w-6 text-red-500"></i>
            </div>
            <div className="flex justify-between items-center pb-3">
                <div>
                    <p className="font-bold pt-1 pb-1">Lives in</p> <p className="basic-info-item">{userInfo.location}</p> 
                </div>
                <i className="fa-solid fa-location-dot w-5 text-green-500"></i>
            </div>
            <div className="flex justify-between items-center pb-3">
                <div>
                    <p className="font-bold pt-1 pb-1">Study at</p> <p className="basic-info-item">{userInfo.study}</p> 
                </div>
                <i className="fa-solid fa-graduation-cap w-6 text-yellow-600"></i>
            </div>
            <div className="flex justify-between items-center pb-3">
                <div>
                    <p className="font-bold pt-1 pb-1">Worked at</p> <p className="basic-info-item">{userInfo.work}</p> 
                </div>
                <i className="fa-solid fa-briefcase w-6 text-sky-500"></i>
            </div>
            {isOwner === true && (
                <Link to="/UpdateProfile">
                <button className="w-full font-bold mt-3 p-2 bg-gray-200 rounded-md">
                    Edit Information
                </button>
            </Link>
            )}
            
        </div>
    );
};

export default BasicInfo;