import React, { useState } from "react";
import adminImg from "../../assets/images/ri_admin-fill.svg";
import memberImg from "../../assets/images/subway_admin.svg";
import { toast, Bounce } from "react-toastify";
import { useNavigate } from "react-router-dom";
const MemberPermission = ({ member, userRole, userAccId, ownerId }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(null);
  const id = 1;
  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`)
  }
  const handleEditRole = async (newRoleId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const response = await fetch(
        `https://localhost:7280/api/group-member/update-role?groupMemberId=${member.groupMemberId}&newGroupRoleId=${newRoleId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

     
      toast.success("UPDATE ROLE SUCCESSFULLY!", { transition: Bounce });
      setIsOpen(null);
    } catch (error) {
      console.error(error);
      toast.error("FAILED TO UPDATE ROLE!", { transition: Bounce });
      setIsOpen(null);
    }
  };
  return (
    <div className="bg-gray-50 p-3 rounded flex justify-between items-center mb-3">
      <div className="flex items-center gap-3">
        <img  onClick={() => handleClickToProfile(member.accId)}
          src={
            member.avatar ||
            "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
          }
          className="w-10 h-10 rounded-full"
          alt="Member" style={{ cursor: "pointer" }}
        />
        <div>
          <p className="font-bold text-left">{member.fullName}</p>
          <p className="text-xs text-gray-500 text-left">
            {member.roleInGroupId === "680ce8722b3eec497a30201e"
              ? "Admin"
              : "Member"}
          </p>
          <p className="text-xs text-left  text-gray-500">{member.city}</p>
        </div>
      </div>
      {member.accId !== userAccId &&
        member.accId !== ownerId &&
        (userAccId === ownerId || 
          (userRole === "680ce8722b3eec497a30201e" &&
            member.roleInGroupId !== "680ce8722b3eec497a30201e")) && (
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsOpen(isOpen === id ? null : id)}
              className="text-sm inline-flex justify-center w-full rounded-md border border-blue-300 shadow-sm px-4 py-2 bg-blue-200 text-blue-500 hover:bg-blue-50 focus:outline-none"
            >
              Choose Role
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isOpen === id && (
              <div className="absolute w-36 rounded-md shadow-lg z-50 bg-white">
                <div className="py-2 space-y-2">
                  <div className="flex items-center gap-1 py-1 rounded text-green-700 hover:bg-green-100 w-full pl-4">
                    <img src={adminImg} alt="adminImg" className="w-5 h-5" />
                    <button
                      onClick={() => {
                        handleEditRole("680ce8722b3eec497a30201e");
                        setIsOpen(null); // Đóng menu sau khi chọn
                      }}
                      className="text-sm text-center rounded py-1"
                    >
                      Administrator
                    </button>
                  </div>

                  <div className="flex items-center gap-1 py-1 rounded text-blue-700 hover:bg-blue-100 pl-4">
                    <img src={memberImg} alt="memberImg" className="w-5 h-5" />
                    <button
                      onClick={() => {
                        handleEditRole("680cebdfac700e1cb4c165b2");
                        setIsOpen(null); // Đóng menu sau khi chọn
                      }}
                      className="text-sm text-center rounded py-1"
                    >
                      Member
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default MemberPermission;
