import React, { useState } from "react";
import GroupSidebar from "../../components/Group/GroupSidebarU";
import PopularServices from "../../components/Group/PopularServices";
import JoinRequestsList from "../../components/Group/JoinRequestsList";
import Cover from "../../components/Group/Cover";
import MainGroupContent from "../../components/Group/MainGroupContent";

export const GroupPage = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="relative bg-gray-50 min-h-screen">
      <div className="md:hidden p-4">
        <button variant="outlined" onClick={toggleSidebar}>
          {showSidebar ? (
            <i className="fa-solid fa-sliders"></i>
          ) : (
            <i className="fa-solid fa-sliders"></i>
          )}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 p-4">
        <div
          className={`col-span-12 md:col-span-3 space-y-4 ${
            showSidebar ? "block" : "hidden"
          } md:block`}
        >
          <GroupSidebar />
          <PopularServices />
        </div>

        <div className="col-span-12 md:col-span-9">
          <Cover />
          <MainGroupContent />
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
