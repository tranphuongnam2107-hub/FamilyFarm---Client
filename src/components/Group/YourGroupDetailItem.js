import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, Bounce } from "react-toastify";
import Swal from "sweetalert2";

const YourGroupDetailItem = ({ group }) => {
  const navigate = useNavigate();

  const handleViewGroup = () => {
    navigate(`/GroupDetail/${group.groupId}`);
  };
  const [leaveGroups, setLeaveGroups] = useState([]);
  const [userAccId, setUserAccId] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      setUserAccId(decoded.AccId);
    }
  }, []);

  const handleLeaveGroup = async (groupId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to leave this group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3DB3FB",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, leave group",
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(
          `https://localhost:7280/api/group-member/leave/${groupId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          toast.success("You left the group successfully!", {
            transition: Bounce,
          });
          setLeaveGroups((prev) => [...prev, groupId]);
          navigate("/Group", { replace: true });
        } else {
          toast.warning("You may have already left this group.");
        }
      } catch (error) {
        console.error("Leave group failed", error);
        toast.error("Failed to leave group.");
      }
    }
  };

  return (
    <div className="flex justify-between items-center text-left">
      <div className="flex items-center gap-2">
        <img
          src={
              group.groupAvatar?.trim()
                ? group.groupAvatar
                : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-avatar-default-final.jpg?alt=media&token=633213e3-9495-42f8-b220-185b27d5fec9"
            }
          alt={group.avatar}
          className="w-9 h-9 rounded-full"
        />
        <div className="flex flex-col gap-1 items-start">
          <span className="ml-2 truncate max-w-[100px]">{group.groupName}</span>
          {!leaveGroups.includes(group.groupId) && (
            <button
              onClick={handleViewGroup}
              className="hover:bg-[rgba(61,179,251,0.14)] p-1 text-[#5596E6] rounded-lg text-sm"
            >
              <i className="fa-solid fa-eye px-1"></i>View Group
            </button>
          )}
        </div>
      </div>
      {userAccId !== group.ownerId && (
        <div>
          {leaveGroups.includes(group.groupId) ? (
            <button
              disabled
              className="p-2 md:p-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
            >
              <i className="fa-solid fa-circle-check px-2"></i>Leaved
            </button>
          ) : (
            <button
              onClick={() => handleLeaveGroup(group.groupId)}
              className="hover:bg-[rgba(61,179,251,0.14)] p-1 text-[#E74C3C] rounded-lg text-sm"
            >
              <i className="fa-solid fa-arrow-right-from-bracket px-1"></i>Leave
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default YourGroupDetailItem;
