import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { Link } from "react-router-dom";
import TableListCateService from "./TableListCateService";
import * as signalR from "@microsoft/signalr";

const ListCateService = () => {
  const [allList, setAllList] = useState([]);

  const fetchAllService = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/category-service/all-for-admin`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setAllList(data.data);
      }
    } catch (err) {
      console.error("Error fetching all:", err);
    }
  };

  useEffect(() => {
    fetchAllService();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7280/categoryServiceHub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR connected");
        connection.on("CategoryUpdated", () => {
          console.log("📢 Update received → fetching list again...");
          fetchAllService();
        });
      })
      .catch((err) => console.error("❌ SignalR error", err));

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    const table = $("#cateServiceTable").DataTable({
      ordering: false, // Vô hiệu hóa sắp xếp mặc định
    });
    return () => {
      table.destroy();
    };
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
          <Link to="/Dashboard">HOME</Link> / Category Service
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        CATEGORY SERVICE
      </h1>
      <div className="text-left mb-6">
        <Link to="/CateService/Create">
          <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 text-sm">
            New Service Category
          </button>
        </Link>
      </div>
      <div>
        <TableListCateService displayList={allList} />
      </div>
    </div>
  );
};

export default ListCateService;