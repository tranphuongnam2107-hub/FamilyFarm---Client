import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const FriendActionButton = ({ status, roleId, accId }) => {
  const [roleIdOfUser, setRoleId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(status);

  // Đồng bộ currentStatus với prop status khi prop thay đổi
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      setRoleId(decoded.RoleId);
    }
  }, []);

  const handleAddFriend = async () => {
    try {
      const response = await instance.post(
        "/api/friend/send-friend-request",
        { receiverId: accId }
      );
      if (response.status === 200) {
        setCurrentStatus("Pending");
        toast.success("You sent the request successfully!");
      }
    } catch (error) {
      console.error("Add friend failed", error);
      toast.error("Failed to send request.");
    }
  };

  const handleCancelOrUnfriend = async () => {
    try {
      const response = await instance.delete(`/api/friend/unfriend/${accId}`);
      if (response.status === 200 && response.data === true) {
        setCurrentStatus(null);
        toast.success("Action completed successfully!");
      } else {
        toast.error("Failed to process the action.");
      }
    } catch (error) {
      console.error("Error during action:", error);
      toast.error("An error occurred while processing the action.");
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
    Pending: {
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
    Following: {
      text: "Unfollow",
      icon: "fa-user-minus",
      bgColor: "bg-red-600",
      hoverColor: "hover:bg-red-700",
    },
  };

  const config = buttonConfig[currentStatus] || buttonConfig.null;

  return (
    <button
      onClick={
        currentStatus === "Friend" ||
        currentStatus === "Following" ||
        currentStatus === "Pending"
          ? handleCancelOrUnfriend
          : handleAddFriend
      }
      className={`p-1 ${config.bgColor} ${config.hoverColor} text-white text-sm font-bold rounded-md w-28 transition`}
    >
      <i className={`fa-solid ${config.icon} mr-2`}></i>
      {config.text}
    </button>
  );
};

export default FriendActionButton;