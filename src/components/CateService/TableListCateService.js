import { useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

const TableListCateService = ({ displayList }) => {
  const tableRef = useRef(null);
  const navigate = useNavigate();

  const handleDelete = (cateId) => {
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
            `https://localhost:7280/api/category-service/delete/${cateId}/`,
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
            // Swal.fire(
            //   "Deleted!",
            //   "The category service has been deleted.",
            //   "success"
            // );
            toast.success("The category service has been deleted")
          }
        } catch (err) {
          // console.error("Error fetching account censor:", err.message || err);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const handleRestore = (cateId) => {
    Swal.fire({
      title: "Restore this category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, restore it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("accessToken");

          const res = await fetch(
            `https://localhost:7280/api/category-service/restore/${cateId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await res.json();
          if (data.success === true) {
            Swal.fire(
              "Restored!",
              "The category has been restored.",
              "success"
            );
          }
        } catch (err) {
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  useEffect(() => {
    let dtInstance; //Khai báo ở đây
    const timeout = setTimeout(() => {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().clear().destroy();
      }
      $(tableRef.current).DataTable({
        data: displayList,
        columns: [
          { data: null, title: "ID" },
          {
            title: "Category Name",
            render: (data, type, row) =>
              row.categoryService?.categoryName || "No content",
          },
          {
            title: "Description",
            render: (data, type, row) =>
              row.categoryService?.categoryDescription || "Unknown",
          },
          {
            title: "Status",
            render: (data, type, row) =>
              row.categoryService?.isDeleted ? "Deleted" : "Not deleted",
          },
          {
            title: "Created At",
            render: (data, type, row) =>
              row.categoryService?.createAt
                ? new Date(row.categoryService.createAt).toLocaleDateString(
                    "vi-VN"
                  )
                : "N/A",
          },
          {
            title: "Action",
            render: (data, type, row) => {
              const id = row.categoryService?.categoryServiceId;
              const isDeleted = row.categoryService?.isDeleted;

              if (!id) return "";

              if (isDeleted) {
                // Đã bị xóa: hiện View + Restore
                return `
                  <button class='btn-restore hover:underline text-yellow-500' data-id='${id}'>
                    <i class="fa-solid fa-rotate-left"></i>
                  </button>
                `;
              } else {
                // Chưa xóa: hiện Detail + Edit + Delete
                return `
                  <button class='btn-detail hover:underline pr-2 text-blue-400' data-id='${id}'>
                    <i class="fa fa-eye" aria-hidden="true"></i>
                  </button>
                  <button class='btn-edit hover:underline pr-1 text-green-500' data-id='${id}'>
                    <i class="fa-solid fa-pencil"></i>
                  </button>
                  <button class='btn-delete hover:underline text-red-400' data-id='${id}'>
                    <i class="fa-solid fa-trash"></i>
                  </button>
                `;
              }
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

        navigate(`/CateService/Detail/${accId}`);
      });
      // Gắn click cho nút edit
      $(tableRef.current).on("click", ".btn-edit", function () {
        const accId = $(this).data("id");

        navigate(`/CateService/Edit/${accId}`);
      });

      // Gắn click cho nút Delete
      $(tableRef.current).on("click", ".btn-delete", function () {
        const cateId = $(this).data("id");
        handleDelete(cateId);
      });
      // Gắn click cho nút restore
      $(tableRef.current).on("click", ".btn-restore", function () {
        const cateId = $(this).data("id");
        handleRestore(cateId);
      });
    }, 100);
    // Cleanup
    return () => {
      $(tableRef.current).off("click", ".btn-detail");
      $(tableRef.current).off("click", ".btn-edit");
      $(tableRef.current).off("click", ".btn-delete");
    };
    if (dtInstance) {
      dtInstance.destroy(true); // Dọn sạch DataTables DOM
    }
  }, [displayList, navigate]);

  return <table id="table" ref={tableRef} className="display w-full"></table>;
};

export default TableListCateService;
