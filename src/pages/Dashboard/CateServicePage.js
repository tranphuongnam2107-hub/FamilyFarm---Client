import React from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import ListCateService from "../../components/CateService/ListCateService";

const CateServicePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        <ListCateService />
      </div>
    </div>
  );
};

export default CateServicePage;