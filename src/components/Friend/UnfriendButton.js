import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const UnfriendButton = ({ status, roleId, accId, onLoadList }) => {
  const [roleIdOfUser, setRoleId] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);

      // Lấy RoleId
      const roleIdFromToken = decoded.RoleId;
      console.log("RoleId:", roleIdFromToken);

      // Cập nhật state roleId
      setRoleId(roleIdFromToken);

      // Hoặc lấy role string
      const roleString =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      console.log("Role string:", roleString);
    } else {
      console.log("No token found");
    }
  }, []);

  const handleAddFriend = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "https://localhost:7280/api/friend/send-friend-request",
        { receiverId: accId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        // Gọi callback để reload danh sách
        if (onLoadList) onLoadList();
        toast.success("You sent the request successfully!");
      }
    } catch (error) {
      console.error("Add friend failed", error);
      toast.error("Failed to send request.");
    }
  };

  const buttonConfig = {
    null: {
      text: "Add friend",
      icon: "fa-user-plus",
      bgColor: "bg-[#3DB3FB]",
      hoverColor: "hover:bg-blue-700",
    },
    "": {
      text: "Add friend",
      icon: "fa-user-plus",
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
    },
    pending: {
      text: "Cancel",
      icon: "fa-ban",
      bgColor: "bg-orange-600",
      hoverColor: "hover:bg-orange-700",
    },
    Friend: {
      text: "Unfriend",
      icon: "fa-user-minus",
      bgColor: "bg-red-600",
      hoverColor: "hover:bg-red-700",
    },
    following: {
      text: "Unfollow",
      icon: "fa-user-minus",
      bgColor: "bg-red-600",
      hoverColor: "hover:bg-red-700",
    },
    expert: {
      text: "Follow",
      icon: "fa-user-plus",
      bgColor: "bg-[#3DB3FB]",
      hoverColor: "hover:bg-blue-700",
    },
  };

  // Select config based on status and roleId
  // const config =
  //   status === null && roleId === "expert"
  //     ? buttonConfig.expert
  //     : buttonConfig[status] || buttonConfig.null;

  let config;

  if (status === null) {
    if (roleId === roleIdOfUser) {
      // Cùng role → Add friend
      config = buttonConfig.null;
    } else {
      // Khác role → Follow
      config = buttonConfig.expert;
    }
  } else {
    config = buttonConfig[status] || buttonConfig.null;
  }

  return (
    <button
      onClick={handleAddFriend}
      className={`p-1 ${config.bgColor} ${config.hoverColor} text-white text-sm font-bold rounded-md w-28 transition`}
    >
      <i className={`fa-solid ${config.icon} mr-2`}></i>
      {config.text}
    </button>
  );
};

export default UnfriendButton;
