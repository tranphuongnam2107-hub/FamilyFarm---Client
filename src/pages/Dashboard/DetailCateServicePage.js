import React from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import CateServiceDetail from "../../components/CateService/CateServiceDetail";

const DetailCateServicePage = () => {
    return (
        <div className="flex min-h-screen">
          {/* Sidebar bên trái */}
          <SidebarDashboard />
    
          {/* <div className="flex-1 ml-64">
                            <StatisticPage />
                          </div> */}
    
          <div className="flex-1 ">
            <CateServiceDetail />
          </div>
        </div>
      );
    };
    
export default DetailCateServicePage