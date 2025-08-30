import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

const TablePostOfAccount = ({ listPost }) => {
  const tableRef = useRef(null);

  useEffect(() => {
    let dtInstance; //Khai báo ở đây
    // if (!listPost || listPost.length === 0) return;

    const timeout = setTimeout(() => {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().clear().destroy();
      }

      $(tableRef.current).DataTable({
        data: listPost,
        columns: [
          { data: null, title: "ID" },
          {
            title: "Content",
            render: (data, type, row) => row.post?.postContent || "No content",
          },
          {
            title: "Fullname",
            render: (data, type, row) => row.ownerPost?.fullName || "Unknown",
          },
          {
            title: "Status",
            render: (data, type, row) =>
              row.post?.isDeleted ? "Deleted" : "Not deleted",
          },
          {
            title: "Created At",
            render: (data, type, row) =>
              row.post?.createdAt
                ? new Date(row.post.createdAt).toLocaleDateString("vi-VN")
                : "N/A",
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
  }, [listPost]);

  return <table ref={tableRef} className="display w-full"></table>;
};

export default TablePostOfAccount;
