import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Bounce } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StatisticPage = () => {
  const navigate = useNavigate();
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
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleFetch = async () => {
    if (!startDate || !endDate) {
      toast.info("Enter time!");
      return;
    }

    const formattedStart = formatDateForAPI(startDate);
    const formattedEnd = formatDateForAPI(endDate);

    try {
      const res = await axios.get(
        "https://localhost:7280/api/statistic/most-active-members",
        {
          params: {
            startDate: formattedStart,
            endDate: formattedEnd,
          },
          withCredentials: true,
        }
      );
      setData(res.data);
      setError("");
    } catch (err) {
      console.error(" Lỗi gọi API:", err);
      setError(
        "Không thể lấy dữ liệu. Vui lòng kiểm tra API hoặc định dạng ngày."
      );
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);
  return (
    <div className="p-4 flex flex-col justify-between min-h-[380px] border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">📊 Top Users</h2>

      {data.length > 0 && (
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
  key={item.accId}
  onClick={() => navigate(`/AccountDetail/${item.accId}`, { state: { fromStatistic: true } })} 
  className="cursor-pointer hover:bg-gray-100"
>

                <td className="border p-2">{item.accountName}</td>
                <td
                  className={`border font-bold p-2 ${
                    item.roleName === "FARMER"
                      ? "text-yellow-500"
                      : item.roleName === "EXPERT"
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  {item.roleName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Đây là phần mình đẩy xuống đáy */}
      <div className="flex gap-4 mt-auto justify-center">
        <div>
          <label className="block mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={handleFetch}
          className="bg-blue-500 text-white px-4 py-2 rounded h-fit mt-6"
        >
          Load
        </button>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};
export default StatisticPage;
