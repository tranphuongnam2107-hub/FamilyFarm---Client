import React from "react";
import CreatePostCate from "../../pages/Dashboard/CreatePostCate";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import CreateCateService from "../../components/CateService/CreateCateService";

const CreateCateServicePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />

      {/* <div className="flex-1 ml-64">
                        <StatisticPage />
                      </div> */}

      <div className="flex-1 ">
        <CreateCateService />
      </div>
    </div>
  );
};

export default CreateCateServicePage;
