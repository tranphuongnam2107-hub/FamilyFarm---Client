import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { handleFileSelect } from '../../utils/validateFile';
import { toast } from "react-toastify";

export default function PopupChangeImage({ onClose, onSave, group }) {
    const [avatarImage, setAvatarImage] = useState(null);
    const [bgImage, setBgImage] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [bgFile, setBgFile] = useState(null);
    const [errors, setErrors] = useState({ image: null });

    // const handleAvatarChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setAvatarFile(file);
    //         setAvatarImage(URL.createObjectURL(file));
    //     }
    // };

    // const handleBgChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setBgFile(file);
    //         setBgImage(URL.createObjectURL(file));
    //     }
    // };

    const handleAvatarChange = (e) => {
        handleFileSelect({
            event: e,
            setSelectedFile: (fileData) => {
                setAvatarFile(fileData.file); // Lưu lại file avatar đã chọn
                setAvatarImage(fileData.url); // Hiển thị preview của avatar
            },
        });
    };

    // Hàm thay đổi ảnh nền
    const handleBgChange = (e) => {
        handleFileSelect({
            event: e,
            setSelectedFile: (fileData) => {
                setBgFile(fileData.file); // Lưu lại file ảnh nền đã chọn
                setBgImage(fileData.url); // Hiển thị preview của ảnh nền
            },
        });
    };

    const validateImages = () => {
        if (!avatarImage && !avatarFile && !group?.groupAvatar) {
            setErrors((prev) => ({ ...prev, image: "Avatar image is required." }));
            return false;
        }

        if (!bgImage && !bgFile && !group?.groupBackground) {
            setErrors((prev) => ({ ...prev, image: "Background image is required." }));
            return false;
        }

        setErrors((prev) => ({ ...prev, image: null }));
        return true;
    };

    // const handleSave = () => {
    //     if (!validateImages()) return;

    //     onConfirm?.({ avatarFile, bgFile });
    // };

    const handleSave = async () => {
        console.log("Bấm nút Save change"); // Log để kiểm tra
        if (!validateImages()) return;

        const formData = new FormData();
        formData.append("GroupName", group.groupName);
        formData.append("PrivacyType", group.privacyType);
        if (avatarFile) formData.append("GroupAvatar", avatarFile);
        if (bgFile) formData.append("GroupBackground", bgFile);

        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        try {
            await instance.put(`/api/group/update/${group.groupId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                    // Đừng set Content-Type!
                },
            });
            // toast.success("Group image updated successfully!");
            console.log("Group image updated successfully!");
            toast.success("Group image updated successfully!");
            onClose();
            onSave?.();
            // onConfirm?.();  // Đóng popup hoặc reload
        } catch (error) {
            console.error("Update image failed:", error);
            // toast.error("Failed to update group image!");
        }
    };

    return (
        <div className="w-full fixed top-0 left-0 h-full bg-black bg-opacity-50 flex justify-center items-center z-[1100]">
            <div className="popup-change-image-container w-full max-w-[648px] mx-auto mt-8 p-4 bg-slate-200 rounded-md">
                {/* Header */}
                <div className="header-popup flex flex-row justify-between items-center">
                    <div className="change-image-title font-semibold font-roboto text-[18px]">
                        Change images group
                    </div>
                    <div
                        className="close-popup p-4 w-[24px] h-[24px] flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-300"
                        onClick={onClose}
                    >
                        <i className="fa-solid fa-xmark text-[18px]"></i>
                    </div>
                </div>

                {/* Body – GIỮ NGUYÊN THIẾT KẾ */}
                <div className="body-popup mt-4">
                    <div className="background-group-container">
                        <div className="background-group-field">
                            {/* Background image */}
                            <div className="background-image">
                                <p className="mb-2 text-start">Background image</p>

                                <input
                                    id="bg-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBgChange}
                                />

                                <label htmlFor="bg-upload" className="block cursor-pointer">
                                    <img
                                        className="px-3 object-cover rounded-[20px] w-full h-[296px]"
                                        src={bgImage || group?.groupBackground || "https://gameroom.ee/83571/minecraft.jpg"}
                                        alt="Background"
                                    />
                                </label>
                            </div>


                            {/* Avatar image */}
                            <div className="avatar-image mt-4">
                                <p className="mb-2 text-start">Avatar image</p>

                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />

                                <label htmlFor="avatar-upload" className="block w-fit cursor-pointer">
                                    <img
                                        className="mx-3 w-[180px] h-[180px] object-cover rounded-full"
                                        src={avatarImage || group?.groupAvatar || "https://ui-avatars.com/api/?name=Group"}
                                        alt="Avatar"
                                    />
                                </label>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Error */}
                {errors.image && (
                    <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                )}

                {/* Footer */}
                <div className="footer-popup mt-6 flex flex-row justify-end gap-2">
                    <button
                        className="cancel-btn bg-slate-500 text-white py-2 px-3 rounded hover:bg-slate-700"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="save-btn bg-sky-600 text-white py-2 px-3 rounded hover:bg-blue-500"
                        onClick={handleSave}
                    >
                        Save change
                    </button>
                </div>
            </div>
        </div>
    );
};