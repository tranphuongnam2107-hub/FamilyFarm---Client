import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import instance from "../../Axios/axiosConfig";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";

const CoverBackground = ({ backgroundImage: initialBackgroundImage, isOwner }) => {
  const { user, updateUser } = useUser();
  const [backgroundImage, setBackgroundImage] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [showCoverPopup, setShowCoverPopup] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const coverInputRef = useRef(null);

  const defaultBackground = "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fdefault_background.jpg?alt=media&token=0b68b316-68d0-47b4-9ba5-f64b9dd1ea2c";

  // Cập nhật backgroundImage khi initialBackgroundImage hoặc user.background thay đổi
  useEffect(() => {
    // console.log("Background props:", { initialBackgroundImage, userBackground: user?.background, isOwner });

    if (isOwner) {
      // Cho owner: ưu tiên user.background từ context, sau đó mới đến initialBackgroundImage
      setBackgroundImage(
        user?.background || 
        initialBackgroundImage ||
        defaultBackground
      );
    } else {
      // Cho người khác: chỉ dùng initialBackgroundImage
      setBackgroundImage(
        initialBackgroundImage ||
        defaultBackground
      );
    }
  }, [initialBackgroundImage, user?.background, isOwner]);

  // Xử lý khi chọn ảnh mới
  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setShowCropper(true);
      setShowCoverPopup(false);
    }
  };

  // Xử lý lưu ảnh đã crop
  const handleCropSave = async () => {
    try {
      const { blobUrl, file } = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Hiển thị ảnh preview ngay lập tức
      setBackgroundImage(blobUrl);

      const formData = new FormData();
      formData.append("NewBackground", file);

      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      const response = await instance.put(
        "/api/account/change-background",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const newBackground = response.data.data;
        setBackgroundImage(newBackground);
        updateUser({ background: newBackground }); // Cập nhật UserContext
        setShowCropper(false);
        toast.success(response.data.message);
        
        // Clean up blob URL
        URL.revokeObjectURL(blobUrl);
      } else {
        throw new Error(response.data.message || "Failed to update background");
      }
    } catch (e) {
      console.error("Error updating background:", e);
      toast.error(`Failed to update background: ${e.message || "Please try again."}`);
      
      // Rollback về background cũ
      if (isOwner) {
        setBackgroundImage(
          user?.background || 
          initialBackgroundImage ||
          defaultBackground
        );
      } else {
        setBackgroundImage(
          initialBackgroundImage ||
          defaultBackground
        );
      }
    }
  };

  // Xử lý hủy crop
  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
    
    // Clean up blob URL nếu có
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
  };

  // Callback khi crop hoàn tất
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Tạo ảnh từ URL
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  // Tạo ảnh đã crop
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
        const file = new File([blob], "background.jpg", { type: "image/jpeg" });
        resolve({ blobUrl: URL.createObjectURL(blob), file });
      }, "image/jpeg");
    });
  };

  return (
    <div className="relative h-[330px] bg-gray-200 group lg:mt-[120px] mt-[63px]">
      <img
        src={backgroundImage}
        alt="Background"
        className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:brightness-90 cursor-pointer"
        onClick={() => setShowCoverPopup(true)}
      />
      {isOwner && (
        <button
          onClick={() => coverInputRef.current.click()}
          className="absolute top-4 left-4 flex items-center bg-black/40 text-white px-3 py-1 rounded border border-white transition-all duration-300 ease-in-out opacity-90 group-hover:opacity-100"
        >
          <i className="fa-solid fa-camera text-[24px] h-6 text-white"></i>
          <span className="ml-2 hidden group-hover:inline transition-opacity duration-300">
            Change background
          </span>
        </button>
      )}
      <input
        type="file"
        accept="image/*"
        ref={coverInputRef}
        onChange={handleBackgroundImageChange}
        className="hidden"
      />
      {showCoverPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCoverPopup(false)}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-[90%] max-h-[90%] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-auto max-w-full max-h-[70vh]">
              <img
                src={backgroundImage}
                alt="Background"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {isOwner && (
              <button
                onClick={() => coverInputRef.current.click()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Change Background
              </button>
            )}
          </div>
        </div>
      )}
      {showCropper && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-[800px] max-w-[90%]">
            <h2 className="text-lg font-bold mb-4">Change Background</h2>
            <div className="relative w-full h-64">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 1} // Tỷ lệ phù hợp cho ảnh nền
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
    </div>
  );
};

export default CoverBackground;