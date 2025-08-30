import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const TableListPostAI = ({ listPost }) => {
  const navigate = useNavigate();
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
          {
            title: "ID",
            render: (data, type, row) => row.post?.postId || "No content",
          },
          {
            title: "Content",
            render: (data, type, row) => row.post?.postContent || "No content",
          },
          {
            title: "Owner",
            render: (data, type, row) => row.ownerPost?.fullName || "Unknown",
          },
          {
            title: "Status",
            render: (data, type, row) => {
              if (row.post?.status === 0) {
                return `<span style="color: green;">Pass</span>`;
              } else {
                return `<span style="color: red;">Fail</span>`;
              }
            },
          },
          {
            title: "Created At",
            render: (data, type, row) =>
              row.post?.createdAt
                ? new Date(row.post.createdAt).toLocaleDateString("vi-VN")
                : "N/A",
          },
          {
            data: "postId",
            title: "Action",
            render: function (data, type, row) {
              const postId = row.post?.postId;
              return `<button class='btn-detail text-[#3DB3FB] hover:underline' data-id='${postId}'>Detail</button>`;
            },
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

      // Gắn click cho nút Detail
      $(tableRef.current).on("click", ".btn-detail", function () {
        const postId = $(this).data("id");
        if (postId != null) {
          navigate(`/ListPostCheckedAI/PostAIDetail/${postId}`);
        }
      });
    }, 100); // Delay 100ms
    $(tableRef.current).find("thead").addClass("bg-blue-100");
    return () => {
      if (dtInstance) {
        dtInstance.destroy(true); // Dọn sạch DataTables DOM
      }
    };
  }, [listPost]);

  return <table ref={tableRef} className="display w-full"></table>;
};

export default TableListPostAI;
