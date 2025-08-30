import React, { useEffect, useRef, useState } from "react";
import PostCard from "../Post/PostCard";
import { useLocation } from "react-router-dom";
import instance from "../../Axios/axiosConfig";

const SearchPost = () => {
  const { state } = useLocation();
  const { keyword = "", categoryIds = [] } = state || {};
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(categoryIds);
  const [isAndLogic, setIsAndLogic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(keyword || "");
  const popupRef = useRef(null);
  const lastFetchedKeyword = useRef("");

  const fetchCategories = async () => {
    try {
      const response = await instance.get("/api/category-post/list");
      if (response.data.success) {
        setCategories(
          response.data.data.map((cat) => ({
            id: cat.categoryId,
            name: cat.categoryName,
          }))
        );
      } else {
        setError(response.data.messageError || "Failed to fetch categories");
      }
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    }
  };

  const fetchPosts = async (keywordToSearch = searchKeyword) => {
    const trimmedKeyword = keywordToSearch?.trim();
    if (!trimmedKeyword || trimmedKeyword === lastFetchedKeyword.current) {
      setLoading(false);
      return;
    }
    lastFetchedKeyword.current = trimmedKeyword;

    try {
      setLoading(true);
      setError(null);

      const params = {
        keyword: trimmedKeyword,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        isAndLogic,
      };

      const response = await instance.get("/api/post/search", {
        params,
        paramsSerializer: {
          indexes: null,
        },
      });

      if (response.data.success) {
        setPosts(response.data.data || []);
      } else {
        setError(response.data.message || "No posts found");
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (keyword && keyword !== searchKeyword) {
      setSearchKeyword(keyword);
    }
  }, [keyword]);

  useEffect(() => {
    if (searchKeyword) {
      fetchPosts(searchKeyword);
    }
  }, [searchKeyword, selectedCategories, isAndLogic]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsCategoryPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLogicToggle = () => {
    setIsAndLogic(!isAndLogic);
  };

  const handleSearch = () => {
    fetchPosts();
    setIsCategoryPopupOpen(false);
  };

  const toggleCategoryPopup = () => {
    setIsCategoryPopupOpen(!isCategoryPopupOpen);
  };

  const selectedCategoryNames = selectedCategories
    .map((id) => categories.find((cat) => cat.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full  md:ml-[289px]">
      <div className="mt-36">
        <div className="flex items-start justify-between mt-8 mx-10 md:mx-20 w-full max-w-3xl">
          <div className="flex items-start">
            <span className="font-bold text-lg">KEYWORD: </span>
            <span className="text-lg ml-1">{searchKeyword || "None"}</span>
          </div>
          <button onClick={toggleCategoryPopup} className="mt-1">
            <i className="fas fa-sliders-h text-sky-400 text-xl"></i>
          </button>
        </div>

        <div className="flex gap-6 items-center mt-6 mb-10 mx-10 md:mx-20">
          <div className="flex gap-1">
            <p className="font-bold">{posts.length}</p>
            <p className="text-[#999999] font-bold">POSTS FOUND</p>
          </div>
        </div>

        {isCategoryPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              ref={popupRef}
              className="bg-white p-4 rounded-lg max-h-[80vh] overflow-y-auto w-11/12 max-w-md"
            >
              <h3 className="font-bold mb-2">Filter Posts</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-start">
                  <span className="font-bold text-lg">KEYWORD: </span>
                  <span className="text-lg ml-1">{searchKeyword || "None"}</span>
                </div>
                <label className="flex items-center gap-2 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={isAndLogic}
                    onChange={handleLogicToggle}
                    className="h-4 w-4"
                  />
                  <span>Match all selected categories</span>
                </label>
                <h4 className="font-semibold mt-2">Select Categories</h4>
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4"
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-2 bg-blue-500 text-white flex-1"
                  onClick={handleSearch}
                >
                  Search
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 text-gray-800 flex-1"
                  onClick={toggleCategoryPopup}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mx-10 md:mx-20">Loading...</div>
        ) : error ? (
          <div className="text-red-500 mx-10 md:mx-20">{error}</div>
        ) : posts.length > 0 ? (
          <div className="mx-10 md:mx-20">
            {posts.map((post) => (
              <div key={post.post.postId} className="w-full mb-6">
                <div className="w-full max-w-3xl">
                  <PostCard
                    post={{
                      postId: post.post.postId,
                      accId: post.post.accId,
                      fullName: post.ownerPost?.fullName,
                      avatar: post.ownerPost?.avatar,
                      roleId: post.ownerPost.roleId,
                      createAt: post.post.createdAt,
                      content: post.post.postContent,
                      images: post.postImages?.map((img) => img.imageUrl),
                      hashtags: post.hashTags?.map((tag) => tag.hashTagContent),
                      categories: post.postCategories?.map((cat) => cat.categoryName),
                      tagFriends: post.postTags?.map((tag) => ({
                        accId: tag.accId,
                        fullname: tag.fullname || tag.username,
                      })),
                      likes: post.reactionCount,
                      comments: post.commentCount,
                      shares: post.shareCount,
                    }}
                    onCommentCountChange={(newCount) =>
                      console.log("Comment count updated:", newCount)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-10 md:mx-20">
            No posts found for "{searchKeyword}"
            {selectedCategoryNames && (
              <>
                {" in "}
                {selectedCategoryNames || "no categories"}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPost;