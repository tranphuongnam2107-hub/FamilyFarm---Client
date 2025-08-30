import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as signalR from "@microsoft/signalr";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const UserGrowthChart = () => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [viewMode, setViewMode] = useState("day"); // day | month | year
  const [rawData, setRawData] = useState({});

  const getDefaultDates = () => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    return {
      start: threeMonthsAgo.toISOString().split("T")[0], // yyyy-mm-dd
      end: today.toISOString().split("T")[0],
    };
  };

  const { start, end } = getDefaultDates();
  const [fromDate, setFromDate] = useState(start);
  const [toDate, setToDate] = useState(end);

  const processData = (data) => {
    const grouped = {};
    Object.entries(data).forEach(([dateStr, value]) => {
      const [day, month, year] = dateStr.split("/");

      let key;
      if (viewMode === "day") {
        key = `${year}-${month}-${day}`;
      } else if (viewMode === "month") {
        key = `${year}-${month}`;
      } else if (viewMode === "year") {
        key = year;
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += value;
    });
    return grouped;
  };

  const updateChart = (data) => {
    const processed = processData(data);
    const labels = Object.keys(processed);
    const values = Object.values(processed);

    setChartData({
      labels,
      datasets: [
        {
          label: "Number of users",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
        },
      ],
    });

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of users",
          },
        },
        x: {
          title: {
            display: true,
            text: viewMode.charAt(0).toUpperCase() + viewMode.slice(1), // Viết hoa chữ đầu
          },
        },
      },
    });
  };

  const fetchData = async () => {
    let url = "https://localhost:7280/api/statistic/user-growth";
    if (fromDate && toDate) {
      url += `?fromDate=${fromDate}&toDate=${toDate}`;
    }
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Không thể lấy dữ liệu");

      const result = await response.json();
      setRawData(result.data); // lưu dữ liệu gốc
      updateChart(result.data);
    } catch (error) {
      console.error("Lỗi khi load dữ liệu:", error);
      toast.error(
        "Lỗi khi tải dữ liệu. Kiểm tra console để biết thêm chi tiết."
      );
    }
  };

  useEffect(() => {
    fetchData();
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7280/topEngagedPostHub")
      .build();

    connection.on("UserRegistered", () => {
      console.log("Nhận sự kiện realtime");
      fetchData();
    });

    const startSignalR = async () => {
      try {
        await connection.start();
        console.log("SignalR kết nối thành công");
      } catch (err) {
        console.error("Kết nối SignalR thất bại:", err);
        setTimeout(startSignalR, 3000);
      }
    };

    startSignalR();
  }, []);

  useEffect(() => {
    if (Object.keys(rawData).length > 0) {
      updateChart(rawData);
    }
  }, [viewMode]);

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-blue-500">User Growth</h1>
      <div className="w-full h-[300px]">
        {chartData && <Bar data={chartData} options={chartOptions} />}
      </div>
      <div className="flex justify-center flex-col md:flex-row items-center gap-4">
        <div className="space-y-1">
          <label htmlFor="fromDate" className="block mb-1">
            From
          </label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="toDate" className="block mb-1">
            To
          </label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="space-y-1">
          <label className="block mb-1">View by</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <button
          className="px-4 py-2 mt-6 text-white transition rounded md:mt-0 hover:bg-blue-600 bg-blue-500"
          onClick={fetchData}
        >
          Load
        </button>
      </div>
    </div>
  );
};

export default UserGrowthChart;
