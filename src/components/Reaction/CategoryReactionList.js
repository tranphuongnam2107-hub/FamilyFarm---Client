// src/components/Reaction/ReactionPopup.js
import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const CategoryReactionList = ({ onReact }) => {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await instance.get("/api/category-reaction/all-available");
        if (response.data && Array.isArray(response.data)) {
          const formattedReactions = response.data.map((item) => ({
            id: item.id || item.categoryReactionId, // Đảm bảo lấy đúng ID
            name: item.reactionName || item.name || "Unknown",
            icon: item.iconUrl || item.image || "",
          }));
          setReactions(formattedReactions);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching reactions:", err);
        toast.error("Loading reactions failed!");
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, []);

  return (
    <div className="absolute z-20 flex gap-0 p-1 -top-12 bg-white rounded-lg shadow-lg border border-gray-200">
      {reactions.length > 0 ? (
        reactions.map((reaction) => (
          <button
            key={reaction.id}
            onClick={() => onReact(reaction.id)} // Truyền categoryReactionId thay vì reactionName
            className="flex items-center justify-center w-10 h-10 rounded-full hover:scale-125 transition-transform duration-200"
            title={reaction.name}
          >
            <img src={reaction.icon} alt={reaction.name} className="w-9 h-9" />
          </button>
        ))
      ) : (
        <div className="text-gray-600 text-sm">No reaction</div>
      )}
    </div>
  );
};

export default CategoryReactionList;