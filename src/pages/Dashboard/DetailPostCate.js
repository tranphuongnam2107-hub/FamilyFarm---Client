import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";

const DetailPostCate = () => {
  const { id } = useParams(); // lấy categoryId từ URL
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `https://localhost:7280/api/category-post/get-by-id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setCategory(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  if (!category)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Không tìm thấy danh mục.</p>
      </div>
    );

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
              <Link to="/Dashboard">HOME</Link> / Category Post / Post Category
              Detail
            </span>
          </div>
          <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
            POST CATEGORY DETAIL
          </h1>
          <div className="bg-white rounded-xl shadow p-6 w-full">
            <div className="space-y-4 text-left">
              <div className="flex items-center border-b border-gray-200 py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Category ID
                </span>
                <span>{category.categoryId}</span>
              </div>
              <div className="flex items-center border-b border-gray-200 py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Account ID
                </span>
                <span>{category.accId}</span>
              </div>
              <div className="flex items-center border-b border-gray-200 py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Category Name
                </span>
                <span>{category.categoryName}</span>
              </div>
              <div className="flex items-center border-b border-gray-200 py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Description
                </span>
                <span>{category.categoryDescription}</span>
              </div>
              <div className="flex items-center border-b border-gray-200 py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Created At
                </span>
                <span>{new Date(category.createAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center border-b border-gray-200 py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Updated At
                </span>
                <span>
                  {category.updateAt
                    ? new Date(category.updateAt).toLocaleString()
                    : "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center py-2">
                <span className="w-[180px] font-semibold text-gray-700">
                  Is Deleted
                </span>
                <span>{category.isDeleted ? "✅ Yes" : "❌ No"}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-start">
              <button
                onClick={() => navigate("/PostCatePage")}
                type="button"
                className="font-semibold text-red-500 px-10 py-2 rounded border hover:underline"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPostCate;