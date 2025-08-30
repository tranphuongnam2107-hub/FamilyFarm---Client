import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const TablePostManagement = ({ listPost }) => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const handleDelete = (postId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      // <-- Sửa ở đây
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("accessToken");

          const res = await fetch(
            `https://localhost:7280/api/post/hard-delete/${postId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await res.json();
          if (data.success === true) {
            Swal.fire("Deleted!", "The post has been deleted.", "success");
            $(`button[data-id="${postId}"]`).closest("tr").remove();
            //navigate("/Dashboard/ListAccount"); // chuyển hướng sau khi hiển thị alert
          }
        } catch (err) {
          console.error("Error fetching post censor:", err.message || err);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

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
              if (row.post?.isDeleted === false) {
                return `<span style="color: green;">Active</span>`;
              } else {
                return `<span style="color: red;">Deleted</span>`;
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
              const detailBtn = `<button class='btn-detail text-[#3DB3FB] font-bold underline mr-2' data-id='${postId}'>Detail</button>`;
              const deleteBtn = `<button class='btn-delete text-[#d65f45] font-bold underline' data-id='${postId}'>Delete</button>`;
              return detailBtn + deleteBtn;
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
          navigate(`/PostManagementDetail/${postId}`);
        }
      });
      // Gắn click cho nút Delete
      $(tableRef.current).on("click", ".btn-delete", function () {
        const postId = $(this).data("id");
        handleDelete(postId);
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

export default TablePostManagement;
