import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SavedPostNav from "../SavedPost/SavedPostNav";
import PostCard from "../Post/PostCard";
import SuggestedFriends from "../Home/SuggestedFriends";
import SuggestedGroups from "../Home/SuggestedGroups";
import "./savedPostBodystyle.css";
import instance from "../../Axios/axiosConfig";

export default function SavedPostBody() {
  const [posts, setPosts] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("home");


  //lấy thông tin người dùng từ storage
  useEffect(() => {
    const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAccesstoken = localStorage.getItem("accessToken");
    if (storedAccId) {
      setAccessToken(storedAccesstoken);
    }
  }, []);

  //CALL API GỌI LIST SAVED POST
  useEffect(() => {
    if (!accessToken) return;

    const fetchListSavedPost = async () => {
      try {
        const response = await instance.get("/api/post/list-saved",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )

        if (response.status === 200) {
          setPosts(response.data.data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    fetchListSavedPost();
  }, [accessToken])

  const handleCommentCountChange = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((postMapper) =>
        postMapper.post && (postMapper.post.postId) === postId
          ? { ...postMapper, post: { ...postMapper.post, comments: newCount } }
          : postMapper
      )
    );
  };

  const handleUnsavedPost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.post.postId !== postId));
  }

 
  // Hàm check đuôi file là ảnh
  const isImage = (url) => {
    if (!url) return false;
    console.log(url)
    try {
      const decoded = decodeURIComponent(url); // Giải mã %2F, %20, v.v.
      console.log(decoded);
      const path = decoded.split("?")[0]; // Cắt phần ?token
      return (
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".png") ||
        path.endsWith(".gif") ||
        path.endsWith(".webp")
      );
    } catch (err) {
      console.error("Invalid URL:", url);
      return false;
    }
  };

  // Hàm check video
  const isVideo = (url) => {
    if (!url) return false;

    try {
      const decoded = decodeURIComponent(url);
      const path = decoded.split("?")[0];
      return (
        path.endsWith(".mp4") ||
        path.endsWith(".mov") ||
        path.endsWith(".avi") ||
        path.endsWith(".webm") ||
        path.endsWith(".mkv")
      );
    } catch (err) {
      console.error("Invalid URL:", url);
      return false;
    }
  };

  const filteredPosts = posts.filter((post) => {
    console.log(post)
    if (filterType === "home") return true;

    if (filterType === "image") {
      return post.postImages.some(img => isImage(img.imageUrl));
    }

    if (filterType === "video") {
      return post.postImages.some(img => isVideo(img.imageUrl));
    }

    return true;
  });

  return (
    <div className="list-saved-post-page w-full lg:pt-[100px] pt-[63px]">
      <div className="w-full list-save-post-page-container">
        <div className="flex flex-row gap-5 body-post-save-container">
          <SavedPostNav onFilterChange={setFilterType} selected={filterType} />
          <div className="save-post-main pt-[49px] mx-auto max-w-pl- grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
            <div className="flex flex-col order-2 h-full max-w-3xl gap-5 mx-auto mb-9 item-post-save lg:pl-5 lg:order-1">

              {filteredPosts.length <= 0 ? (
                <p className="font-normal text-gray-300 text-lg">
                  You have no any saved post!
                </p>
              ) : (
                filteredPosts.map((postMapper, index) => (
                  <PostCard
                    isDeleted={postMapper.post.isDeleted || false}
                    onUnsavedPost={handleUnsavedPost}
                    key={`${postMapper.post.postId}-${index}`}
                    post={{
                      accId: postMapper.ownerPost.accId,
                      postId: postMapper.post.postId,
                      fullName: postMapper.ownerPost ? postMapper.ownerPost.fullName || postMapper.post.accId : "Unknown User",
                      avatar: postMapper.ownerPost ? postMapper.ownerPost.avatar : "https://via.placeholder.com/40",
                      createAt: postMapper.post.createdAt,
                      content: postMapper.post.postContent,
                      images: postMapper.postImages ? postMapper.postImages.map((img) => img.imageUrl) : [],
                      hashtags: postMapper.hashTags ? postMapper.hashTags.map((tag) => tag.hashTagContent) : [],
                      tagFriends: postMapper.postTags ? postMapper.postTags.map((tag) => ({
                        accId: tag.accId,
                        fullname: tag.fullname || "Unknown"
                      })) : [],
                      categories: postMapper.postCategories ? postMapper.postCategories.map((cat) => cat.categoryName) : [],
                      likes: postMapper.reactionCount || 0,
                      comments: postMapper.commentCount || 0,
                      shares: postMapper.shareCount || 0,
                    }}
                    onCommentCountChange={(newCount) =>
                      handleCommentCountChange(postMapper.post.postId, newCount)
                    }
                  />
                ))
              )}
            </div>

            <div className="flex flex-col order-1 gap-5 other-container lg:order-2">

              {/* List Suggested */}
              {/* <SuggestedFriends />
                            <SuggestedGroups /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}