import { useEffect, useState } from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import ListExpertPayout from "../../components/PaymentManagement/ListExpertPayout";
import ListPayment from "../../components/PaymentManagement/ListPayment";
import instance from "../../Axios/axiosConfig";
import { Edit } from "lucide-react";

const PaymentManagementPage = () => {

    const initialViewMode = localStorage.getItem("viewMode") || "PaymentRequest";
    const [viewMode, setViewMode] = useState(initialViewMode);
    const [filterMode, setFilterMode] = useState(initialViewMode === "ExpertPayout" ? "Booking" : "All");
    const [rawPaymentData, setRawPaymentData] = useState([]);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
    const [repaymentFilter, setRepaymentFilter] = useState("All");

    useEffect(() => {
        if (localStorage.getItem("viewMode")) {
            localStorage.removeItem("viewMode");
        }
    }, [viewMode]);

    const fetchExpertPayoutData = async (token, filter) => {
        console.log("ExpertPayout viewmode");
        const endpoint =
            filter === "Booking"
                ? "/api/booking-service/booking-completed"
                : "/api/process/sub-process-completed";
        console.log("End point", endpoint);
        try {
            const res = await instance.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Response Expert:", res.data.data);
            if (res.data.success) {
                const mapped = res.data.data.map((item) => ({
                    bookingId: item.booking?.bookingServiceId,
                    subProcessId: item.subprocess?.subprocessId || null,
                    serviceName: item.service?.serviceName || "-",
                    farmer: item.account?.fullName || "-",
                    expert: item.expert?.fullName || "-",
                    status: item.payment?.isRepayment ? "Paid" : "Not yet",
                    price: item.payment?.amount ?? item.booking?.price ?? 0,
                    payAt: item.payment?.payAt || "-",
                    isRepayment: item.payment?.isRepayment ?? false, // fallback
                }));
                setRawPaymentData(mapped);
            } else {
                console.error(res.data.message);
            }
        } catch (err) {
            console.error("Error fetching expert payout data:", err);
        }
    };

    const fetchPayments = async () => {
        console.log("PaymentRequest viewmode");
        try {
            const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            const res = await instance.get("/api/payment/list-payment", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setRawPaymentData(res.data.data);
            } else {
                console.error(res.data.message);
            }
        } catch (err) {
            console.error("Error fetching payment list:", err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (viewMode === "ExpertPayout") {
            fetchExpertPayoutData(token, filterMode);
        } else {
            fetchPayments();
        }
    }, [viewMode, filterMode]);

    const filteredData = rawPaymentData.filter((item) => {
        if (viewMode === "PaymentRequest") {
            // if (filterMode === "Booking") return !item.subProcessId;
            // if (filterMode === "ExtraBooking") return !!item.subProcessId;
            if (repaymentFilter === "Payment") return !item.isRepayment;
            if (repaymentFilter === "Repayment") return item.isRepayment;
            return true;
        } else if (viewMode === "ExpertPayout") {
            if (paymentStatusFilter === "Paid") return item.status === "Paid";
            if (paymentStatusFilter === "NotYet") return item.status === "Not yet";
            return true;
        }
        return true;
    });

    console.log("Filter")
    console.log(filteredData);

    return (
        <div className="flex min-h-screen">
            <SidebarDashboard />
            <div className="p-8 w-full bg-[#3DB3FB]/5">
                <div className="text-left mb-5 font-semibold flex items-center gap-2 text-[#3E3F5E]/25">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                        <path d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z" fill="rgba(62, 63, 94, 0.25)" />
                    </svg>
                    <span>HOME / Payment</span>
                </div>

                <div className="justify-between flex flex-row">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
                            PAYMENT MANAGEMENT
                        </h1>

                        <div className="flex border-b border-gray-300 mb-6">
                            {viewMode === "PaymentRequest" && (
                                <div className="flex border-b border-gray-300 mb-6">
                                    {["All", "Payment", "Repayment"].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setRepaymentFilter(type)}
                                            className={`mr-6 pb-2 font-semibold px-5 ${repaymentFilter === type ? "border-b-2 border-blue-400 text-blue-500" : "text-gray-400"}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                            )}
                        </div>

                        {viewMode === "ExpertPayout" && (
                            <div className="filter-status text-start mb-4">
                                {["All", "Paid", "NotYet"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setPaymentStatusFilter(status)}
                                        className={`mr-6 pb-2 font-semibold px-5 ${paymentStatusFilter === status ? "border-b-2 border-blue-400 text-blue-500" : "text-gray-400"}`}
                                    >
                                        {status === "NotYet" ? "Not yet" : status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col mb-4 justify-end text-left gap-2 w-72">
                        <button
                            onClick={() => setViewMode("PaymentRequest")}
                            className={`font-semibold p-3 ${viewMode === "PaymentRequest" ? "text-[#3DB3FB] bg-white" : "text-[#3E3F5E]/25"}`}
                        >
                            Payment request
                        </button>
                        <button
                            onClick={() => {
                                setViewMode("ExpertPayout");
                                setFilterMode("Booking");
                                setPaymentStatusFilter("All");
                            }}
                            className={`font-semibold p-3 ${viewMode === "ExpertPayout" ? "text-[#3DB3FB] bg-white" : "text-[#3E3F5E]/25"}`}
                        >
                            Expert Payout
                        </button>
                    </div>
                </div>

                {viewMode === "PaymentRequest" ? (
                    <ListPayment data={filteredData} />
                ) : (
                    <ListExpertPayout key={viewMode + filterMode + paymentStatusFilter} data={filteredData} />
                )}
            </div>
        </div>
    );
};

export default PaymentManagementPage;
