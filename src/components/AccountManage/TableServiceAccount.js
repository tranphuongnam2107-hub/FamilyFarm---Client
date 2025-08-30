import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

const TableServiceAccount = ({ listService }) => {
  const tableRef = useRef(null);
  useEffect(() => {
    let dtInstance; //Khai báo ở đây

    const timeout = setTimeout(() => {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().clear().destroy();
      }

      $(tableRef.current).DataTable({
        data: listService,
        columns: [
          { data: null, title: "ID" },
          {
            title: "Service Name",
            render: (data, type, row) =>
              row.service?.serviceName || "No content",
          },
          {
            title: "Description",
            render: (data, type, row) =>
              row.service?.serviceDescription || "Unknown",
          },
          {
            title: "Price",
            render: (data, type, row) => row.service?.price || "Unknown",
          },
          {
            title: "Created At",
            render: (data, type, row) =>
              row.service?.createAt
                ? new Date(row.service.createAt).toLocaleDateString("vi-VN")
                : "N/A",
          },
          {
            title: "Status",
            render: (data, type, row) =>
              row.service?.isDeleted ? "Deleted" : "Not deleted",
          },
        ],
        columnDefs: [
          {
            targets: 0,
            render: (data, type, row, meta) => meta.row + 1,
            className: "text-left",
            width: "1.25rem",
          },
          {
            targets: "_all",
            className: "text-left",
          },
        ],
        destroy: true,
        searching: true,
      });
    }, 100); // Delay 100ms
    $(tableRef.current).find("thead").addClass("bg-[rgba(61,179,251,0.25)]");
    return () => {
      if (dtInstance) {
        dtInstance.destroy(true); // Dọn sạch DataTables DOM
      }
    };
  }, [listService]);

  return <table ref={tableRef} className="display w-full"></table>;
};

export default TableServiceAccount;
