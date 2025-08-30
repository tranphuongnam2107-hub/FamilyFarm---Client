import React, { useState, useEffect } from 'react';
import MenuProgressFarmer from "../MenuProgressFarmer/MenuProgress";
import "./extraProcess.css";
import { Link } from 'react-router-dom';
import instance from "../../Axios/axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

const FormRequestExtraProcess = ({ bookingData, serviceData }) => {
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [accessToken, setAccessToken] = useState("");
    const navigate = useNavigate();

    console.log(bookingData)
    console.log(serviceData)

    // Lấy thông tin người dùng từ storage
    useEffect(() => {
        const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
        const storedAccesstoken = localStorage.getItem("accessToken");
        if (storedAccId) {
            setAccessToken(storedAccesstoken);
        }
    }, []);

    //VALIDATE FORM
    const validate = () => {
        if (!description || description.trim().length <= 0) {
            setError("Description cannot be blank.");
            return false;
        }

        if(!description || description.trim().length > 500) {
            setError("The description field cannot be longer than 500 characters.");
            return false;
        }

        setError('');
        return true;
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const loading = Swal.fire({
            title: 'Sending...',
            text: 'Please wait while we send your request.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const payload = {
                bookingId: bookingData.bookingServiceId,
                extraDescription: description,
            };

            const response = await instance.put('/api/booking-service/request-extra', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });
            
            Swal.close(); // Đóng loading

            if (response.status === 200) {
                toast.success("SEND REQUEST EXTRA PROCESS SUCCESSFULLY")
                navigate("/HomeProcessFarmer");
            }
        } catch (err) {
            Swal.close();

            if (err.response?.status === 409) {
                toast.error("A request already exists or conflict occurred.");
            } else {
                toast.error("Failed to send request. Please try again.");
            }
        }
    };

    return (
        <div className="FormRequestExtraProcess">
            <div className="pt-36">
                <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-[23px] px-2">
                    <MenuProgressFarmer inPage="booking" />

                    <div className="request-extra-container w-full xl:w-[831px] max-w-[831px] flex flex-col items-start gap-7">
                        <h1 className="text-2xl uppercase font-bold text-[#3DB3FB]">Request new Extra process</h1>

                        <form onSubmit={handleSendRequest} className="request-form flex flex-col gap-4 items-start w-full p-4 rounded-xl shadow-xl">
                            <div className="request-form-item font-bold text-base">
                                Service name: <Link to='' className="text-[#3DB3FB] font-medium">{serviceData.serviceName}</Link>
                            </div>
                            <div className="request-form-item font-bold text-base">
                                Booking ID: <span className="text-[#3E3F5E] font-medium">{bookingData.bookingServiceId}</span>
                            </div>
                            <div className="request-form-item w-full h-[168px] flex flex-row items-center justify-center">
                                <textarea className="w-full h-full border-[2px] border-dotted p-3 outline-none rounded-xl" 
                                placeholder='Description...'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}>
                                </textarea>
                            </div>
                            {error && <div className="text-red-500 font-medium">{error}</div>}
                            <div className="request-form-item transition hover:bg-blue-300 w-1/2 text-[#FFFFFF] font-bold bg-[#3DB3FB] rounded-lg shadow-2xs">
                                <button type="submit" className="request-btn w-full h-full p-4">Send Request</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormRequestExtraProcess