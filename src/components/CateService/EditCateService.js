import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
const EditCateService = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [cateService, setCateService] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch category details
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
        const service = data.data[0].categoryService;
        setCateService(service); // chỉ set object, không set input ở đây
      }
    } catch (err) {
      console.error("Error fetching category service:", err.message || err);
      toast.error("HAS SOME ERROR WHEN EDIT CATEGORY!");
    }
  };

  const backList = () => {
    navigate("/CateService");
  };

  // Khi cateService đã có dữ liệu, đổ vào input
  useEffect(() => {
    if (cateService) {
      setCategoryName(cateService.categoryName || "");
      setCategoryDescription(cateService.categoryDescription || "");
    }
  }, [cateService]);

  useEffect(() => {
    handleDetail();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    let valid = true;
    const newErrors = { name: "", description: "" };

    if (!categoryName.trim()) {
      newErrors.name = "Category short name is required.";
      valid = false;
    }

    if (!categoryDescription.trim()) {
      newErrors.description = "Description is required.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    const payload = {
      categoryServiceId: id,
      accId: cateService?.accId || "",
      categoryName,
      categoryDescription,
      createAt: cateService?.createAt || new Date().toISOString(),
      updateAt: new Date().toISOString(),
      isDeleted: false,
    };

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `https://localhost:7280/api/category-service/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json(); // ✅ sửa dòng này

      if (data.success === true) {
        setMessage("✅ Category updated successfully.");
        setErrors({ name: "", description: "" });
        toast.success("EDIT CATEGORY SUCCESSFULLY!");
        navigate(`/CateService`);
      } else {
        setMessage(`❌ Error: ${data.message || "Something went wrong."}`);
      }
    } catch (error) {
      console.error("API error:", error);
      setMessage("❌ Failed to connect to the server.");
    }
  };

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
          Edit Category Service
        </h2>

        {cateService ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input: Category Name */}
            <div>
              <label className="block font-medium text-left mb-2">
                Category short name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className={`w-full border rounded px-4 py-4 mt-1 focus:outline-blue-400 ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 text-left">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Input: Description */}
            <div>
              <label className="block font-medium text-left mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className={`w-full border rounded px-4 py-4 mt-1 focus:outline-blue-400 ${
                  errors.description ? "border-red-500" : ""
                }`}
                rows={3}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 text-left">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                className="text-red-500 font-semibold"
                onClick={backList}
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-blue-400 text-white px-14 py-2 rounded hover:bg-blue-500"
              >
                Update
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="mt-4 text-left font-medium text-sm text-blue-600">
                {message}
              </div>
            )}
          </form>
        ) : (
          <p className="text-gray-400">🔄 Loading category data...</p>
        )}
      </div>
    </main>
  );
};

export default EditCateService;
