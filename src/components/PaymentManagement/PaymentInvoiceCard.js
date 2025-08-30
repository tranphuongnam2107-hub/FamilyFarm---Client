import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import logo from '../../assets/images/logo.png';
import { saveAs } from "file-saver"; // ⚠️ nhớ cài

export default function PaymentInvoiceCard({ paymentId }) {
    const [data, setData] = useState(null);

    const roleId = localStorage.getItem("roleId") || sessionStorage.getItem("roleId");

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

                const res = await instance.get(`/api/payment/bill-payment/${paymentId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("bill payment data:", res.data.data);

                if (res.data.success) {
                    setData(res.data.data);
                } else {
                    alert("Không thể lấy dữ liệu hóa đơn.");
                }
            } catch (err) {
                console.error("Lỗi khi fetch hóa đơn:", err);
            }
        };

        if (paymentId) fetchBill();
    }, [paymentId]);

    // ✅ Nếu chưa có data, hiển thị loading
    if (!data) {
        return (
            <div className="pt-[150px] text-center text-gray-500">
                Đang tải hóa đơn...
            </div>
        );
    }

    const formattedDate = new Date(data.payAt).toLocaleDateString("vi-VN");
    const bookingDate = new Date(data.bookingServiceAt).toLocaleDateString("vi-VN");
    const priceFormatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(data.price ?? 0);

    const handleExportBill = async () => {
        try {
            const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

            const res = await fetch(`https://localhost:7280/api/payment/export-bill/${paymentId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // 👉 Debug xem server trả về gì
            if (!res.ok) {
                const text = await res.text();
                console.error("❌ Server response:", res.status, res.statusText, text);
                alert("Tải hóa đơn thất bại.");
                return;
            }

            const blob = await res.blob();
            if (blob.type !== "application/pdf") {
                const errorText = await blob.text();
                console.error("❌ Không phải file PDF:", errorText);
                alert("Phản hồi không hợp lệ, không phải file PDF.");
                return;
            }

            saveAs(blob, `Bill_${paymentId}.pdf`);
        } catch (error) {
            console.error("❌ Exception khi export:", error);
            alert("Tải hóa đơn thất bại.");
        }
    };



    return (
        <div className="payment-invoice pt-20">
            {/* QUAY LẠI Ở ĐÂY */}
            <div className="bill-payment-container mx-auto w-full max-w-[850px] bg-slate-50 py-14 px-16 rounded-3xl shadow-lg">
                {/* Header */}
                <div className="bill-header flex flex-row justify-between">
                    <div className="left-header">
                        <img src={logo} className="w-[100px]" alt="Logo" />
                        <p className="font-roboto font-bold text-[28px] leading-normal whitespace-nowrap mt-2">
                            Invoice: {data.paymentId}
                        </p>
                    </div>
                    <div className="right-header mr-18">
                        <div className="payment-status bg-green-600 hover:bg-green-700 w-[150px] px-3 py-1 rounded-md cursor-pointer transition-colors duration-200">
                            <p className="font-roboto text-center font-semibold text-[20px] text-white leading-normal whitespace-nowrap">
                                Paid
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="bill-border border-t border-gray-300 my-4" />

                {/* Body */}
                <div className="bill-body">
                    {/* Expert & System info */}
                    <div className="bill-info-container flex flex-row justify-between">
                        <div className="left-info">
                            <div className="receiver-name-container text-start">
                                <div className="receiver-name-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap">
                                    Payer information
                                </div>
                                <div className="receiver-name font-roboto text-[13px] font-semibold leading-normal whitespace-nowrap">
                                    {data.payerName}
                                </div>
                            </div>

                            <div className="country-container mt-3 text-start">
                                <div className="country-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap">
                                    Country
                                </div>
                                <div className="country-name font-roboto text-[13px] font-semibold leading-normal whitespace-nowrap">
                                    Viet Nam
                                </div>
                            </div>

                            <div className="invoice-date-container mt-3 text-start">
                                <div className="invoice-date-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap">
                                    Invoice creation date
                                </div>
                                <div className="invoice-date font-roboto text-[13px] font-semibold leading-normal whitespace-nowrap">
                                    {formattedDate}
                                </div>
                            </div>
                        </div>

                        <div className="right-info flex flex-col justify-between">
                            <div className="system-provider-container">
                                <div className="system-provider-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap text-end">
                                    System Provider
                                </div>
                                <div className="system-provider font-roboto text-[13px] font-semibold leading-normal whitespace-nowrap text-end">
                                    Family Farm
                                </div>
                            </div>

                            <div className="payment-method-container">
                                <div className="payment-method-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap text-end">
                                    Payment method
                                </div>
                                <div className="payment-method font-roboto text-[13px] font-semibold leading-normal whitespace-nowrap text-end">
                                    Transfer application
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bill-description-container w-full bg-slate-300 mt-8 rounded-3xl p-2">
                        <div className="bill-des-title font-roboto font-semibold text-[24px] leading-normal whitespace-nowrap ml-4">
                            Payment information
                        </div>
                        <hr className="bill-border border-t border-gray-400 my-2" />

                        <div className="description-container flex flex-row justify-between">
                            <div className="left-description">
                                <div className="description-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap">
                                    Detailed description
                                </div>
                                <div className="description-content mt-2 space-y-2 text-start">
                                    <div className="service-name-content">
                                        <span className="service-name-label">Service name: </span>
                                        <span className="service-name">{data.serviceName}</span>
                                    </div>
                                    <div className="service-category-content">
                                        <span className="service-category-label">Category: </span>
                                        <span className="service-category">{data.categoryServiceName}</span>
                                    </div>
                                    <div className="farmer-booking-content">
                                        <span className="farmer-booking-label">Service owner: </span>
                                        <span className="farmer-booking">{data.expertName}</span>
                                    </div>
                                    <div className="farmer-booking-content">
                                        <span className="farmer-booking-label">Service booker: </span>
                                        <span className="farmer-booking">{data.farmerName}</span>
                                    </div>
                                    <div className="booking-date-content">
                                        <span className="booking-date-label">Date booked: </span>
                                        <span className="booking-date">{bookingDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="right-description">
                                <div className="money-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap mr-4">
                                    Total amount
                                </div>
                                <div className="money-content mt-2 text-end mr-4">
                                    {priceFormatted}
                                </div>
                            </div>
                        </div>

                        {/* Payment total */}
                        <div className="payment-total-container flex flex-col w-full">
                            <div className="total-fee-container flex flex-row gap-7 justify-end mr-4">
                                <div className="total-fee-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap">
                                    Total service fee
                                </div>
                                <div className="total-fee-price">{priceFormatted}</div>
                            </div>
                            <div className="total-payment-container flex flex-row gap-7 justify-end mr-4">
                                <div className="total-payment-label font-roboto font-bold text-gray-700 leading-normal whitespace-nowrap">
                                    Total payment
                                </div>
                                <div className="total-payment-price">{priceFormatted}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bill-footer flex justify-end">
                    <button className="export-container flex flex-row gap-1 px-2 py-1 bg-zinc-200 hover:bg-zinc-300 transition-colors duration-200 mt-4" onClick={handleExportBill}>
                        <div className="download-img">
                            <i className="fa-solid fa-download"></i>
                        </div>
                        <div className="export">Export</div>
                    </button>
                </div>
            </div>
            <div className="px-4 my-4">
                {roleId === "67fd41dfba121b52bbc622c3" ? (
                    <Link
                    to="/PaymentManagement"
                    className="text-blue-500 hover:underline font-medium text-sm"
                    >
                    ← Return to payment management list
                    </Link>
                ) : (
                    <Link
                    to="/PaymentUserPage"
                    className="text-blue-500 hover:underline font-medium text-sm"
                    >
                    ← Return to your payment history
                    </Link>
                )}
            </div>
        </div>
    )
}