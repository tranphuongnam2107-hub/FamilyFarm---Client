import React, { useState } from "react";
import axios from "axios";

const TopEngagedPosts = () => {
  const [top, setTop] = useState(5);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPost, setSelectedPost] = useState(null); // ← post chi tiết
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTopPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "https://localhost:7280/api/statistic/top-engaged",
        {
          params: { top },
        }
      );

      if (res.data?.isSuccess) {
        setPosts(res.data.data);
      } else {
        setError("Không thể lấy dữ liệu.");
      }
    } catch (err) {
      setError("Lỗi khi gọi API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = async (postId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `https://localhost:7280/api/post/get-by-id/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data?.success) {
        setSelectedPost(res.data.data);
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy post:", err);
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalOpen(false);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-blue-700">
        Top Engaging Posts
      </h2>

      <div className="flex justify-center gap-2 mb-4 ">
        <input
          type="number"
          min={1}
          value={top}
          onChange={(e) => setTop(Number(e.target.value))}
          className="border px-3 py-1 rounded w-20"
        />
        <button
          onClick={fetchTopPosts}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          View
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4 max-h-[380px] overflow-y-auto">
        {posts.map((item, idx) => (
          <div
            key={item.post.postId}
            onClick={() => handlePostClick(item.post.postId)}
            className="border rounded p-3 shadow-sm bg-gray-50 cursor-pointer hover:bg-blue-50 transition"
          >
            <p className="text-sm text-gray-600 mb-1">
              #{idx + 1} - {new Date(item.post.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-800 mb-2 truncate">
              {item.post.postContent}
            </p>
            <div className="flex gap-4 text-sm text-gray-700">
              <span>❤️ {item.totalReactions}</span>
              <span>💬 {item.totalComments}</span>
              <span>📊 {item.totalEngagement}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-blue-700">
              Post Detail
            </h3>

            <p className="text-sm text-gray-500 mb-1">
              Post date:{" "}
              {new Date(selectedPost.post?.createdAt).toLocaleString()}
            </p>
            <p className="mb-4">{selectedPost.post?.postContent}</p>

            <div className="text-sm text-gray-700">
              <p>❤️ Reactions: {selectedPost.reactionCount}</p>
              <p>💬 Comments: {selectedPost.commentCount}</p>
              <p>💬 Shared: {selectedPost.shareCount}</p>
              <p>
                📌 Tags:{" "}
                {selectedPost.postTags?.length > 0
                  ? selectedPost.postTags.map((tag) => tag).join(", ")
                  : "No Information"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopEngagedPosts;
