import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { useEffect, useRef, useState } from "react";
import instance from "../../Axios/axiosConfig";
import { Link, useLocation } from "react-router-dom";

const ListUserPayment = () =>{
    const location = useLocation();
    const tableRef = useRef(null);
    const [data, setData] = useState([]);

    const roleId = localStorage.getItem("roleId") || sessionStorage.getItem("roleId");

    const fetchPayments = async () => {
        try {
            const token =
                localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            const res = await instance.get("/api/payment/list-payment-user", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data && res.data.success) {
                setData(res.data.data); // mảng payment
            } else {
                console.error(res.data.message);
            }
        } catch (error) {
            console.error("Error fetching payment list:", error);
        }
    };

    const renderTable = () => {
        const $table = $(tableRef.current);

        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().destroy();
        }

        $table.find("tbody").empty();

        data.forEach((payment) => {
            const serviceName = payment.serviceName ?? "N/A";
            const farmerName = payment.farmerName ?? "N/A";
            const expertName = payment.expertName ?? "N/A";

            const formattedPrice = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
            }).format(payment.price ?? 0);

            const formattedDate = (() => {
                const d = new Date(payment.payAt);
                return isNaN(d.getTime())
                    ? "N/A"
                    : d.toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
            })();

            const row = `
                <tr>
                    <td class="text-left break-all max-w-[250px]">${payment.paymentId}</td>
                    <td class="text-left">${serviceName}</td>
                    <td class="text-left">${farmerName}</td>
                    <td class="text-left">${expertName}</td>
                    <td class="text-right">${formattedPrice}</td>
                    <td class="text-left">${formattedDate}</td>
                    <td class="text-left">
                        <button 
                            class="bg-[#3DB3FB]/25 text-[#3DB3FB] text-sm px-2 py-0.5 rounded font-semibold detail-btn"
                            data-id="${payment.paymentId}"
                        >
                            Detail
                        </button>
                    </td>
                </tr>
            `;

            $table.find("tbody").append(row);
        });

        $.fn.dataTable.ext.errMode = "none";
        $table.DataTable({ retrieve: true, autoWidth: false });

        $table.find(".detail-btn").on("click", function () {
            const paymentId = $(this).data("id");
            window.location.href = `/PaymentInvoice/${paymentId}`;
        });
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        if (data.length > 0) renderTable();
    }, [data]);

    return (
        <div className="payment-user-list w-full pt-36 pb-16 bg-[#3DB3FB]/5" style={{
                fontFamily: '"Roboto", sans-serif',
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "1.8",
                color: "#222", // tương đương với var(--dark-color)
            }}>
            {/* ✅ Nút chuyển trang */}
            <div className="select-btn-payment flex flex-row gap-4 px-6 mb-4">
                {roleId === "68007b0387b41211f0af1d56" && (
                    <Link
                    to="/PaymentUserPage"
                    className={`list-user-payment px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 ${
                        location.pathname === "/PaymentUserPage"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-green-100 text-gray-700"
                    }`}
                    >
                    List Payment
                    </Link>
                )}

                {roleId === "68007b2a87b41211f0af1d57" && (
                    <Link
                    to="/CreditCardPage"
                    className={`list-user-payment px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 ${
                        location.pathname === "/CreditCardPage"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 hover:bg-green-100 text-gray-700"
                    }`}
                    >
                    Credit Card
                    </Link>
                )}
            </div>
            <h1 className="text-4xl text-start font-bold text-gray-600 ml-5">Transaction History</h1>
            <div className="bg-white max-w-[90%] mt-5 p-4 rounded shadow mx-auto">
                <table ref={tableRef} id="paymentTable" className="display w-full">
                    <thead>
                        <tr className="bg-[#3DB3FB]/25">
                            <th className="w-[250px]">PaymentId</th>
                            <th className="w-[266.7px]">Service name</th>
                            <th className="w-[203.69px]">Farmer</th>
                            <th className="w-[208.72px]">Expert</th>
                            <th className="w-[173.42px]">Price</th>
                            <th className="w-[217.36px]">Pay At</th>
                            <th className="w-[164.41px]">Action</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    );
}
export default ListUserPayment;