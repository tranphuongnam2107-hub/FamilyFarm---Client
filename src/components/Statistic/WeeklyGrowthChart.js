import React, { useEffect, useState } from "react";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const WeeklyGrowthChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const formatDataWithGrowth = (weeklyData) => {
      return Object.entries(weeklyData).map(([week, count], index, arr) => ({
        week,
        count,
        growthPercent:
          index === 0
            ? 0
            : ((count - arr[index - 1][1]) / arr[index - 1][1]) * 100,
      }));
    };

    const fetchWeeklyGrowth = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7280/api/statistic/weekly-growth"
        );
        const formattedData = formatDataWithGrowth(response.data);
        setData(formattedData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tăng trưởng lịch:", error);
      }
    };

    fetchWeeklyGrowth();

    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7280/topengagedposthub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("Connected to weekly growth hub");

        connection.on("ReceiveWeeklyGrowthUpdate", (weeklyData) => {
          const formattedData = formatDataWithGrowth(weeklyData);
          setData(formattedData);
        });
      })
      .catch((err) => {
        console.error("Lỗi kết nối SignalR:", err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-lg font-semibold text-blue-700 mb-5">
        📈 Weekly appointment growth
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="week" angle={-30} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} />
          <Tooltip
            formatter={(value, name, props) => {
              if (name === "Growth") {
                const growthPercent = Math.round(props.payload.growthPercent);
                return [`${growthPercent}%`, name];
              }
              return [value, name];
            }}
          />
          <Legend
            formatter={(value) =>
              value === "count" ? "Booking" : "Growth (%)"
            }
          />
          <Bar dataKey="count" barSize={30} fill="#4F46E5" name="Booking" />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 5 }}
            name="Growth"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyGrowthChart;
