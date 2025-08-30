import React, { useState, useEffect } from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import AccountDetail from "../../components/AccountManage/AccountDetail";

const AccountDetailPage = () => {
  const { accId } = useParams(); // lấy accId từ URL
  const location = useLocation(); //  Lấy state khi navigate
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [listPost, setListPost] = useState([]);
  const [listService, setListService] = useState([]);

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

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/post/account/${accId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success === true) {
        setListPost(data.data);
      } else {
        setListPost([]);
      }
    } catch (err) {
      console.error("Error fetching list post:", err.message || err);
    }
  };

  const fetchService = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/service/all-by-account/${accId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success === true) {
        setListService(data.data);
      } else {
        setListService([]);
      }
    } catch (err) {
      console.error("Error fetching account service:", err.message || err);
    }
  };

  useEffect(() => {
    fetchAccountCensor();
    fetchPost();
    fetchService();
  }, [accId]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />
      <div className="p-8 w-full bg-[#3DB3FB]/5">
        {account ? (
          <AccountDetail
            account={account}
            listPost={listPost}
            listService={listService}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
          </div>
        )}
        {location.state?.fromStatistic && (
          <button
            onClick={() => navigate(-1)}
            className="mb-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            ← Statistic
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountDetailPage;
