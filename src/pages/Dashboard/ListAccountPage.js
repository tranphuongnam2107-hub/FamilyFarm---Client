import React from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import ListAccount from "../../components/AccountManage/ListAccount";

const ListAccountPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        <ListAccount />
      </div>
    </div>
  );
};

export default ListAccountPage;