import React, { useEffect, useState } from "react";
import axios from "axios";
import MostUser from "../../components/Statistic/MostUser";
import UserGrowthChart from "../../components/Statistic/UserGrowthChart";
import MapChart from "../../components/Statistic/MapChart";
import SystemRevenue from "../../components/Statistic/SystemRevenue";
import TopEngagedPosts from "../../components/Statistic/TopEngagedPosts";
import WeeklyGrowthChart from "../../components/Statistic/WeeklyGrowthChart";
import * as signalR from "@microsoft/signalr";
import CountUp from "react-countup";

const StatisticPage = () => {
  const [counts, setCounts] = useState({
    Farmer: 0,
    Expert: 0,
  });

  const [growth, setGrowth] = useState({
    Farmer: 0,
    Expert: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPosts, setPostCount] = useState(0);

  useEffect(() => {
    const fetchRoleCounts = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7280/api/statistic/count-by-role"
        );

        const roleData = response.data.data;

        setCounts({
          Farmer: roleData.FARMER?.count || 0,
          Expert: roleData.EXPERT?.count || 0,
        });

        setGrowth({
          Farmer: roleData.FARMER?.growth || 0,
          Expert: roleData.EXPERT?.growth || 0,
        });

        const postResponse = await axios.get(
          "https://localhost:7280/api/statistic/totalPost"
        );
        const totalPosts = postResponse.data.totalPosts;

        setPostCount(totalPosts || 0);
      } catch (err) {
        console.error("Failed to fetch role counts:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleCounts();
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7280/topengagedposthub")
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR connected");

        connection.on("UpdateFarmerCount", (newCount, newGrowth) => {
          setCounts((prev) => ({ ...prev, Farmer: newCount }));
          setGrowth((prev) => ({ ...prev, Farmer: newGrowth }));
        });

        connection.on("ExpertCountUpdate", (newCount, newGrowth) => {
          setCounts((prev) => ({ ...prev, Expert: newCount }));
          setGrowth((prev) => ({ ...prev, Expert: newGrowth }));
        });

        connection.on("NewPost", (newTotalPosts) => {
          console.log(" NewTotalPosts count update:", newTotalPosts);
          setPostCount(newTotalPosts);
        });
      })
      .catch((err) => {
        console.error(" SignalR connection failed:", err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 h-28 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Farmer</p>
            <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
              <CountUp end={counts.Farmer} duration={1} separator="," />
              <span
                className={`text-sm ${
                  growth.Farmer >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ({growth.Farmer >= 0 ? "+" : ""}
                {growth.Farmer}%)
              </span>
            </h2>
          </div>
          <div className="text-3xl text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-6"
            >
              <path
                fill-rule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-28 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Expert</p>

            <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
              <CountUp end={counts.Expert} duration={1} separator="," />
              <span
                className={`text-sm ${
                  growth.Expert >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ({growth.Expert >= 0 ? "+" : ""}
                {growth.Expert}%)
              </span>
            </h2>
          </div>
          <div className="text-3xl text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-6"
            >
              <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
            </svg>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 h-28 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Posts</p>

            <h2 className="text-xl font-bold text-blue-700">
              <CountUp end={totalPosts} duration={1} separator="," />
            </h2>
          </div>
          <div className="text-3xl text-purple-500">📝</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-2 h-[450px]">
            <UserGrowthChart />
          </div>
          <div className="bg-white rounded-xl shadow p-4 h-[400px]">
            <MostUser />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 h-[800px]">
          <MapChart />
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-[500px]">
          <TopEngagedPosts />
        </div>
        <div className="bg-white rounded-xl shadow p-4 h-[500px]">
          <WeeklyGrowthChart />
        </div>
      </div>
      <SystemRevenue />
    </div>
  );
};

export default StatisticPage;
