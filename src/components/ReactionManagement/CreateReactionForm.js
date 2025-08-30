import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const CreateReactionFrom = () => {
  const [reactionName, setReactionName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!reactionName) {
      setMessage("Please enter in reaction name.");
      return;
    }

    const fileInput = document.getElementById("iconFile");
    const file = fileInput?.files[0];
    // if (!file) {
    //   setMessage("Vui lòng chọn ảnh hợp lệ.");
    //   return;
    // }

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      setMessage("You are not logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("ReactionName", reactionName);
    formData.append("IconUrl", file);

    try {
      const response = await instance.post(
        "/api/category-reaction/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.isSuccess) {
        toast.success("Create reaction successfully!");
        setReactionName("");
        setImagePreview("");
        fileInput.value = ""; // Reset file input
          navigate("/ReactionManagement");
      } else {
        setMessage(`⚠️ ${response.data.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating reaction.");
    }
  };

  return (
    <main className="flex-1 min-h-screen">
      <div className="bg-white rounded-xl shadow p-6 max-w">
        <h2 className="text-red-600 font-semibold mb-8 text-left">
          Create new Category Reaction
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-left mb-4">
              Reaction Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reactionName}
              onChange={(e) => setReactionName(e.target.value)}
              className="w-full border rounded px-4 py-4 mt-1 focus:outline-blue-400"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-left mb-4">
              Reaction Image <span className="text-red-500">*</span>
            </label>
            <input
              id="iconFile"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border rounded px-4 py-4 mt-1 focus:outline-blue-400"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-24 rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-start space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-red-500 font-semibold px-10 py-2 rounded border"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-400 text-white px-10 py-2 rounded font-semibold hover:bg-blue-500"
            >
              Create
            </button>
          </div>

          {message && (
            <div className="mt-4 text-left font-medium text-sm text-blue-600">
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
};

export default CreateReactionFrom;