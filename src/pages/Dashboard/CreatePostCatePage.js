import React from "react";
import CreatePostCate from "../../pages/Dashboard/CreatePostCate";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
const CreatePostCatePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />

      {/* <div className="flex-1 ml-64">
                    <StatisticPage />
                  </div> */}

      <div className="flex-1 ">
        <CreatePostCate />
        {/* <ListAccountSensor /> */}
      </div>
    </div>
  );
};

export default CreatePostCatePage;
