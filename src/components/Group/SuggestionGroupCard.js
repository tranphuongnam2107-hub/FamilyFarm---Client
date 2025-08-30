import React, { useState } from "react";
import axios from "axios";
import { toast, Bounce } from "react-toastify";

const SuggestionGroupCard = ({ group, member }) => {
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

  return (
    <div className="group w-60 md:w-[267px] h-52 md:h-[20rem] shadow-md relative rounded-md overflow-hidden">
      <img
        alt="background"
        src={group.groupBackground?.trim() ? group.groupBackground : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-background-default.jpg?alt=media&token=00da8dac-2787-41bc-8477-6bff1b468612"}
        className="h-[50%] md:h-[58%] object-cover hover:absolute hover:inset-0 w-full hover:h-full hover:object-cover hover:z-0 transition-transform duration-1000 ease-in-out hover:scale-125 hover:opacity-20"
      />

      <div>
        <div className="absolute top-[43%] md:top-[50%] left-4 z-10">
          {/* <img
            className="rounded-full w-10 h-10 md:w-[60px] md:h-[60px] object-fill "
            src={group.groupAvatar || "https://gameroom.ee/83571/minecraft.jpg"}
            alt="avatar"
          /> */}
          <img
            className="rounded-full w-10 h-10 md:w-[60px] md:h-[60px] object-fill"
            src={
              group.groupAvatar?.trim()
                ? group.groupAvatar
                : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fgroup-avatar-default-final.jpg?alt=media&token=633213e3-9495-42f8-b220-185b27d5fec9"
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
          {joinedGroups.includes(group.groupId) ? (
            <button
              disabled
              className="px-3 md:p-3 p-2 font-bold text-gray-400 border border-solid border-gray-200 rounded-full bg-gray-100 cursor-not-allowed"
            >
              Requested
            </button>
          ) : (
            <button
              onClick={() => handleJoinGroup(group.groupId)}
              className="bg-[rgba(61,179,251,0.14)] p-2 px-3 md:p-3 text-[#5596E6] rounded-2xl font-bold"
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionGroupCard;
