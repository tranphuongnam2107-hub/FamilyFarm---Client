import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import WeatherWidget from "../../components/Home/WeatherWidget";
import PopularService from "../../components/Services/PopularService";
import PostCreate from "../../components/Post/PostCreate";
import PostCard from "../../components/Post/PostCard";
import SharePostCard from "../../components/Post/SharePostCard";
import SuggestedFriends from "../../components/Home/SuggestedFriends";
import SuggestedGroups from "../../components/Home/SuggestedGroups";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import PostCardSkeleton from "../../components/Post/PostCardSkeleton";
import defaultAvatar from "../../assets/images/default-avatar.png";

const HomePage = () => {
  const [accountId, setAccountId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [posts, setPosts] = useState([]);
  const [lastPostId, setLastPostId] = useState(null);
  const [lastSharePostId, setLastSharePostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const postContainerRef = useRef(null);
  const PAGE_SIZE = 5;
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [groupSuggestData, setGroupData] = useState([]);

  // Lấy thông tin người dùng từ storage
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

  const fetchPosts = async ({ lastPostId, lastSharePostId, reset = false }) => {
    if (!hasMore && !reset) return;

    setLoading(true);
    if (lastPostId || lastSharePostId) setLoadingMore(true);
    setError(null);

    try {
      const response = await instance.get("/api/post/infinite-with-share", {
        params: {
          lastPostId: lastPostId || null,
          lastSharePostId: lastSharePostId || null,
          pageSize: PAGE_SIZE,
        },
      });

      if (response.data.success) {
        const newPosts = response.data.data || [];
        setPosts((prevPosts) =>
          reset ? newPosts : [...prevPosts, ...newPosts]
        );
        setHasMore(response.data.hasMore);

        if (newPosts.length > 0) {
          const lastItem = newPosts[newPosts.length - 1];
          setLastPostId(lastItem.itemType === "Post" ? lastItem.post?.postId : lastPostId);
          setLastSharePostId(
            lastItem.itemType === "SharePost" ? lastItem.sharePostData?.sharePost?.sharePostId : lastSharePostId
          );
        }
      } else {
        setError(response.data.message || "Cannot load list post!");
        toast.error(response.data.message || "Cannot load list post!");
      }
    } catch (error) {
      setError("Cannot load list post!");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const uniquePosts = Array.from(
    new Map(
      posts.map((postMapper) => [
        postMapper.itemType === "Post"
          ? postMapper.post?.postId
          : postMapper.sharePostData?.sharePost?.sharePostId,
        postMapper,
      ])
    ).values());

  // Gọi lần đầu
  useEffect(() => {
    setSkip(0);
    setLastPostId(null);
    setLastSharePostId(null);
    fetchPosts({ lastPostId: null, lastSharePostId: null, reset: true });
  }, []);

  const { skip, setSkip } = useInfiniteScroll({
    fetchData: () => fetchPosts({ lastPostId, lastSharePostId }),
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
      prevPosts.map((postMapper) => {
        if (postMapper.itemType === "Post" && postMapper.post?.postId === postId) {
          return { ...postMapper, commentCount: newCount };
        } else if (postMapper.itemType === "SharePost" && postMapper.sharePostData?.sharePost?.sharePostId === postId) {
          return {
            ...postMapper,
            sharePostData: { ...postMapper.sharePostData, commentCount: newCount },
          };
        }
        return postMapper;
      })
    );
  };

  const fetchSuggestedFriends = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://localhost:7280/api/friend/suggestion-friend-home`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      if (json.data.length !== 0) {
        setSuggestedFriends(json.data);
      } else {
        setSuggestedFriends([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSuggestedFriends();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Không tìm thấy access token.");
        return;
      }
      const res = await fetch(
        `https://localhost:7280/api/group/group-suggestion-in-group`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success === true) {
        setGroupData(data.data);
      } else {
        console.warn("Unexpected response format:", data);
        setGroupData([]);
      }
    } catch (err) {
      console.error("Fail to load list group:", err.message || err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.filter(
        (postMapper) =>
          postMapper.itemType === "Post" ? postMapper.post?.postId !== postId : true
      )
    );
  };

  const handlePostCreate = (newPostData) => {
    if (newPostData.post.postScope === "Public") {
      setPosts((prevPosts) => [newPostData, ...prevPosts]);
    }
  };

  return (
    <div className="HomePage bg-gray-100">
      <Header />
      <NavbarHeader />
      <main className="max-w-7xl mx-auto lg:pt-[140px] pt-[65px]">
        <div className="gap-5 grid lg:grid-cols-[1fr_2fr_1fr] grid-cols-1">
          <aside className="flex flex-col gap-5 order-1">
            <WeatherWidget />
            <PopularService/>
          </aside>
          <section
            ref={postContainerRef}
            className="flex flex-col gap-5 lg:order-2 order-3 w-full"
          >
            <PostCreate
              profileImage={avatarUrl}
              onPostCreate={handlePostCreate}
            />
            {loading && skip === 0 ? (
              <div className="flex flex-col gap-5">
                {[...Array(3)].map((_, index) => (
                  <PostCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-4">{error}</div>
            ) : uniquePosts.length > 0 ? (
              uniquePosts.map((postMapper, index) => {
                if (postMapper.itemType === "Post" && postMapper.post && postMapper.ownerPost) {
                  return (
                    <PostCard
                      onDeletePost={handleDeletePost}
                      key={`${postMapper.post.postId}-${index}`}
                      post={{
                        accId: postMapper.ownerPost.accId || "Unknown",
                        postId: postMapper.post.postId,
                        fullName: postMapper.ownerPost.fullName || "Unknown User",
                        avatar: postMapper.ownerPost.avatar,
                        roleId: postMapper.ownerPost.roleId,
                        createAt: postMapper.post.createdAt,
                        content: postMapper.post.postContent,
                        images: postMapper.postImages?.map((img) => img.imageUrl) || [],
                        hashtags: postMapper.hashTags?.map((tag) => tag.hashTagContent) || [],
                        tagFriends: postMapper.postTags?.map((tag) => ({
                          accId: tag.accId,
                          fullname: tag.fullname || tag.username || "Unknown",
                        })) || [],
                        categories: postMapper.postCategories?.map((cat) => cat.categoryName) || [],
                        likes: postMapper.reactionCount || 0,
                        comments: postMapper.commentCount || 0,
                        shares: postMapper.shareCount || 0,
                      }}
                      onCommentCountChange={(newCount) =>
                        handleCommentCountChange(postMapper.post.postId, newCount)
                      }
                    />
                  );
                } else if (postMapper.itemType === "SharePost" && postMapper.sharePostData) {
                  return (
                    <SharePostCard
                      key={`${postMapper.sharePostData.sharePost.sharePostId}-${index}`}
                      post={postMapper}
                    />
                  );
                }
                return null;
              })
            ) : (
              <div className="text-center py-4">Không tìm thấy bài viết</div>
            )}
            {loadingMore && (
              <div className="flex flex-col gap-5 py-4">
                {[...Array(2)].map((_, index) => (
                  <PostCardSkeleton key={`more-${index}`} />
                ))}
              </div>
            )}
          </section>
          <section className="flex flex-col gap-5 lg:order-3 order-2">
            <SuggestedFriends friends={suggestedFriends} />
            <SuggestedGroups groups={groupSuggestData} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;