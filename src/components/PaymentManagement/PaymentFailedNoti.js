import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function PaymentFailedNoti() {
    return (
        <div className="payment-failed pt-[184px]">
            <div className="failed-container mx-auto w-full h-auto max-w-[957px]">
                <div className="heade-container">
                    <div className="title-container flex flex-row items-center justify-center gap-6">
                        <div className="success-icon w-[80px] h-[80px] bg-red-600 flex justify-center items-center rounded-full">
                            <i className="fa-solid fa-xmark text-white text-[32px]" />
                        </div>
                        <div className="success-title font-roboto font-bold text-red-600 text-[40px] tracking-[1.68px] leading-none whitespace-nowrap">
                            PAYMENT FAILED
                        </div>
                    </div>

                    <div className="subtitle-container mt-8">
                        <p className="font-roboto font-bold text-[#3e3f5e] text-[24px] tracking-[0.96px] leading-none text-center">
                            Sorry! Your transaction is currently experiencing an error.
                        </p>
                    </div>
                </div>

                <div className="footer-container flex flex-row justify-center mt-6">
                    <Link to="/" href="#" className="back-home py-[14px] px-[40px] font-roboto font-normal text-[#3DB3FB] text-[18px] tracking-[0.72px] leading-normal whitespace-nowrap hover:bg-slate-200 cursor-pointer">
                        Back to Home Page
                    </Link>
                    <Link to="/HomeProcessFarmer" href="#" className="continue bg-[#3DB3FB] py-[14px] px-[73px] font-roboto font-normal text-white text-[18px] tracking-[0.72px] leading-normal whitespace-nowrap hover:bg-[#199FEF] cursor-pointer">
                        Continue
                    </Link>
                </div>
            </div>
        </div>
    )
}