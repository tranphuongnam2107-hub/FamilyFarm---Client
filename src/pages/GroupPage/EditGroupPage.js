import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import YourGroupDetailListItem from "../../components/Group/YourGroupDetailListItem";
import EditGroupForm from "../../components/Group/EditGroupForm";
import PopularService from "../../components/Services/PopularService";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HubConnectionBuilder } from "@microsoft/signalr";
export default function EditGroupPage() {
  const [yourGroupsData, setGroupData] = useState([]);
  const location = useLocation();

  const { userRole, userAccId } = location.state || {};
  const { groupId } = useParams(); // lấy groupId từ URL
  const navigate = useNavigate();
  const connectionRef = useRef(null);

  const storedAccId =
    localStorage.getItem("accId") || sessionStorage.getItem("accId");

    useEffect(() => {
        const connection = new HubConnectionBuilder()
          .withUrl("https://localhost:7280/friendHub", {
            accessTokenFactory: () => localStorage.getItem("accessToken"),
          })
          .withAutomaticReconnect()
          .build();
      
        connection
          .start()
          .then(() => {
            console.log("✅ Connected to friendHub");
      
            // 🎯 Lắng nghe sự kiện GroupDeleted
            connection.on("GroupDeleted", (deletedGroupId) => {
              console.log("📩 GroupDeleted received:", deletedGroupId);
              if (deletedGroupId === groupId) {
                toast.error("This group has been deleted!");
                navigate("/GroupDetail", { replace: true });
              }
            });
      
            // 🎯 Lắng nghe sự kiện RoleChanged
            connection.on("RoleChanged", (changedGroupId, changedAccId, newRole) => {
              console.log("📩 RoleChanged received:", {
                changedGroupId,
                changedAccId,
                newRole,
              });
      
              // Kiểm tra điều kiện
              const isGroupMatch = changedGroupId === groupId;
              const isAccMatch = changedAccId === storedAccId;
              const isRoleMatch = newRole === "680cebdfac700e1cb4c165b2";
      
              console.log("🔍 Kiểm tra điều kiện:");
              console.log("📌 Group match:", isGroupMatch);
              console.log("📌 Acc match:", isAccMatch);
              console.log("📌 Role match:", isRoleMatch);
      
              if (isGroupMatch && isAccMatch && isRoleMatch) {
                toast.warning("You no longer have permission to edit this group.");
                navigate(`/GroupDetail/${groupId}`, { replace: true });
              }
            });
          })
          .catch((err) =>
            console.error("❌ Failed to connect to friendHub", err)
          );
      
        connectionRef.current = connection;
      
        return () => {
          if (connectionRef.current) {
            connectionRef.current.stop();
            console.log("🔌 Disconnected from friendHub");
          }
        };
      }, [groupId, storedAccId, navigate]);

  const fetchYourGroupsData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group/all-group-user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Kiểm tra dữ liệu và cập nhật state
      if (Array.isArray(data.data)) {
        setGroupData(data.data);
        console.log(data[0]);
      } else {
        console.warn("Unexpected response format:", data);
        setGroupData([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
    }
  };

  useEffect(() => {
    fetchYourGroupsData();
  }, []);

  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="flex pt-36 ml-[120px] gap-6">
        <div className="w-[342px] flex flex-col gap-6">
          <YourGroupDetailListItem YourGroupList={yourGroupsData} />
          <PopularService />
        </div>
        <EditGroupForm userRole={userRole} userAccId={userAccId} />
      </div>
    </div>
  );
}
