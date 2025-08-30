import React, { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
export default function ExpertRevenue() {
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken"); // hoặc nơi bạn lưu token

      const query = `?from=${fromDate}&to=${toDate}`;

      const res = await fetch(
        `https://localhost:7280/api/statistic/expertRevenue${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Đặt giá trị mặc định ngày
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const format = (d) => d.toISOString().split("T")[0];

    setFromDate(format(lastMonth));
    setToDate(format(today));
  }, []);

  // Gọi API sau khi ngày đã có giá trị
  useEffect(() => {
    if (fromDate && toDate) {
      fetchData();
    }
  }, [fromDate, toDate]);
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7280/topengagedposthub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR connected");
        connection.on("ReceiveExpertRevenueUpdate", (updatedData) => {
          console.log("🔁 Nhận dữ liệu cập nhật revenue real-time");
          setData(updatedData);
        });
      })
      .catch((err) => console.error("❌ SignalR connection error:", err));

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-5 font-sans border-4 border-black">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700 flex items-center justify-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
          />
        </svg>
        Revenue by Expert
      </h1>

      {/* Bộ lọc thời gian */}
      <div className="flex flex-wrap gap-4 justify-center items-center mb-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">From</label>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">To</label>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
        >
          View
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
          <div className="bg-white rounded-xl shadow p-6 border-l-8 border-blue-600">
            <h2 className="text-lg font-semibold mb-2">Total revenue</h2>
            <p className="text-3xl font-bold text-blue-700">
              {(data?.totalRevenue || 0).toLocaleString()} đ
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-8 border-green-600">
            <h2 className="text-lg font-semibold mb-2">Total commission</h2>
            <p className="text-3xl font-bold text-green-700">
              {(data?.commissionRevenue || 0).toLocaleString()} đ
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-8 border-yellow-500">
            <h2 className="text-lg font-semibold mb-2">
              Number of services provided
            </h2>
            <p className="text-3xl font-bold text-yellow-600">
              {data?.totalServicesProvided || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-8 border-purple-500">
            <h2 className="text-lg font-semibold mb-4">Hot Services</h2>
            <ul className="list-disc ml-6 space-y-1">
              {(data?.topServiceNames || []).map((name, idx) => (
                <li key={idx} className="text-base text-purple-700 font-medium">
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl shadow p-4 border-t-4 border-pink-600">
            <h2 className="text-lg font-semibold mb-4">Daily Revenue</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left border-collapse">
                <thead>
                  <tr className="bg-pink-100 text-pink-800 font-semibold text-sm">
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Revenue</th>
                    <th className="py-2 px-4 border-b">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(data?.dailyRevenue || {}).map((date) => (
                    <tr key={date} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{date}</td>
                      <td className="py-2 px-4 border-b">
                        {Number(
                          data?.dailyRevenue?.[date] || 0
                        ).toLocaleString()}{" "}
                        đ
                      </td>
                      <td className="py-2 px-4 border-b">
                        {Number(
                          data?.dailyCommission?.[date] || 0
                        ).toLocaleString()}{" "}
                        đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
