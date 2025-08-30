import React from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import ListAccountSensor from "../../components/AccountManage/ListAccountSensor";

const ListCensorPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        <ListAccountSensor />
      </div>
    </div>
  );
};

export default ListCensorPage;