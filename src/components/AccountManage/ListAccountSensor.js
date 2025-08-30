import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TableListAccount from "./TableListAccount";

const ListAccountSensor = () => {
  const [listSensor, setListSensor] = useState([]);
  const [listSensored, setListSensored] = useState([]);
  const [listUnSensor, setListUnSensor] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const fetchListCensor = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/account/list-censor/68007b2a87b41211f0af1d57`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setListSensor(data);
        const censored = data.filter((item) => item.status !== 2);
        const unCensored = data.filter((item) => item.status === 2);
        setListSensored(censored);
        setListUnSensor(unCensored);
      } else {
        setListSensor([]);
        setListSensored([]);
        setListUnSensor([]);
      }
    } catch (err) {
      console.error("Error fetching list censor:", err.message || err);
    }
  };

  useEffect(() => {
    fetchListCensor();
  }, []);

  const currentList =
    activeTab === "all"
      ? listSensor
      : activeTab === "censored"
      ? listSensored
      : listUnSensor;

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
          <Link to="/Dashboard">HOME</Link> / Account Censor
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        ACCOUNT CENSOR
      </h1>
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "all"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("censored")}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "censored"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Censored
        </button>
        <button
          onClick={() => setActiveTab("uncensored")}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "uncensored"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Uncensored
        </button>
      </div>
      <div>
        <TableListAccount displayList={currentList} isCensor={true} />
      </div>
    </div>
  );
};

export default ListAccountSensor;