import React, { useState, useEffect, useRef } from "react";
import YourGroupCard from "./YourGroupCard";
import { HubConnectionBuilder } from "@microsoft/signalr";
const YourgroupRight = ({ section }) => {
  const [groupsData, setGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 const connectionRef = useRef(null);
  const fetchGroups = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(`https://localhost:7280/api/group/${section}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Kiểm tra dữ liệu và cập nhật state
      if (data.success === true) {
        setGroupData(data.data);
        //console.log(data[0]);
      } else {
        console.warn("Unexpected response format:", data);
        setGroupData([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    // setGroupData(mockData);
    setIsLoading(false);
    // Khởi tạo kết nối SignalR
        const connection = new HubConnectionBuilder()
          .withUrl("https://localhost:7280/friendHub") // thay bằng endpoint hub thực tế của bạn
          .withAutomaticReconnect()
          .build();
    
        connection
          .start()
          .then(() => {
            console.log("SignalR connected");
    
            // Khi nhận tín hiệu, gọi lại fetch
            connection.on("GroupMemberUpdate", () => {
              console.log("Received GroupMemberUpdate signal");
              fetchGroups();
            });
          })
          .catch((err) => console.error("SignalR connection error: ", err));
    
        connectionRef.current = connection;
    
        // Cleanup khi component unmount
        return () => {
          if (connectionRef.current) {
            connectionRef.current.stop();
          }
        };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-16 md:mx-20 ">
      {isLoading ? (
        <p>Loading...</p>
      ) : Array.isArray(groupsData) && groupsData.length > 0 ? (
        groupsData.map((group) => (
          <YourGroupCard
            key={group.group.groupId}
            group={group.group}
            member={group.numberInGroup}
          />
        ))
      ) : (
        <p>No data to display</p>
      )}
    </div>
  );
};

export default YourgroupRight;
