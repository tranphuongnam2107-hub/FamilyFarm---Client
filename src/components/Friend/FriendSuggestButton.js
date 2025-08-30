import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const FriendSuggestButton = ({ status, roleId, accId }) => {
    const [roleIdOfUser, setRoleId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
  
    useEffect(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        setRoleId(decoded.RoleId);
      }
    }, []);
  
    const handleAddFriend = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await instance.post(
          "https://localhost:7280/api/friend/send-friend-request",
          { receiverId: accId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          setIsCompleted(true);
          toast.success("You sent the request successfully!");
        }
      } catch (error) {
        console.error("Add friend failed", error);
        toast.error("Failed to send request.");
      }
    };
  
    const handleUnfriend = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await instance.delete(
          `https://localhost:7280/api/friend/unfriend/${accId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (response.status === 200 && response.data === true) {
          setIsCompleted(true);
          toast.success("Action completed successfully!");
        } else {
          toast.error("Failed to process the action.");
        }
      } catch (error) {
        console.error("Error during unfriend:", error);
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
      Following: {
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
      completed: {
        text: "Completed",
        icon: "fa-check",
        bgColor: "bg-gray-400",
        hoverColor: "",
      },
    };
  
    // Chọn config phù hợp
    let config;
  
    if (isCompleted) {
      config = buttonConfig.completed;
    } else if (status === null) {
      config = roleId === roleIdOfUser ? buttonConfig.null : buttonConfig.expert;
    } else {
      config = buttonConfig[status] || buttonConfig.null;
    }
  
    return (
      <button
        onClick={
          isCompleted
            ? undefined
            : status === "Friend" || status === "Following"
            ? handleUnfriend
            : handleAddFriend
        }
        disabled={isCompleted}
        className={`p-1 ${config.bgColor} ${
          config.hoverColor
        } text-white text-sm font-bold rounded-md w-28 transition ${
          isCompleted ? "cursor-not-allowed" : ""
        }`}
      >
        <i className={`fa-solid ${config.icon} mr-2`}></i>
        {config.text}
      </button>
    );
  };

export default FriendSuggestButton;
