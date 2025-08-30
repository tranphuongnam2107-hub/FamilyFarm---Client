import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import { Link } from "react-router-dom";
import TablePostManagement from "./TablePostManagement";

const ListPost = () => {
  const [listPost, setListPost] = useState([]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/post/list-post-for-admin`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
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

  useEffect(() => {
    fetchPost();
  }, []);

  useEffect(() => {
    const table = $("#postTable").DataTable({
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
          <Link to="/Dashboard">HOME</Link> / Post Management
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        POST MANAGEMENT
      </h1>
      <div>
        <TablePostManagement listPost={listPost} />
      </div>
    </div>
  );
};

export default ListPost;