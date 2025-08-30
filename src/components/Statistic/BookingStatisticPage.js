import React, { useState } from "react";
import axios from "axios";

const BookingStatisticPage = () => {
  const [year, setYear] = useState(2025);
  const [type, setType] = useState("day");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStatistic = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`https://localhost:7280/api/statistic/time`, {
        params: {
          year,
          type,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(res.data);
    } catch (err) {
      setError("Lỗi khi gọi API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-slate-100 border border-gray-300 rounded-xl">
      {/* <h2 className="text-2xl font-bold mb-4"> */}
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 flex items-center justify-center gap-2">
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
            d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
          />
        </svg>
        Statistic Booking by {type === "month" ? "month" : "day"}
      </h2>

      <div className="flex justify-center gap-4 items-center mb-6">
        <input
          type="number"
          className="border rounded px-3 py-2 w-32"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          placeholder="Year"
        />
        <select
          className="border rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
        </select>
        <button
          onClick={fetchStatistic}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          View
        </button>
      </div>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {Object.keys(data || {}).length > 0 && (
        <div className="mt-6 border rounded shadow max-h-[400px] overflow-y-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Number of booking</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data || {}).map(([key, value]) => (
                <tr key={key}>
                  <td className="border px-4 py-2">{key || "N/A"}</td>
                  <td className="border px-4 py-2">{value || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingStatisticPage;
