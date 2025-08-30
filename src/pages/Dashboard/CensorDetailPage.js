import React, { useState, useEffect } from "react";
import AccountSencorDetail from "../../components/AccountManage/AccountSencorDetail";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import { useParams } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";

const CensorDetailPage = () => {
  const { accId } = useParams(); // lấy accId từ URL
  const [account, setAccount] = useState(null);

  const fetchAccountCensor = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/account/get-by-accId/${accId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data !== null) {
        setAccount(data);
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error("Error fetching account censor:", err.message || err);
    }
  };

  useEffect(() => {
    fetchAccountCensor();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        {account ? (
          <AccountSencorDetail account={account} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CensorDetailPage;