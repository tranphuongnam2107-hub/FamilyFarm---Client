import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UpdatePostCate = () => {
  const { id } = useParams(); // lấy categoryId từ URL
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch dữ liệu từ BE
  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `https://localhost:7280/api/category-post/get-by-id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategory(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy category:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        "https://localhost:7280/api/category-post/update",
        {
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          categoryDescription: category.categoryDescription,
          updateAt: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Update category post successfully!") 
      navigate("/PostCatePage");
    } catch (err) {
      console.error("Cập nhật thất bại:", err);
      toast.error("Update failed!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  if (!category)
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No category found.</p>
      </div>
    );

  return (
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
          <Link to="/Dashboard">HOME</Link> / Category Post / Edit Category
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        EDIT CATEGORY
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="space-y-4 w-full bg-white p-6 rounded-xl shadow"
      >
        <div>
          <label className="block font-semibold mb-2 text-left text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            value={category.categoryName}
            onChange={(e) =>
              setCategory({ ...category, categoryName: e.target.value })
            }
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-left text-gray-700">
            Description
          </label>
          <textarea
            value={category.categoryDescription}
            onChange={(e) =>
              setCategory({ ...category, categoryDescription: e.target.value })
            }
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div className="flex gap-4 justify-start">
          <button
            onClick={() => navigate("/PostCatePage")}
            type="button"
            className="font-semibold text-red-500 border px-10 py-2 rounded hover:underline"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-10 py-2 rounded hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePostCate;