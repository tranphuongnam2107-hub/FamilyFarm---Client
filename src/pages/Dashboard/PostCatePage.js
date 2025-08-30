import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import { toast } from "react-toastify";

const TableListCatePost = ({ displayList, fetchAllPosts }) => {
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
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await fetch(
            `https://localhost:7280/api/category-post/delete/${cateId}`,
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
            toast.success("The category post has been deleted.");
            // ✅ Gọi lại API để cập nhật danh sách
            fetchAllPosts(); // Cập nhật lại list mà không reload
          }
        } catch (err) {
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
            `https://localhost:7280/api/category-post/restore/${cateId}`,
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
            window.location.reload();
          }
        } catch (err) {
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  useEffect(() => {
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
            render: (data, type, row) => row.categoryName || "No content",
          },
          {
            title: "Description",
            render: (data, type, row) => row.categoryDescription || "Unknown",
          },
          {
            title: "Status",
            render: (data, type, row) =>
              row.isDeleted ? "Deleted" : "Not deleted",
          },
          {
            title: "Created At",
            render: (data, type, row) =>
              row.createAt
                ? new Date(row.createAt).toLocaleDateString("vi-VN")
                : "N/A",
          },
          {
            title: "Action",
            render: (data, type, row) => {
              const id = row.categoryId;
              const isDeleted = row.isDeleted;

              if (!id) return "";

              if (isDeleted) {
                return `
                  <button class='btn-restore hover:underline text-yellow-500' data-id='${id}'>
                    <i class="fa-solid fa-rotate-left"></i>
                  </button>
                `;
              } else {
                return `
                  <button class='btn-detail hover:underline pr-2 text-blue-400' data-id='${id}'>
                    <i class="fa-solid fa-eye"></i>
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
            targets: 2,
            width: "550px",
          },
          {
            targets: "_all",
            className: "text-left",
          },
        ],
        destroy: true,
        searching: true,
        ordering: false, // Vô hiệu hóa sắp xếp mặc định
      });

      $(tableRef.current).find("thead").addClass("bg-[rgba(61,179,251,0.25)]");

      $(tableRef.current).on("click", ".btn-detail", function () {
        const accId = $(this).data("id");
        navigate(`/DetailPostCate/${accId}`);
      });

      $(tableRef.current).on("click", ".btn-edit", function () {
        const accId = $(this).data("id");
        navigate(`/UpdatePostCate/${accId}`);
      });

      $(tableRef.current).on("click", ".btn-delete", function () {
        const cateId = $(this).data("id");
        handleDelete(cateId);
      });

      $(tableRef.current).on("click", ".btn-restore", function () {
        const cateId = $(this).data("id");
        handleRestore(cateId);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      $(tableRef.current).off("click", ".btn-detail");
      $(tableRef.current).off("click", ".btn-edit");
      $(tableRef.current).off("click", ".btn-delete");
      $(tableRef.current).off("click", ".btn-restore");
    };
  }, [displayList, navigate]);

  return <table id="table" ref={tableRef} className="display w-full"></table>;
};

const PostCatePage = () => {
  const [allList, setAllList] = useState([]);

  const fetchAllPosts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://localhost:7280/api/category-post/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setAllList(data.data);
      }
    } catch (err) {
      console.error("Error fetching all:", err);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        <div>
          <div className="text-left mb-5 font-semibold flex items-center gap-2 text-[#3E3F5E]/25">
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z"
                fill="rgba(62,63,94,0.25)"
              />
            </svg>
            <span>
              <Link to="/Dashboard">HOME</Link> / Category Post
            </span>
          </div>
          <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
            CATEGORY POST
          </h1>
          <div className="text-left mb-6">
            <Link to="/CreatePostCate">
              <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 text-sm">
                New Post Category
              </button>
            </Link>
          </div>
          <div>
            <TableListCatePost
              displayList={allList}
              fetchAllPosts={fetchAllPosts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCatePage;
