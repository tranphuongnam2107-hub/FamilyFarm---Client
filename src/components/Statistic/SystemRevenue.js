import React, { useEffect, useState } from "react";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SystemRevenue = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [rawRevenue, setRawRevenue] = useState({}); // lưu dữ liệu gốc
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    totalBookings: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewMode, setViewMode] = useState("day"); // day | month | year

  const processRevenueData = (data) => {
    const grouped = {};
    Object.keys(data).forEach((dateStr) => {
      let dateObj;

      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        dateObj = new Date(`${year}-${month}-${day}`);
      } else if (dateStr.includes("-")) {
        dateObj = new Date(dateStr);
      } else {
        return;
      }

      if (isNaN(dateObj)) return; // bỏ qua ngày lỗi

      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");

      let key;
      if (viewMode === "day") {
        key = `${y}-${m}-${d}`;
      } else if (viewMode === "month") {
        key = `${y}-${m}`;
      } else if (viewMode === "year") {
        key = `${y}`;
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += data[dateStr];
    });

    return Object.keys(grouped).map((key) => ({
      month: key,
      Revenue: grouped[key],
    }));
  };

  const updateChart = (data) => {
    const processed = processRevenueData(data);
    setRevenueData(processed);
  };

  const fetchRevenue = async () => {
    try {
      let url = "https://localhost:7280/api/statistic/system";

      const params = [];
      if (fromDate) params.push(`from=${fromDate}`);
      if (toDate) params.push(`to=${toDate}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await axios.get(url);
      const data = res.data;

      setRawRevenue(data.revenueByMonth); // lưu dữ liệu gốc
      updateChart(data.revenueByMonth);

      setSummary({
        totalRevenue: data.totalRevenue,
        totalCommission: data.totalCommission,
        totalBookings: data.totalBookings,
      });
    } catch (err) {
      console.error("Error fetching system revenue:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();

    // kết nối SignalR
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7280/topEngagedPostHub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to SignalR hub (topEngagedPostHub)");

        connection.on("ReceiveRevenueUpdate", (newRevenue) => {
          console.log("Revenue updated:", newRevenue);

          setRawRevenue(newRevenue.revenueByMonth);
          updateChart(newRevenue.revenueByMonth);

          setSummary({
            totalRevenue: newRevenue.totalRevenue,
            totalCommission: newRevenue.totalCommission,
            totalBookings: newRevenue.totalBookings,
          });
        });
      })
      .catch((err) => {
        console.error("Error connecting to SignalR hub:", err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    if (Object.keys(rawRevenue).length > 0) {
      updateChart(rawRevenue);
    }
  }, [viewMode]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        System Revenue Overview
      </h2>

      <div className="flex justify-center flex-col md:flex-row gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            From
          </label>
          <input
            type="date"
            className="border rounded p-2"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">To</label>
          <input
            type="date"
            className="border rounded p-2"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            View by
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border rounded p-2"
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <button
          onClick={fetchRevenue}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <h3 className="text-lg font-bold text-blue-700">
            {summary.totalRevenue.toLocaleString()}₫
          </h3>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Profit</p>
          <h3 className="text-lg font-bold text-green-700">
            {summary.totalCommission.toLocaleString()}₫
          </h3>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <h3 className="text-lg font-bold text-purple-700">
            {summary.totalBookings}
          </h3>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={revenueData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemRevenue;
