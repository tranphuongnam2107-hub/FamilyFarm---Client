import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";
import "./createGroupStyle.css";
import defaultAvatar from "../../assets/images/default-avatar.png";
import PopupDeleteGroup from "./PopupDeleteGroup";

export default function EditGroupForm({ userRole, userAccId }) {
  const navigate = useNavigate();

  // User Information
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const { groupId } = useParams();
  const [ownerId, setOwnerId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [privacyType, setPrivacyType] = useState("Public");
  const [avatarImage, setAvatarImage] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Khai bao xoa group
  const [deleteShowPopup, setDeleteShowPopup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Get user information
  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") || sessionStorage.getItem("username");
    const storedFullName =
      localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
    const storedAvatarUrl =
      localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");

    if (storedUsername) {
      setUsername(storedUsername);
      setFullName(storedFullName || storedUsername);
      setAvatarUrl(storedAvatarUrl || defaultAvatar);
    }
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await instance.get(`/api/group/get-by-id/${groupId}`);
        const group = res.data?.data?.[0]; // <-- LẤY ĐÚNG OBJECT
        if (!group) {
          console.log("Group not found.");
          return;
        }

        setOwnerId(group.ownerId || "");
        setGroupName(group.groupName || "");
        setPrivacyType(group.privacyType || "Public");
        setAvatarImage(group.groupAvatar || null);
        setBgImage(group.groupBackground || null);
      } catch (err) {
        toast.error("Failed to load group info.");
        console.error("Error loading group:", err);
      }
    };

    fetchGroup();
  }, [groupId]);

  const validate = () => {
    const newErrors = {};

    if (!groupName.trim()) newErrors.groupName = "Group name is required.";

    if (
      !privacyType ||
      !["Public", "Private"].includes(privacyType)
    ) {
      newErrors.privacyType = "Please select a valid privacy type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 👇 Chỉ xử lý khi groupName thay đổi
  useEffect(() => {
    if (groupName.trim()) {
      setErrors((prev) => ({ ...prev, groupName: "" }));
    }
  }, [groupName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormValid = validate();

    if (!isFormValid) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("GroupName", groupName);
    formData.append("PrivacyType", privacyType);
    if (avatarFile) formData.append("GroupAvatar", avatarFile);
    if (bgFile) formData.append("GroupBackground", bgFile);

    try {
      await instance.put(`/api/group/update/${groupId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("GROUP UPDATED SUCCESSFULLY!");
      // navigate("/Group", { state: { section: "all-group-user" } });
      navigate(`/GroupDetail/${groupId}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update group!");
    }
  };

  const handleDeleteClick = (groupId) => {
    setSelectedGroupId(groupId);
    setDeleteShowPopup(true);
  };

  const handleConfirmDeleteGroup = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await instance.delete(`/api/group/delete/${selectedGroupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("GROUP DELETED SUCCESSFULLY!");
      setDeleteShowPopup(false);
      setSelectedGroupId(null);

      // 👉 Sau khi xóa xong, điều hướng về trang danh sách nhóm
      navigate("/Group", { state: { section: "all-group-user" } });
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete group.");
    }
  };

  return (
    <div className="group-page-right w-full h-full flex flex-col pt-12 pr-4 pl-[8%] lg:pl-0">
      <div>
        <Link to={`/GroupDetail/${groupId}`} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 ease-in-out">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to your group</span>
        </Link>
      </div>
      <form
        onSubmit={handleSubmit}
        className="create-group-container w-full max-w-[832px] h-screen mt-3"
      >
        <div className="create-h1-label">
          <h1 className="create-group-h1">Edit group</h1>
        </div>

        <div className="user-admin-container mt-10 flex md:flex-row items-center gap-4">
          <div className="avatar-admin rounded-full w-[60px] h-[60px]">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="admin-info flex flex-col gap-2">
            <div className="admin-name">{fullName}</div>
            <div
              className="admin-role bg-[#3DB3FB] px-[14px] py-[7px] bg-opacity-25 w-fit rounded-sm font-semibold text-[#3DB3FB]"
            >
              {ownerId === userAccId ? "Owner" : "Administrator"}
            </div>
          </div>
        </div>

        <div className="group-name-container w-fit mt-4">
          <input
            className="group-name-text px-[46px] py-[15px] bg-[#3DB3FB] bg-opacity-25 rounded-sm text-black text-[24px] font-light placeholder:font-light placeholder:text-[24px] placeholder:text-[rgba(62,63,94,0.25)] font-roboto border-none focus:outline-none focus:ring-0 focus:border-none"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Type your group name"
          />
          {errors.groupName && (
            <p className="text-red-500 text-start text-sm mt-1">
              {errors.groupName}
            </p>
          )}
        </div>

        <div className="type-privacy-container flex flex-row gap-6 mt-[54px]">
          <div className="title-privacy h-10 flex flex-row items-center gap-2">
            <div className="icon-privacy">
              <i className="fa-solid fa-shield-halved text-[24px] text-[var(--variable-collection-black)] text-opacity-50"></i>
            </div>
            <div className="privacy-text">Select privacy</div>
          </div>
          <div className="select-privacy h-10">
            <select
              className="w-[190px] p-2 bg-[#3DB3FB] bg-opacity-25 text-[#3DB3FB] focus:outline-none focus:ring-0 focus:border-none cursor-pointer font-roboto"
              value={privacyType}
              onChange={(e) => setPrivacyType(e.target.value)}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>

        <div className="mt-14 flex flex-row gap-3">
          <button
            className="create-button lg:w-[220px] p-[10px] flex items-center justify-center gap-[10px] bg-[#3db3fb] rounded-sm hover:bg-[#50ace6] cursor-pointer"
            type="submit"
          >
            <div className="create-btn-text w-fit text-white">Save Changes</div>
          </button>

          {ownerId === userAccId && (
            <button
              className="create-button lg:w-[220px] p-[10px] flex items-center justify-center gap-[10px] bg-red-600 rounded-sm hover:bg-red-700 cursor-pointer"
              type="button"
              onClick={() => handleDeleteClick(groupId)}
            >
              <div className="create-btn-text w-fit text-white">Delete</div>
            </button>
          )}
        </div>
      </form>
      {deleteShowPopup && (
        <PopupDeleteGroup
          onClose={() => {
            setDeleteShowPopup(false);
            setSelectedGroupId(null)
          }}
          onConfirm={handleConfirmDeleteGroup}
        />
      )}
    </div>
  );
}
