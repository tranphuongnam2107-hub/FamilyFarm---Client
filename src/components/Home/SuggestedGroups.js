import React, { useState, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import { jwtDecode } from "jwt-decode";
const SuggestedGroups = ({ groups }) => {
  const [joinedGroups, setJoinedGroups] = useState([]);

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://localhost:7280/api/group-member/request-to-join/${groupId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("You sent the request successfully!", {
          transition: Bounce,
        });
        setJoinedGroups((prev) => [...prev, groupId]); // ➜ Đánh dấu đã join
      } else {
        toast.warning(
          "You may have already sent the request or joined this group."
        );
      }
    } catch (error) {
      console.error("Sent request failed", error);
      toast.error("Failed to send request.");
    }
  };

  // const groups = [
  //     {
  //         name: "Support Coursera",
  //         members: 750,
  //         backgroundImage: "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/02/minecraft-key-art-feature.jpg",
  //         avatar: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
  //     },
  //     {
  //         name: "Support Coursera",
  //         members: 750,
  //         backgroundImage: "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2025/02/minecraft-key-art-feature.jpg",
  //         avatar: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
  //     },
  // ];

  return (
    <div className="bg-white p-5 rounded-lg border shadow-md">
      <h2 className="text-lg font-bold mb-3 text-left">Suggested Groups</h2>
      <div className="flex flex-col gap-3">
        {groups.length > 0 ? (
          groups.map((group, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-solid border-gray-200"
            >
              <div
                className="w-full h-24 rounded-md bg-no-repeat bg-center bg-cover"
                style={{
                  backgroundImage: `url(${
                    group.group.groupBackground && group.group.groupBackground.trim() !== ""
                      ? group.group.groupBackground
                      : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-background-default.jpg?alt=media&token=00da8dac-2787-41bc-8477-6bff1b468612"
                  })`,
                }}
              ></div>
              <p className="absolute text-sm text-gray-500 right-0 top-16 p-1 px-3 text-white font-bold bg-blue-400 rounded-l-full">
                Members: {group.numberInGroup}
              </p>
              <div className="absolute top-16 flex items-end gap-3 m-4">
                <img
                  src={group.group.groupAvatar?.trim() ? group.group.groupAvatar : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-avatar-default-final.jpg?alt=media&token=633213e3-9495-42f8-b220-185b27d5fec9"}
                  alt={`${group.group.groupName} avatar`}
                  className="w-10 h-10 rounded-full"
                />
                <p className="font-bold truncate max-w-[200px]">{group.group.groupName}</p>
              </div>

              {joinedGroups.includes(group.group.groupId) ? (
                <button
                  disabled
                  className="w-40 m-4 mt-10 p-2 text-sm font-bold text-gray-400 border border-solid border-gray-200 rounded-full bg-gray-100 cursor-not-allowed"
                >
                  Requested
                </button>
              ) : (
                <button
                  onClick={() => handleJoinGroup(group.group.groupId)}
                  className="w-40 m-4 mt-10 p-2 text-sm font-bold text-blue-400 border border-solid border-blue-200 rounded-full hover:bg-blue-200 transition"
                >
                  Join Group
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center mt-2">
            No groups to display.
          </p>
        )}
      </div>
    </div>
  );
};

export default SuggestedGroups;
