import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { useEffect, useRef } from "react";

const ListPayment = ({ data }) => {
    const tableRef = useRef(null);

    const renderTable = () => {
        const $table = $(tableRef.current);

        // Destroy old DataTable if exists
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().destroy();
        }

        // Clear tbody
        $table.find("tbody").empty();

        data.forEach((payment) => {
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


            const serviceName = payment.serviceName ?? "";
            const farmerName = payment.farmerName ?? payment.farmer ?? "";
            const expertName = payment.expertName ?? payment.expert ?? "";

            $table.find("tbody").append(`
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
            `);
        });

        // Tắt cảnh báo
        $.fn.dataTable.ext.errMode = 'none';

        // Khởi tạo lại
        $table.DataTable({
            retrieve: true,
            autoWidth: false,
        });

        // Gắn click event cho nút Detail sau khi render xong
        $table.find(".detail-btn").on("click", function () {
            const paymentId = $(this).data("id");
            console.log("Chuyển trang");
            window.location.href = `/PaymentInvoice/${paymentId}`;
        });
    };


    useEffect(() => {
        renderTable();
    }, [data]);

    return (
        <div className="w-full bg-[#3DB3FB]/5">
            <div className="bg-white p-4 rounded shadow">
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
};

export default ListPayment;

