import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Link } from "react-router-dom";

export const Statistic1 = () => {
  const [expertCount, setExpertCount] = useState(0);
  const [farmerCount, setFarmerCount] = useState(0);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7280/topEngagedPostHub")
      .build();

    connection.on("UpdateAccountCount", (counts) => {
      setExpertCount(counts.expertCount);
      setFarmerCount(counts.farmerCount);
    });

    connection.on("topEngagedPostHub", (posts) => {
      setPosts(posts);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("SignalR connected.");

        // Fetch counts
        fetch("https://localhost:7280/api/statistic/count-by-role")
          .then((res) => res.json())
          .then((result) => {
            if (result.isSuccess) {
              setExpertCount(result.data.EXPERT);
              setFarmerCount(result.data.FARMER);
            } else {
              console.error("Error:", result.message);
            }
          });

        fetch("https://localhost:7280/api/statistic/top-engaged")
          .then((res) => res.json())
          .then((data) => setPosts(data))
          .catch((err) => console.error("Fetch top posts error:", err));
      } catch (err) {
        console.error("SignalR connection error:", err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">ExpertFarmer</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-xl shadow-md text-center">
          <p className="text-xl font-semibold text-green-700">Experts</p>
          <p className="text-2xl">{expertCount}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow-md text-center">
          <p className="text-xl font-semibold text-blue-700">Farmers</p>
          <p className="text-2xl">{farmerCount}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Top Engaged Posts</h2>
      <ul className="space-y-3">
        {posts.map((postItem, index) => (
          <li
            key={index}
            className="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <p className="font-semibold">
              {index + 1}. {postItem.post.postContent}
            </p>
            <p className="text-sm text-gray-600">
              👍 {postItem.totalReactions} reactions, 💬{" "}
              {postItem.totalComments} comments
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
