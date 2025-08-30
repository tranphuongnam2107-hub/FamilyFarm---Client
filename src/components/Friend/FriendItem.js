import React from "react";
import FriendActionButton from "./FriendActionButton";
import default_avatar from "../../assets/images/default-avatar.png";

import { useNavigate } from "react-router-dom";
import FriendSuggestButton from "./FriendSuggestButton";
const FriendItem = ({ friend, isOwner, isProfile }) => {
  const navigate = useNavigate();
  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`);
  };
  return (
    <div className="flex justify-between items-center text-left">
      <div className="flex items-center gap-2">
        <img
          onClick={() => handleClickToProfile(friend.accId)}
          src={friend.avatar || default_avatar}
          alt={`Friend ${friend.fullName}`}
          className="w-9 h-9 rounded-full"
          style={{ cursor: "pointer" }}
        />
        <div className="flex flex-col gap-1">
          <span>{friend.fullName}</span>
          <span className="text-[10px] text-gray-600">{friend.city}</span>
        </div>
      </div>
      {(isOwner === true || isProfile !== true) && (
        <FriendSuggestButton
          status={friend.friendStatus}
          roleId={friend.roleId}
          accId={friend.accId}
        />
      )}
    </div>
  );
};

export default FriendItem;
