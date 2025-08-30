import React, { useState, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import { useNavigate } from "react-router-dom";
const RequestGroupCard = ({
  request,
  userRole,
  setListRequestToJoin,
}) => {
  const navigate = useNavigate();
  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`)
  }
  const handleRespond = async (status) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const response = await fetch(
        `https://localhost:7280/api/group-member/response-to-join-group/${request.groupMemberId}?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to respond to join request");
      }

      const result = await response.json();
      toast.success("RESPONSE TO REQUEST SUCCESSFULLY!");

      //  Loại bỏ phần tử vừa xử lý khỏi danh sách hiện tại
      setListRequestToJoin((prevList) =>
        prevList.filter((item) => item.groupMemberId !== request.groupMemberId)
      );
    } catch (error) {
      console.error(error);
      toast.error("FAIL TO RESPONSE TO REQUEST!");
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded flex justify-between items-center mb-3">
      <div className="flex items-center gap-3">
        <img  onClick={() => handleClickToProfile(request.accId)} style={{ cursor: "pointer" }}
          src={
            request.accountAvatar ||
            "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
          }
          className="w-10 h-10 rounded-full"
          alt="Member"
        />
        <div>
          <p className="font-bold text-left">{request.accountFullName}</p>
          <p className="text-xs text-gray-500">
            Joined:{new Date(request.jointAt).toLocaleDateString("vi-VN")}{" "}
            &nbsp;&nbsp;{" "}
          </p>
          <p className="text-xs text-left  text-gray-500">{request.city}</p>
        </div>
      </div>
      {userRole === "680ce8722b3eec497a30201e" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRespond("Accept")}
            className="bg-blue-100 text-blue-500 px-4 py-2 text-sm rounded hover:bg-blue-300"
          >
            Accept
          </button>
          <button
            onClick={() => handleRespond("Reject")}
            className="bg-red-100 text-red-500 px-4 py-2 text-sm rounded hover:bg-red-300"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestGroupCard;
