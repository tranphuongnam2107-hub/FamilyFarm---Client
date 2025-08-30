import React, { useState, useRef, useEffect } from "react";
import public_status_icon from "../../assets/icons/public_status_icon.svg";
import tag_icon from "../../assets/icons/tag_icon.svg";
import defaultAvatar from "../../assets/images/default-avatar.png";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import formatTime from "../../utils/formatTime";
import nam_like_icon from "../../assets/icons/nam_like.svg";
import nam_comment_icon from "../../assets/icons/nam_comment.svg";
import nam_share_icon from "../../assets/icons/nam_share.svg";
import "./CreatePost.css"; // Reusing CreatePost.css for consistent styling

const SharePostPopup = ({ post, onClose, onSharedPost }) => {
  const [withWhom, setWithWhom] = useState("");
  const withWhomInputRef = useRef(null);
  const [accountId, setAccountId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [fullName, setFullName] = useState("");

  // VARIABLE GỬI FORM SHARE
  const [sharePostContent, setSharePostContent] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [sharePostScope, setSharePostScope] = useState("Public");

  // Danh sách lấy từ db
  const [listFriends, setListFriends] = useState([]);

  // Lấy thông tin người dùng từ storage
  useEffect(() => {
    const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAvatarUrl = localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedFullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
    
    if (storedAccId) {
      setAccountId(storedAccId);
      setAvatarUrl(storedAvatarUrl || defaultAvatar);
      setAccessToken(storedAccessToken);
      setFullName(storedFullName || "User");
    }
  }, []);

  // GỌI API LẤY DANH SÁCH FRIEND
  useEffect(() => {
    if (!accessToken) return;
    
    const fetchFriends = async () => {
      try {
        const response = await instance.get("/api/friend/list-friend", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          setListFriends(response.data.data);
        }
      } catch (error) {
        console.error("Cannot get list friend:", error);
        // toast.error("Failed to load friends list!");
      }
    };

    fetchFriends();
  }, [accessToken]);

  // Xử lý khi submit form share
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract hashtags from content
    const hashTags = (sharePostContent.match(/#\w+/g) || []).map(tag => tag.slice(1));

    // Create FormData object
    const formData = new FormData();
    formData.append("PostId", post.postId);
    formData.append("SharePostContent", sharePostContent);
    formData.append("SharePostScope", sharePostScope);
    hashTags.forEach(tag => formData.append("HashTags", tag));
    taggedFriends.forEach(friend => formData.append("TagFiendIds", friend.accId));

    try {
      const response = await instance.post("/api/share-post/create", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 && response.data.success) {
        toast.success("Post shared successfully!");
        onSharedPost(response.data.sharePostData);
        onClose();
      } else {
        toast.error(response.data.message || "Failed to share post!");
      }
    } catch (err) {
      console.error("Error sharing post:", err);
      toast.error(err.response?.data?.message || "Failed to share post!");
    }
  };

  // Remove friend
  const removeFriend = (friend) => {
    setTaggedFriends(taggedFriends.filter((f) => f.accId !== friend.accId));
  };

  // Handle tag friends
  const handleTagFriends = () => {
    withWhomInputRef.current.focus();
  };

  // Filter friends for search
  const filteredFriends = (listFriends || []).filter((friend) =>
    (friend?.fullName || "").toLowerCase().includes((withWhom || "").toLowerCase())
  );

  // Default values for post data
  const defaultPost = {
    accId: "",
    fullName: "Unknown User",
    avatar: defaultAvatar,
    createAt: "Unknown",
    content: null,
    images: null,
    hashtags: null,
    tagFriends: null,
    likes: 0,
    comments: 0,
    shares: 0,
  };

  const postData = { ...defaultPost, ...post };
  const hashTags = postData.hashtags || [];
  const categories = postData.categories || [];
  const tagFriends = postData.tagFriends || [];

  // Render tag friends cho post gốc
  const renderTagFriends = () => {
    const fullNameElement = <span className="text-[#088DD0] font-bold">{postData.fullName}</span>;

    if (!tagFriends.length) return fullNameElement;

    if (tagFriends.length === 1) {
      return (
        <>
          {fullNameElement}
          <span className="text-black">
            <span className="text-gray-400 font-normal"> with </span>
            <span className="text-[#088DD0]">{tagFriends[0].fullname}</span>
          </span>
        </>
      );
    }

    if (tagFriends.length === 2) {
      return (
        <>
          {fullNameElement}
          <span className="text-black">
            <span className="text-gray-400 font-normal"> with </span>
            <span className="text-[#088DD0]">{tagFriends[0].fullname}</span> and{" "}
            <span className="text-[#088DD0]">{tagFriends[1].fullname}</span>
          </span>
        </>
      );
    }

    return (
      <>
        {fullNameElement}
        <span className="text-black">
          <span className="text-gray-400 font-normal"> with </span>
          <span className="text-[#088DD0]">{tagFriends[0].fullname}</span> and {tagFriends.length - 1} more
        </span>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            <i className="fa-solid fa-share mr-2"></i>Share Post
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit}>
            {/* User info và nội dung share */}
            <div className="flex items-start gap-3 mb-4">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[#088DD0]">{fullName}</span>
                  <div className="relative inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-500 bg-gray-100 border rounded">
                    <img src={public_status_icon} alt="Privacy" className="w-3 h-3" />
                    <select
                      value={sharePostScope}
                      onChange={(e) => setSharePostScope(e.target.value)}
                      className="bg-transparent outline-none text-xs"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={sharePostContent}
                  onChange={(e) => setSharePostContent(e.target.value)}
                  placeholder="Say something about this post..."
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none resize-none"
                  rows="3"
                />
              </div>

            </div>

            {/* Hiển thị hashtags */}
            {(sharePostContent.match(/#\w+/g) || []).length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mb-3 text-sm text-gray-500">
                Hashtags:{" "}
                {(sharePostContent.match(/#\w+/g) || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-gray-700 bg-gray-200 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hiển thị tagged friends */}
            {taggedFriends.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-500">
                Tags:
                {taggedFriends.map((friend) => (
                  <span
                    key={friend.accId}
                    className="flex items-center pl-2 text-sm text-white bg-gray-400 rounded"
                  >
                    {friend.fullName}
                    <button
                      type="button"
                      onClick={() => removeFriend(friend)}
                      className="ml-2 bg-gray-200 hover:bg-gray-300 text-white rounded-r flex items-center justify-center px-2 py-1"
                    >
                      <i className="fa-solid fa-times text-xs text-[#33B1FF]"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag friends input */}
            <div className="mb-4">
              <div
                onClick={handleTagFriends}
                className="flex items-center gap-2 px-3 py-2 text-blue-500 bg-gray-100 border rounded-lg cursor-pointer w-full max-w-xs"
              >
                <img src={tag_icon} alt="Tag friends" className="w-4 h-4" />
                Tag friends
              </div>
              <div className="relative mt-2">
                <i className="absolute text-gray-400 transform -translate-y-1/2 fa-solid fa-magnifying-glass left-3 top-1/2"></i>
                <input
                  ref={withWhomInputRef}
                  type="text"
                  value={withWhom}
                  onChange={(e) => setWithWhom(e.target.value)}
                  placeholder="Search friends to tag..."
                  className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-lg"
                />
                {withWhom && (
                  <button
                    type="button"
                    onClick={() => setWithWhom("")}
                    className="absolute text-gray-500 right-2 top-2 hover:text-gray-700"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
                {withWhom && filteredFriends.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredFriends.map((friend) => (
                      <div
                        key={friend.accId}
                        onClick={() => {
                          if (!taggedFriends.find(f => f.accId === friend.accId)) {
                            setTaggedFriends([...taggedFriends, friend]);
                          }
                          setWithWhom("");
                        }}
                        className="p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {friend.fullName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Original Post Display */}
            <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={postData.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full" 
                />
                <div>
                  <h3 className="font-bold">{renderTagFriends()}</h3>
                  <p className="text-sm text-gray-500">{formatTime(postData.createAt)}</p>
                </div>
              </div>

              <div className="flex flex-col items-start mt-3 text-sm">
                <p className="mb-2 text-[#7D7E9E] font-light">{postData.content}</p>
                
                {hashTags.length > 0 && (
                  <p className="mb-2 font-bold">
                    {hashTags.map((tag, index) => (
                      <span key={index} className="mr-2">#{tag}</span>
                    ))}
                  </p>
                )}

                {categories.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 font-bold">
                      Categories:
                      {categories.map((cat, index) => (
                        <span
                          key={index}
                          className="flex items-center px-2 py-1 font-normal text-gray-700 bg-gray-200 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              {postData.images && postData.images.length > 0 && (
                <div className="mt-3">
                  {postData.images.length === 3 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-2">
                        <img
                          src={postData.images[0]}
                          alt={postData.content}
                          className="object-cover w-full rounded-md h-24"
                        />
                        <img
                          src={postData.images[1]}
                          alt={postData.content}
                          className="object-cover w-full rounded-md h-24"
                        />
                      </div>
                      <img
                        src={postData.images[2]}
                        alt={postData.content}
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {postData.images.slice(0, 4).map((img, index) => {
                        const isLastVisible = index === 3 && postData.images.length > 4;
                        return (
                          <div
                            key={index}
                            className={`relative rounded-md overflow-hidden ${
                              postData.images.length === 1 ? "col-span-2" : ""
                            }`}
                          >
                            <img 
                              src={img} 
                              alt={postData.content} 
                              className="object-cover w-full h-24" 
                            />
                            {isLastVisible && (
                              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white bg-black bg-opacity-50">
                                +{postData.images.length - 4} more
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <img src={nam_like_icon} alt="like" className="h-4" />
                    {postData.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={nam_comment_icon} alt="comment" className="h-4" />
                    {postData.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={nam_share_icon} alt="share" className="h-4" />
                    {postData.shares}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="fa-solid fa-share mr-2"></i>
              SHARE POST
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SharePostPopup;