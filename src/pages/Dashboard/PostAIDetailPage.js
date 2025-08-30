import React, { useState, useEffect, useCallback } from "react";
import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import { useParams } from "react-router-dom";
import { OrbitProgress } from "react-loading-indicators";
import PostAIDetail from "../../components/AIChecker/PostAIDetail";

const PostAIDetailPage = () => {
  const { id } = useParams(); // lấy postId từ URL

  const [post, setPost] = useState(null);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://localhost:7280/api/post/get-by-id/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success === true) {
        setPost(data.data);
      } else {
        setPost(null);
      }
    } catch (err) {
      console.error("Error fetching list post:", err.message || err);
    } finally {
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <SidebarDashboard />

      <div className="flex-1 bg-[rgba(61,179,251,0.05)]">
        {post ? (
          <PostAIDetail post={post} />
        ) : (
          <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
        )}
      </div>
    </div>
  );
};

export default PostAIDetailPage;
