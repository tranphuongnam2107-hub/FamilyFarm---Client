import { useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import instance from "../../Axios/axiosConfig";

const ListExpertPayout = ({ data }) => {
    const tableRef = useRef(null);

    const renderTable = () => {
        const $table = $(tableRef.current);

        // Nếu đã khởi tạo, hủy trước
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().destroy();
        }

        $table.find("tbody").empty(); // Clear rows

        data.forEach((payment) => {
            const statusClass =
                payment.status === "Paid"
                    ? "text-[#EF3E36]"
                    : payment.status === "Not yet"
                        ? "text-[#3E3F5E]/25"
                        : "";

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

            $table.find("tbody").append(`
                <tr>
                    <td class="text-left">${payment.serviceName ?? "-"}</td>
                    <td class="text-left">${payment.farmer ?? "-"}</td>
                    <td class="text-left">${payment.expert ?? "-"}</td>
                    <td class="font-bold text-left ${statusClass}">${payment.status}</td>
                    <td class="text-right">${formattedPrice}</td>
                    <td class="text-left">${formattedDate}</td>
                    <td class="text-left">
                        ${payment.status === "Not yet"
                    ? `<button 
                                        class="repayment-btn bg-[#3DB3FB]/25 text-[#3DB3FB] text-sm px-2 py-0.5 rounded font-semibold"
                                        data-booking-id="${payment.bookingId}" 
                                        data-subprocess-id="${payment.subProcessId ?? null}"
                                        data-amount="${payment.price ?? 0}"
                                    >
                                        Repayment
                                    </button>`
                    : `<span class="text-[#EF3E36] font-semibold text-sm">Paid</span>`
                }
                    </td>
                </tr>
            `);
        });

        // Khởi tạo lại DataTable
        $.fn.dataTable.ext.errMode = 'none'; // tắt cảnh báo
        $table.DataTable({
            retrieve: true,
            autoWidth: false,
        });
    };

    // useEffect(() => {
    //     renderTable();
    // }, [data]);

    useEffect(() => {
        renderTable();

        // Thêm event handler cho nút repayment
        const $table = $(tableRef.current);

        $table.on("click", ".repayment-btn", async function () {
            const bookingServiceId = $(this).data("booking-id");
            const subProcessId = $(this).data("subprocess-id") || null;
            const amount = parseFloat($(this).data("amount"));

            const token =
                localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

            try {
                const res = await instance.post(
                    "/api/payment/create-repayment",
                    {
                        BookingServiceId: bookingServiceId,
                        SubprocessId: subProcessId,
                        Amount: amount,
                        AdminId: "ADMIN123", // hoặc để backend tự lấy, để đây cx không quan trọng
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (res.data?.paymentUrl) {
                    window.location.href = res.data.paymentUrl;
                } else {
                    alert("Không thể tạo URL thanh toán");
                }
            } catch (err) {
                console.error("Lỗi khi tạo repayment:", err);
                alert("Có lỗi khi tạo thanh toán hoàn trả.");
            }
        });

        return () => {
            // Cleanup
            $table.off("click", ".repayment-btn");
        };
    }, [data]);

    return (
        <div className="w-full mt-2 bg-[#3DB3FB]/5">
            <div className="bg-white p-4 rounded shadow">
                <table ref={tableRef} className="display w-full">
                    <thead>
                        <tr className="bg-[#3DB3FB]/25">
                            <th>Service name</th>
                            <th>Farmer</th>
                            <th>Expert</th>
                            <th>Status</th>
                            <th className="text-right">Price</th>
                            <th>Pay At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    );
};

export default ListExpertPayout;

