import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import instance from "../../Axios/axiosConfig";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";

const ProfileAvatar = ({ initialProfileImage, fullName, isOwner }) => {
  // Bỏ avatarImage
  const { user, updateUser } = useUser();
  const [profileImage, setProfileImage] = useState(
    isOwner ? (user?.avatar || initialProfileImage) : initialProfileImage
  );
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const profileInputRef = useRef(null);

  useEffect(() => {
    // Chỉ sync từ UserContext khi là owner
    if (isOwner) {
      setProfileImage(user?.avatar || initialProfileImage);
    } else {
      setProfileImage(initialProfileImage);
    }
  }, [user?.avatar, initialProfileImage, isOwner]);

  const handleCropSave = async () => {
    try {
      const { blobUrl, file } = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels
      );
      setProfileImage(blobUrl);

      const formData = new FormData();
      formData.append("NewAvatar", file);

      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      const response = await instance.put(
        "/api/account/change-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const newAvatar = response.data.data;
        setProfileImage(newAvatar);
        updateUser({ avatar: newAvatar }); // Cập nhật context
        setShowCropper(false);
        toast.success(response.data.message);
      }
    } catch (e) {
      console.error("Error updating avatar:", e);
      toast.error(
        `Failed to update avatar: ${e.message || "Please try again."}`
      );
      setProfileImage(user?.avatar || initialProfileImage);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setShowCropper(true);
      setShowProfilePopup(false);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        resolve({ blobUrl: URL.createObjectURL(blob), file });
      }, "image/jpeg");
    });
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
  };

  return (
    <div className="relative mb-10">
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
        <div className="relative">
          <img
            src={
              profileImage || // Sử dụng profileImage thay vì avatarImage
              "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png"
            }
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-white cursor-pointer"
            onClick={() => setShowProfilePopup(true)}
          />
          {isOwner === true && (
            <button
              onClick={() => profileInputRef.current.click()}
              className="absolute top-20 right-0 text-[18px] text-white bg-black rounded-full p-1"
            >
              <i className="fa-solid fa-camera"></i>
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            ref={profileInputRef}
            onChange={handleProfileImageChange}
            className="hidden"
          />
        </div>
        <h1 className="mt-2 text-3xl font-bold text-center">{fullName}</h1>
      </div>

      {showCropper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-[500px] max-w-[90%]">
            <h2 className="text-lg font-bold mb-4">Change avatar</h2>
            <div className="relative w-full h-64">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="block mb-2">Zoom:</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfilePopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowProfilePopup(false)}
        >
          <div
            className="bg-white p-4 rounded-lg flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[400px] h-[400px]">
              <img
                src={
                  profileImage ||
                  "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png"
                }
                alt="Avatar"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            {isOwner === true && (
              <button
                onClick={() => profileInputRef.current.click()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Change Avatar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
