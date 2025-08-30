import React, { useState } from "react";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { useNavigate } from "react-router-dom";
import default_avatar from "../../assets/images/default-avatar.png";

const YourFriendCard = ({ friend, isListFollower, isOwner, isProfile }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(friend.friendStatus);
  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`);
  };
  const buttonConfig = {
    null: {
      text: "Add friend",
      icon: "fa-user-plus",
      bgColor: "bg-blue-600",
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

  const config = buttonConfig[friend.friendStatus] || buttonConfig.null;

  const handleClick = async () => {
    const token = localStorage.getItem("accessToken");
    const isExpert = friend.role === "68007b2a87b41211f0af1d57";

    try {
      if (!status || status === "") {
        // Gửi lời mời kết bạn
        const response = await axios.post(
          "https://localhost:7280/api/friend/send-friend-request",
          { receiverId: friend.accId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          // onActionComplete();
          setStatus(isExpert ? "Following" : "Pending");
          toast.success("You sent the request successfully!");
        } else {
          toast.error("Failed to send request.");
        }
      } else {
        // Huỷ kết bạn / Huỷ theo dõi / Huỷ lời mời
        const response = await axios.delete(
          `https://localhost:7280/api/friend/unfriend/${friend.accId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Kiểm tra response.data === true
        if (response.status === 200 && response.data === true) {
          //onActionComplete();
          setStatus(null); // Reset lại để hiển thị nút "Add Friend"
          toast.success("Action completed successfully!");
        } else {
          toast.error("Failed to process the action.");
        }
      }
    } catch (error) {
      console.error("Error during friend action:", error);
      toast.error("An error occurred while processing the action.");
    }
  };
  return (
    <div className="w-[224px] h-[207px] bg-white rounded-[10px] border shadow-[0_4px_6px_rgba(0,0,0,0.45)]">
      <div className="mt-3 h-6">
        {friend.mutualFriend > 0 && (
          <div className="mt-3 w-[75px] h-6 bg-blue-500 flex items-center justify-center rounded-e-xl">
            <p className="text-white font-bold" style={{ fontSize: "8px" }}>
              {friend.mutualFriend} mutual friends
            </p>
          </div>
        )}
      </div>

      <div className="items-center flex flex-col gap-1">
        <div className="rounded-[50px]">
          <img
            onClick={() => handleClickToProfile(friend.accId)}
            className="rounded-full w-[60px] h-[60px] object-fill"
            src={
              friend.avatar || default_avatar
            }
            alt="avatar"
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="flex items-center flex-col gap-1">
          <p className="text-base font-bold">{friend.fullName || "Unknown"}</p>
          <p className="text-base font-normal text-[#999999]">
            {friend.city || "From Can Tho"}
          </p>
        </div>
        <div>
          {(isOwner === true || isProfile !== true) && (
            <div>
              {isListFollower !== "follower" && (
                <button
                  onClick={handleClick}
                  className={`w-[120px] h-6 ${config.bgColor} ${config.hoverColor} rounded-[5px] font-normal mt-2 text-sm text-white p-1 flex items-center justify-center`}
                >
                  <i className={`fa-solid ${config.icon} mr-2`}></i>
                  {config.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourFriendCard;
