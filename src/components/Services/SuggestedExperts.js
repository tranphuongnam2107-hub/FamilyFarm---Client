import React from "react";
import { Link } from "react-router-dom";
import FriendItem from "../Friend/FriendItem";

const SuggestedExperts = ({ friends, onLoadList }) => {
  const defaultFriends = [
    { name: "Dang Khoa", city: "Can Tho", status: null, roleId: "expert" },
    { name: "Huu Thuc", city: "Can Tho", status: null, roleId: "expert" },
    { name: "Mai Xuan", city: "An Giang", status: null, roleId: "expert" },
    { name: "Minh Uyen", city: "Kien Giang", status: null, roleId: "expert" },
  ];
  const friendList = Array.isArray(friends) ? friends : defaultFriends;

  const defaultFriend = {
    fullName: "User",
    avatar:
      "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fdefault-avatar.png?alt=media&token=3857a1ec-ace4-4329-8f36-4f3a40c3fc67",
    status: null,
  };
 
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold mb-3">Suggested Experts</h2>
      </div>
      <div className="flex flex-col gap-3">
        {Array.isArray(friendList) && friendList.length > 0 ? (
          friendList.map((friend) => (
            <FriendItem
              key={friend.accId || friend.name}
              friend={{ ...defaultFriend, ...friend }}
              onLoadList={onLoadList}
            />
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center mt-2">
            No friends to display.
          </p>
        )}
      </div>
    </div>
  );
};

export default SuggestedExperts;
