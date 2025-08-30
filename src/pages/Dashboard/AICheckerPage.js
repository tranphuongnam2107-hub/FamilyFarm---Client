import React from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import ListPostCheckedAI from "../../components/AIChecker/ListPostCheckedAI";

const AICheckerPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        <ListPostCheckedAI />
      </div>
    </div>
  );
};

export default AICheckerPage;