import React, { useState, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
const MemberCard = ({ member, userRole, userAccId, ownerId }) => {
  const [farmers, setFarmers] = useState([]);
  const [experts, setExperts] = useState([]);
  const [accRole, setAccRole] = useState(null);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const navigate = useNavigate();
  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`);
  };
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      const accId = decoded.RoleId;
      setAccRole(accId);
    }
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://localhost:7280/api/friend/list-account-no-relation`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await res.json();
      if (json.length > 0) {
        // Gán farmers và experts từ API
        setFarmers(json[0]?.data || []);
        setExperts(json[1]?.data || []);
      } else {
        setFarmers([]);
        setExperts([]);
      }
    } catch (err) {
      console.error("Error fetching friends:", err.message || err);
    } finally {
    }
  };

  useEffect(() => {
    fetchFriends(); // chỉ gọi khi component load hoặc section thay đổi
  }, []);

  const handleSendRequestFriend = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      // Gửi lời mời kết bạn hoặc follow
      const response = await axios.post(
        "https://localhost:7280/api/friend/send-friend-request",
        { receiverId: member.accId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setFriendRequestSent(true); // cập nhật trạng thái đã click
        toast.success("You sent the request successfully!");
      } else {
        toast.error("Failed to send request.");
      }
    } catch (error) {
      console.error("Error during friend action:", error);
      toast.error("An error occurred while processing the action.");
    }
  };

  const handleRemove = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }
      const response = await fetch(
        `https://localhost:7280/api/group-member/delete/${member.groupMemberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }

      toast.success("REMOVE MEMBER SUCCESSFULLY!");
      // Optionally refresh list or update UI
    } catch (error) {
      console.error(error);
      toast.error("FAIL TO REMOVE MEMBER!");
    }
  };

  const allAccIdFarmer = new Set([...farmers.map((f) => f.accId)]);

  const allAccIdExpert = new Set([...experts.map((e) => e.accId)]);

  return (
    <div className="bg-gray-50 p-3 rounded flex justify-between items-center mb-3">
      <div className="flex items-center gap-3">
        <img
          onClick={() => handleClickToProfile(member.accId)}
          src={
            member.avatar ||
            "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
          }
          className="w-10 h-10 rounded-full"
          alt="avatar"
          style={{ cursor: "pointer" }}
        />
        <div>
          <p className="font-bold text-left">{member.fullName}</p>
          <p className="text-xs text-gray-500 text-left">
            Joined:{new Date(member.jointAt).toLocaleDateString("vi-VN")}{" "}
            &nbsp;&nbsp;{" "}
          </p>
          <p className="text-xs text-left  text-gray-500">{member.city}</p>
        </div>
      </div>
      {member.accId !== userAccId && (
        <div className="flex items-center gap-2">
          {/* kiểm tra nếu người dùng là expert thì có trường hợp add friend */}
          {accRole === "68007b2a87b41211f0af1d57" &&
            allAccIdExpert.has(member.accId) &&
            !friendRequestSent && (
              <button
                onClick={() => handleSendRequestFriend()}
                className="bg-blue-100 text-blue-500 px-4 py-2 text-sm rounded hover:bg-blue-300"
              >
                Add Friend
              </button>
            )}
          {/* kiểm tra nếu người dùng là farmer thì có trường hợp add friend và follow*/}
          {accRole === "68007b0387b41211f0af1d56" &&
            allAccIdExpert.has(member.accId) &&
            !friendRequestSent && (
              <button
                onClick={() => handleSendRequestFriend()}
                className="bg-blue-100 text-blue-500 px-4 py-2 text-sm rounded hover:bg-blue-300"
              >
                Follow
              </button>
            )}
          {accRole === "68007b0387b41211f0af1d56" &&
            allAccIdFarmer.has(member.accId) &&
            !friendRequestSent && (
              <button
                onClick={() => handleSendRequestFriend()}
                className="bg-blue-100 text-blue-500 px-4 py-2 text-sm rounded hover:bg-blue-300"
              >
                Add Friend
              </button>
            )}

          {/* kiểm tra role in group */}
          {userRole && (
            <>
              {userRole === "680ce8722b3eec497a30201e" &&
                member.accId !== ownerId &&
                member.roleInGroupId !== "680ce8722b3eec497a30201e" && (
                  <button
                    onClick={handleRemove}
                    className="bg-blue-100 text-blue-500 px-4 py-2 text-sm rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberCard;
