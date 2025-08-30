import React from "react";
import YourGroupDetailItem from "./YourGroupDetailItem";

const YourGroupDetailListItem = ({ YourGroupList }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold mb-3">Your Group</h2>
      </div>
      <div className="flex flex-col gap-3">
        {YourGroupList.map((group) => (
          <YourGroupDetailItem key={group.group.groupId} group={group.group} />
        ))}
      </div>
    </div>
  );
};

export default YourGroupDetailListItem;
