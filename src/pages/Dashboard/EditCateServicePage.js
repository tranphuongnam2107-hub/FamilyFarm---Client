import React from "react";
import CreatePostCate from "../../pages/Dashboard/CreatePostCate";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import CreateCateService from "../../components/CateService/CreateCateService";
import EditCateService from "../../components/CateService/EditCateService";

const EditCateServicePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />

      {/* <div className="flex-1 ml-64">
                            <StatisticPage />
                          </div> */}

      <div className="flex-1 ">
        <EditCateService />
      </div>
    </div>
  );
};

export default EditCateServicePage;
