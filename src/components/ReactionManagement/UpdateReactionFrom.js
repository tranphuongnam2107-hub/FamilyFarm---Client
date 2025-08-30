import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const UpdateReactionFrom = () => {
    const [reactionName, setReactionName] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();

    const fetchReaction = async () => {
        try {
            const response = await instance.get(`/api/category-reaction/get-by-id/${id}`);
            console.log("API Response:", response.data); // Debug log
            if (response.data.isSuccess && response.data.data) {
                const reaction = response.data.data;
                setReactionName(reaction.reactionName || "");
                setImagePreview(reaction.iconUrl || "");
            } else {
                toast.error(`${response.data.message || "No reaction found."}`);
            }
        } catch (err) {
            console.error("Error while retrieving data:", err);
            toast.error("Error while retrieving reaction data.");
        }
    };

    useEffect(() => {
        fetchReaction();
    }, [id]);

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
            setMessage("Please fill in reaction name.");
            return;
        }

        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (!token) {
            setMessage("You are not logged in.");
            return;
        }

        const formData = new FormData();
        formData.append("ReactionName", reactionName);

        const fileInput = document.getElementById("iconFile");
        const file = fileInput?.files[0];
        if (file) {
            formData.append("IconUrl", file);
        }

        try {
            const response = await instance.put(
                `/api/category-reaction/update/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.isSuccess) {
                toast.success("Update reaction successfully!");
                navigate("/ReactionManagement");
            }
            else {
                setMessage(`${response.data.message || "Update reaction failed."}`);
            }
        } catch (err) {
            console.error("Error while updating:", err);
            toast.error("❌ Error while updating reaction.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 max-w">
            <h2 className="text-red-600 font-semibold mb-8 text-left">
                Update Reaction
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
                        Reaction Image
                    </label>
                    <input
                        id="iconFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full border rounded px-4 py-4 mt-1 focus:outline-blue-400"
                    />
                    {imagePreview && (
                        <div className="mt-4">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-24 rounded"
                                onError={() => setMessage("⚠️ Không thể tải hình ảnh.")}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-start space-x-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="text-red-500 font-semibold border px-10 py-2 rounded"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-400 text-white px-10 py-2 font-semibold rounded hover:bg-blue-500"
                    >
                        Update
                    </button>
                </div>

                {message && (
                    <div className="mt-4 text-left font-medium text-sm text-blue-600">
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default UpdateReactionFrom;