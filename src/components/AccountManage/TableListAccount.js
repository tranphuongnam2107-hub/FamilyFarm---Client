import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const TableListAccount = ({ displayList, isCensor, onDeleted }) => {
  const tableRef = useRef(null);
  const navigate = useNavigate();

  const handleDelete = (accId, status) => {
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
            `https://localhost:7280/api/account/update-censor/${accId}/1`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await res.json();
          if (data === true) {
            Swal.fire("Deleted!", "The account has been deleted.", "success");
            onDeleted?.();
            //navigate("/Dashboard/ListAccount"); // chuyển hướng sau khi hiển thị alert
          }
        } catch (err) {
          console.error("Error fetching account censor:", err.message || err);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  useEffect(() => {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().clear().destroy();
    }

    const table = $(tableRef.current).DataTable({
      data: displayList || [],
      columns: [
        { data: null, title: "ID" },
        { data: "username", title: "Username" },
        { data: "fullName", title: "Fullname" },
        {
          data: "status",
          title: "Status",
          render: (data) => {
            if (isCensor === true) {
              if (data === 0) return "Pass";
              if (data === 1) return "Fail";
              if (data === 2) return "Not yet";
              return "Unknown";
            } else {
              if (data === 0) return "Active";
              if (data === 1) return "Deleted";
              if (data === 2) return "UnActive";
              return "Unknown";
            }
          },
        },
        {
          data: "createdAt",
          title: "Create At",
          render: (data) => new Date(data).toLocaleDateString("vi-VN"),
        },
        {
          data: "accId",
          title: "Action",
          render: function (data) {
            const detailBtn = `<button class='btn-detail text-[#3DB3FB] font-bold underline' data-id='${data}'>Detail</button>`;
            const deleteBtn = `<button class='btn-delete text-[#d65f45] font-bold underline' data-id='${data}'>Delete</button>`;
            return isCensor ? detailBtn : `${detailBtn} ${deleteBtn}`;
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

    $(tableRef.current).find("thead").addClass("bg-[rgba(61,179,251,0.25)]");

    // Gắn click cho nút Detail
    $(tableRef.current).on("click", ".btn-detail", function () {
      const accId = $(this).data("id");
      if (isCensor === true) {
        navigate(`/CensorDetail/${accId}`);
      } else {
        navigate(`/AccountDetail/${accId}`);
      }
    });

    // Gắn click cho nút Delete
    $(tableRef.current).on("click", ".btn-delete", function () {
      const accId = $(this).data("id");
      handleDelete(accId);
    });

    // Cleanup
    return () => {
      $(tableRef.current).off("click", ".btn-detail");
      $(tableRef.current).off("click", ".btn-delete");
    };
  }, [displayList, navigate]);

  return <table id="table" ref={tableRef} className="display w-full"></table>;
};

export default TableListAccount;
