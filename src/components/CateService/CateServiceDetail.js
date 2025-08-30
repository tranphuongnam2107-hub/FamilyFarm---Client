import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
const CateServiceDetail = () => {
  const [cateService, setCateService] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleDetail = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://localhost:7280/api/category-service/get-by-id/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.success === true && data.data.length > 0) {
        setCateService(data.data[0].categoryService);
      }
    } catch (err) {
      console.error("Error fetching category service:", err.message || err);
    }
  };
  const backList = () => {
    navigate("/CateService");
  };

  useEffect(() => {
    handleDetail();
  }, [id]);

  return (
    <main className="flex-1 bg-blue-50 p-10 min-h-screen">
      <div className="flex">
        <div className="font-semibold flex items-center gap-2 py-3 text-sm text-[rgba(62,63,94,0.25)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z"
              fill="rgba(62,63,94,0.25)"
            />
          </svg>
          <Link to={"/Dashboard"}>HOME</Link>
        </div>
        <span className="font-semibold flex items-center gap-2 py-3 text-sm text-[rgba(62,63,94,0.25)]">
          <Link to="/CateService">/Category service</Link>
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-400 mb-6 text-left">
        CATEGORY SERVICE
      </h1>
      <div className="bg-white rounded-xl shadow p-6 max-w">
        <h2 className="text-red-600 font-semibold mb-8 text-left">
          Detail Category Service
        </h2>

        {cateService ? (
          <form className="space-y-6">
            <div>
              <label className="block font-medium text-left mb-2">
                Category short name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cateService.categoryName}
                readOnly
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium text-left mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cateService.categoryDescription}
                readOnly
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                className="text-red-500 font-semibold"
                onClick={() => backList()}
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-400">Loading category service...</p>
        )}
      </div>
    </main>
  );
};

export default CateServiceDetail;
