import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { Link } from "react-router-dom";
import TableListAccount from "./TableListAccount";

const ListAccount = () => {
  const [allList, setAllList] = useState([]);
  const [farmerList, setFarmerList] = useState([]);
  const [expertList, setExpertList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAllAccounts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/account/get-all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllList(data);
      }
    } catch (err) {
      console.error("Error fetching all:", err);
    }
  };

  const fetchFarmerAccounts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/account/list-censor/68007b0387b41211f0af1d56`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setFarmerList(data);
      }
    } catch (err) {
      console.error("Error fetching farmer:", err);
    }
  };

  const fetchExpertAccounts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/account/list-censor/68007b2a87b41211f0af1d57`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setExpertList(data);
      }
    } catch (err) {
      console.error("Error fetching expert:", err);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  return (
    <div>
      <div className="text-left mb-5 font-semibold flex items-center gap-2 text-[#3E3F5E]/25">
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z"
            fill="rgba(62,63,94,0.25)"
          />
        </svg>
        <span>
          <Link to="/Dashboard">HOME</Link> / Account Management
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        ACCOUNT MANAGEMENT
      </h1>
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => {
            setActiveTab("all");
            fetchAllAccounts();
          }}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "all"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setActiveTab("farmer");
            fetchFarmerAccounts();
          }}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "farmer"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Farmer
        </button>
        <button
          onClick={() => {
            setActiveTab("expert");
            fetchExpertAccounts();
          }}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "expert"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Expert
        </button>
      </div>
      <div>
        <TableListAccount
          displayList={
            activeTab === "all"
              ? allList
              : activeTab === "farmer"
              ? farmerList
              : expertList
          }
          onDeleted={
            activeTab === "all"
              ? fetchAllAccounts
              : activeTab === "farmer"
              ? fetchFarmerAccounts
              : fetchExpertAccounts
          }
        />
      </div>
    </div>
  );
};

export default ListAccount;