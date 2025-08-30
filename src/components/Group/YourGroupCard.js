import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, Bounce } from "react-toastify";
import Swal from "sweetalert2";

const YourGroupCard = ({ group, member }) => {
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
    <div className="group w-60 md:w-[267px] h-72 md:h-[24rem] shadow-md relative rounded-md overflow-hidden">
      <img
        alt="background"
        src={group.groupBackground?.trim() ? group.groupBackground : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-background-default.jpg?alt=media&token=00da8dac-2787-41bc-8477-6bff1b468612"}
        className="h-[50%] md:h-[58%] object-cover hover:absolute hover:inset-0 w-full hover:h-full hover:object-cover hover:z-0 transition-transform duration-1000 ease-in-out hover:scale-125 hover:opacity-20"
      />

      <div>
        <div className="absolute top-[43%] md:top-[50%] left-4 z-10">
          <img
            className="rounded-full w-10 h-10 md:w-[60px] md:h-[60px] object-fill "
            src={
              group.groupAvatar?.trim()
                ? group.groupAvatar
                : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-avatar-default-final.jpg?alt=media&token=633213e3-9495-42f8-b220-185b27d5fec9"
            }
            alt="avatar"
          />
        </div>
        {leaveGroups.includes(group.groupId) ? (
          <div>
            <div className="absolute top-[43%] md:top-[50%] left-4 z-10">
              <img
                className="rounded-full w-10 h-10 md:w-[60px] md:h-[60px] object-fill "
                src={
                  group.groupAvatar || "https://gameroom.ee/83571/minecraft.jpg"
                }
                alt="avatar"
              />
            </div>
            <div className="absolute top-[53%] md:top-[57%] right-1 z-10">
              <p className="text-xs font-semibold text-[#5596E6] items-end pt-1 pr-3">
                Members: {member}
              </p>
            </div>
            <div className="absolute z-10 md:top-[58%] top-[48%]">
              <p className="font-bold text-sm md:text-base text-[#393A4F] text-left pl-5 pt-9 truncate max-w-[250px]">
                {group.groupName}
              </p>
            </div>
            <div className="mt-7 items-center pt-5 absolute z-10 md:top-[65%] top-[48%] right-14 left-14">
              <button
                disabled
                className="p-2 md:p-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
              >
                <i className="fa-solid fa-circle-check px-2"></i>Leaved
              </button>
            </div>
          </div>
        ) : (
          <div>
            {userAccId === group.ownerId ? (
              <div>
                <div className="absolute top-[43%] md:top-[50%] left-4 z-10">
                  <img
                    className="rounded-full w-10 h-10 md:w-[60px] md:h-[60px] object-fill "
                    src={
                      group.groupAvatar ||
                      "https://gameroom.ee/83571/minecraft.jpg"
                    }
                    alt="avatar"
                  />
                </div>
                <div className="absolute top-[53%] md:top-[57%] right-1 z-10">
                  <p className="text-xs font-semibold text-[#5596E6] items-end pt-1 pr-3">
                    Members: {member}
                  </p>
                </div>
                <div className="absolute z-10 md:top-[58%] top-[48%]">
                  <p className="font-bold text-sm md:text-base text-[#393A4F] text-left pl-5 pt-9 truncate max-w-[250px]">
                    {group.groupName}
                  </p>
                </div>
                <div className="mt-7 items-center pt-5 absolute z-10 md:top-[65%] top-[48%] right-14 left-14">
                  <button
                    onClick={handleViewGroup}
                    className="hover:bg-[rgba(61,179,251,0.14)] p-2 md:p-3 text-[#5596E6] rounded-lg"
                  >
                    <i className="fa-solid fa-eye px-2"></i>View Group
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute z-10 md:top-[57%] top-[48%]">
                <p className="text-xs font-semibold text-[#5596E6] flex justify-end pt-2 pr-3">
                  Members: {member}
                </p>
                <p className="font-bold text-sm md:text-base text-[#393A4F] text-left pl-3 pt-3">
                  {group.groupName}
                </p>
                <div className="mt-7 flex gap-2 justify-center ml-2">
                  <button
                    onClick={() => handleLeaveGroup(group.groupId)}
                    className="hover:bg-[rgba(61,179,251,0.14)] p-2 md:p-3 text-[#E74C3C] rounded-lg"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket px-2"></i>
                    Leave
                  </button>
                  <button
                    onClick={handleViewGroup}
                    className="hover:bg-[rgba(61,179,251,0.14)] p-2 md:p-3 text-[#5596E6] rounded-lg"
                  >
                    <i className="fa-solid fa-eye px-2"></i>View Group
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourGroupCard;
