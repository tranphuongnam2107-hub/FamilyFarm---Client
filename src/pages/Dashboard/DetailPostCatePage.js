import React from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import DetailPostCate from "./DetailPostCate";
const DetailPostCatePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />

      {/* <div className="flex-1 ml-64">
                    <StatisticPage />
                  </div> */}

      <div className="flex-1 ">
        <DetailPostCate />
      </div>
    </div>
  );
};

export default DetailPostCatePage;
