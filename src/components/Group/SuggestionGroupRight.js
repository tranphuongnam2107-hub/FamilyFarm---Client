import React, { useState, useEffect } from "react";
import SuggestionGroupCard from "./SuggestionGroupCard";

const SuggestionGroupRight = () => {
  const [groupsData, setGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group/group-suggestion-in-group`,
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
      if (data.success === true) {
        setGroupData(data.data);
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
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-16 md:mx-20 ">
      {isLoading ? (
        <p>Loading...</p>
      ) : groupsData.length === 0 ? (
        <p className="text-center text-gray-500 col-span-3 h-10">
          No group suggestions available
        </p>
      ) : (
        groupsData.map((group) => (
          <SuggestionGroupCard
            key={group.group.groupId}
            group={group.group}
            member={group.numberInGroup}
          />
        ))
      )}
    </div>
  );
};
export default SuggestionGroupRight;
