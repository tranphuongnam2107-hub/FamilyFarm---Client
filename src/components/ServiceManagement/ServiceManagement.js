import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProcessNav from "../ProcessNav/ProcessNav";
import Header from "../Header/Header";
import instance from "../../Axios/axiosConfig";
import Swal from "sweetalert2";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

export const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const [hasCreditCard, setHasCreditCard] = useState(null);
  const tableRef = useRef(null);

  // Fetch credit card info
  const fetchCreditCardInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      const res = await instance.get("/api/account/own-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setHasCreditCard(res.data.data.hasCreditCard);
      }
    } catch (error) {
      console.error("Error loading credit card info:", error);
      toast.error("Failed to load credit card information.");
    }
  };

  useEffect(() => {
    fetchCreditCardInfo();
  }, []);

  // Lọc service theo trạng thái
  const filteredServices = services.filter((service) => {
    if (filterStatus === "available") return service.status === 1;
    if (filterStatus === "unavailable") return service.status !== 1;
    return true;
  });

  // Fetch services and categories
  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        const serviceRes = await instance.get("/api/service/all-by-provider", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const serviceWrappers = serviceRes.data.data || [];
        const servicesOnly = serviceWrappers.map((item) => item.service);

        const servicesWithCategory = await Promise.all(
          servicesOnly.map(async (s) => {
            try {
              const res = await instance.get(`/api/category-service/get-by-id/${s.categoryServiceId}`);
              return {
                ...s,
                categoryName: res.data.data?.[0]?.categoryService?.categoryName || "Unknown",
              };
            } catch {
              return { ...s, categoryName: "Unknown" };
            }
          })
        );

        setServices(servicesWithCategory);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesAndCategories();
  }, []);

  // Initialize DataTable
  useEffect(() => {
    if (!loading && tableRef.current) {
      const table = $(tableRef.current).DataTable({
        data: filteredServices, // Sử dụng filteredServices để hiển thị dữ liệu
        columns: [
          { data: null, defaultContent: "" }, // Cột trống
          { data: "serviceName" },
          {
            data: "price",
            render: (data) => `${data.toLocaleString()} <span>VND</span>`,
            className: "text-end",
          },
          {
            data: "status",
            render: (data) =>
              `<span class="px-2 py-1 text-sm text-white rounded ${
                data === 1 ? "bg-green-500" : "bg-red-500"
              }">${data === 1 ? "Available" : "Unavailable"}</span>`,
          },
          { data: "categoryName" },
          {
            data: null,
            render: (data, type, row) => `
              <button class="text-sm text-red-500 delete-btn" data-id="${row.serviceId}">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
              <button class="text-sm text-blue-600 edit-btn" data-id="${row.serviceId}">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
              <button class="text-sm ${
                row.status === 1 ? "text-yellow-600 disable-btn" : "text-green-700 enable-btn"
              }" data-id="${row.serviceId}" data-have-process="${row.haveProcess}">
                <i class="fa-solid ${row.status === 1 ? "fa-ban" : "fa-rotate-right"}"></i> ${
              row.status === 1 ? "Disable" : "Enable"
            }
              </button>
              ${
                row.haveProcess
                  ? `<button class="text-sm text-purple-600 edit-process-btn" data-id="${row.serviceId}">
                      <i class="fa-solid fa-gear"></i> Edit process
                    </button>`
                  : `<button class="text-sm text-green-600 add-process-btn" data-id="${row.serviceId}">
                      <i class="fa-solid fa-plus"></i> Add process
                    </button>`
              }
            `,
          },
        ],
        ordering: true, // Bật sắp xếp
        pageLength: 10, // Số hàng mỗi trang
        responsive: true, // Hỗ trợ responsive
        destroy: true, // Cho phép hủy và khởi tạo lại DataTable
      });

      // Xử lý sự kiện click cho các nút
      $(tableRef.current).on("click", ".delete-btn", function () {
        const serviceId = $(this).data("id");
        handleDeleteClick(serviceId);
      });

      $(tableRef.current).on("click", ".edit-btn", function () {
        const serviceId = $(this).data("id");
        navigate(`/EditService/${serviceId}`);
      });

      $(tableRef.current).on("click", ".disable-btn, .enable-btn", function () {
        const serviceId = $(this).data("id");
        const haveProcess = $(this).data("have-process");
        const status = filteredServices.find((s) => s.serviceId === serviceId).status;
        handleToggleStatusClick(serviceId, status, haveProcess);
      });

      $(tableRef.current).on("click", ".edit-process-btn", function () {
        const serviceId = $(this).data("id");
        navigate(`/EditStepPage/${serviceId}`);
      });

      $(tableRef.current).on("click", ".add-process-btn", function () {
        const serviceId = $(this).data("id");
        navigate(`/CreateStepPage/${serviceId}`);
      });

      return () => {
        table.destroy(); // Hủy DataTable khi component unmount
      };
    }
  }, [loading, filteredServices]); // Thêm filteredServices vào dependency để cập nhật khi lọc thay đổi

  const handleCreateServiceClick = () => {
    if (hasCreditCard === false || hasCreditCard === null) {
      toast.warning("You need to add a credit card before creating a service.");
      return;
    }
    navigate("/CreateService");
  };

  const handleDeleteClick = async (serviceId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This service will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await instance.delete(`/api/service/delete/${serviceId}`);
          setServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
          toast.success("SERVICE DELETED SUCCESSFULLY!");
        } catch (error) {
          console.error(error);
          toast.error("Delete service failed.");
        }
      }
    });
  };

  const handleToggleStatusClick = async (serviceId, currentStatus, haveProcess) => {
    const isDisabling = currentStatus === 1;

    if (!haveProcess) {
      await Swal.fire({
        title: "Missing Process",
        text: "You need to add a process for this service before enabling it.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: isDisabling ? "Disable Service" : "Enable Service",
      text: `Are you sure you want to ${isDisabling ? "disable" : "enable"} this service?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isDisabling ? "Yes, Disable" : "Yes, Enable",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        const res = await instance.put(
          `/api/service/change-status/${serviceId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 200) {
          setServices((prev) =>
            prev.map((s) =>
              s.serviceId === serviceId ? { ...s, status: s.status === 1 ? 0 : 1 } : s
            )
          );
          toast.success("Status changed successfully!");
        } else {
          Swal.fire("Error", "Failed to update service status!", "error");
        }
      } catch (err) {
        console.error(err);
        toast.error("Change status failed.");
      }
    }
  };

  return (
    <div className="text-gray-800 bg-white">
      <Header />
      <div className="pt-16 mx-auto progress-management max-w-7xl">
        <ProcessNav inPage="Service" />
        <div className="flex items-center justify-between mt-6">
          <h2 className="text-xl font-semibold">Your Services</h2>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={handleCreateServiceClick}
          >
            + New Service
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 space-x-6">
          <div className="flex gap-4 lg:gap-8">
            <div
              className={`cursor-pointer ${
                filterStatus === "all"
                  ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400"
              }`}
              onClick={() => setFilterStatus("all")}
            >
              All
            </div>
            <div
              className={`cursor-pointer ${
                filterStatus === "available"
                  ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400"
              }`}
              onClick={() => setFilterStatus("available")}
            >
              Available
            </div>
            <div
              className={`cursor-pointer ${
                filterStatus === "unavailable"
                  ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400"
              }`}
              onClick={() => setFilterStatus("unavailable")}
            >
              Unavailable
            </div>
          </div>
        </div>
        <div className="relative mt-4 overflow-x-auto">
          <table
            ref={tableRef} // Thêm ref vào đây
            id="serviceTable"
            className="min-w-full mt-3 text-left border rounded-lg"
          >
            <thead className="bg-gray-100">
              <tr className="font-bold text-left text-gray-600">
                <th className="p-3"></th>
                <th className="p-3">Service name</th>
                <th className="hidden p-3 md:table-cell text-end">Price</th>
                <th className="hidden p-3 md:table-cell">Status</th>
                <th className="hidden p-3 md:table-cell">Category name</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">
                    Loading services...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">
                    No services found for this expert.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;