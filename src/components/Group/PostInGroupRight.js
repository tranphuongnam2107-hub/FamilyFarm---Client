import React, { useState, useEffect, useRef } from "react";
import PostInGroupCard from "./PostInGroupCard";
import instance from "../../Axios/axiosConfig";
import { toast, Bounce } from "react-toastify";
import PostCardSkeleton from "../../components/Post/PostCardSkeleton";
import defaultAvatar from "../../assets/images/default-avatar.png";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
const PostInGroupRight = () => {
  const [accountId, setAccountId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  //DÙNG CHO INFINITE SCROLL
  const [posts, setPosts] = useState([]);

  const [lastPostId, setLastPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const postContainerRef = useRef(null);
  const PAGE_SIZE = 5;
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [groupSuggestData, setGroupData] = useState([]);
  //lấy thông tin người dùng từ storage
  useEffect(() => {
    const storedAccId =
      localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAvatarUrl =
      localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");

    if (storedAccId) {
      setAccountId(storedAccId);
      setAvatarUrl(storedAvatarUrl || defaultAvatar);
    }
  }, []);

  const fetchPosts = async ({ lastPostId, reset = false }) => {
    if (!hasMore && !reset) return; // CHẶN LẠI

    setLoading(true);
    if (lastPostId) setLoadingMore(true);
    setError(null);

    try {
      const response = await instance.get("/api/post/get-post-in-user-groups", {
        params: {
          lastPostId,
          pageSize: PAGE_SIZE,
        },
      });

      const newPosts = response.data.data || [];

      setPosts((prevPosts) => (reset ? newPosts : [...prevPosts, ...newPosts]));

      // Cập nhật hasMore từ backend, hoặc dựa vào độ dài kết quả
      setHasMore(response.data.hasMore ?? newPosts.length >= PAGE_SIZE);

      // Chỉ cập nhật lastPostId nếu có bài viết mới
      if (newPosts.length > 0) {
        setLastPostId(newPosts[newPosts.length - 1].post.postId);
      }
    } catch (error) {
      setError("Failed to load posts!");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  //GỌI LẦN ĐẦU

  useEffect(() => {
    setSkip(0);
    setLastPostId(null);
    fetchPosts({ lastPostId: null, reset: true });
  }, []);

  const { skip, setSkip } = useInfiniteScroll({
    fetchData: () => {
      if (!loading && !loadingMore && hasMore && lastPostId !== null) {
        return fetchPosts({ lastPostId });
      }
    },
    containerRef: window,
    direction: "down",
    threshold: 50,
    hasMore,
    loading,
    loadingMore,
    comments: posts.length,
    data: PAGE_SIZE,
    take: posts.length,
  });

  const handleCommentCountChange = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((postMapper) =>
        postMapper.post && postMapper.post.postId === postId
          ? { ...postMapper, post: { ...postMapper.post, comments: newCount } }
          : postMapper
      )
    );
  };
  const handleDeletePost = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post.post.postId !== postId)
    );
  };

  const handlePostCreate = (newPostData) => {
    if (newPostData.postScope === "Public") {
      setPosts((prevPosts) => [newPostData, ...prevPosts]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-12 lg:mt-[120px] mt-[63px]">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {loading && skip === 0 ? (
          <div className="flex flex-col gap-5">
            {[...Array(3)].map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">{error}</div>
        ) : posts.length > 0 ? (
          posts.map((postMapper, index) =>
            postMapper && postMapper.post && postMapper.ownerPost ? (
              <PostInGroupCard
                onDeletePost={handleDeletePost}
                key={`${postMapper.post.postId}-${index}`}
                post={{
                  accId: postMapper.ownerPost.accId || "Unknown",
                  postId: postMapper.post.postId,
                  fullName: postMapper.ownerPost.fullName || "Unknown User",
                  avatar:
                    postMapper.ownerPost.avatar ||
                    "https://via.placeholder.com/40",
                  createAt: postMapper.post.createdAt,
                  content: postMapper.post.postContent,
                  images:
                    postMapper.postImages?.map((img) => img.imageUrl) || [],
                  hashtags:
                    postMapper.hashTags?.map((tag) => tag.hashTagContent) || [],
                  tagFriends:
                    postMapper.postTags?.map((tag) => ({
                      accId: tag.accId,
                      fullname: tag.fullname || tag.username || "Unknown", // Sử dụng username nếu fullname là null
                    })) || [],
                  categories:
                    postMapper.postCategories?.map((cat) => cat.categoryName) ||
                    [],
                  likes: postMapper.reactionCount || 0,
                  comments: postMapper.commentCount || 0,
                  shares: postMapper.shareCount || 0,
                }}
                groupData={postMapper.group}
                onCommentCountChange={(newCount) =>
                  handleCommentCountChange(postMapper.post.postId, newCount)
                }
              />
            ) : null
          )
        ) : (
          <div className="text-center py-4">You have no posts to display</div>
        )}
        {loadingMore && (
          <div className="flex flex-col gap-5 py-4">
            {[...Array(2)].map((_, index) => (
              <PostCardSkeleton key={`more-${index}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostInGroupRight;
