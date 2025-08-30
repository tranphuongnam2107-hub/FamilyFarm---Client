import React from "react";
import OptionsSharePost from "./OptionsSharePost"; // Import component mới
import PostCard from "./PostCard";
import formatTime from "../../utils/formatTime";
import { useNavigate } from "react-router-dom";
import default_avatar from "../../assets/images/default-avatar.png";

const SharePostCard = ({ 
  post, 
  isDeleted = false, 
  onRestore, 
  onHardDelete, 
  onDeletePost 
}) => {
  const navigate = useNavigate();
  const accIdStorage = localStorage.getItem("accId") || sessionStorage.getItem("accId");
  
  // Xử lý dữ liệu SharePost từ API
  const sharePostData = post.sharePostData || {};
  const sharePost = sharePostData.sharePost || {};
  const ownerSharePost = sharePostData.ownerSharePost || {};
  const originalPost = sharePostData.originalPost || {};
  
  // Kiểm tra xem user hiện tại có phải là owner của SharePost không
  const isOwner = ownerSharePost.accId === accIdStorage;

  // Map dữ liệu SharePost theo cấu trúc API
  const postData = {
    accId: ownerSharePost.accId || "",
    sharePostId: sharePost.sharePostId || "", // Thêm sharePostId
    fullName: ownerSharePost.fullName || "Unknown User",
    avatar: ownerSharePost.avatar || default_avatar,
    createAt: sharePost.createdAt || sharePost.updatedAt || "Unknown",
    content: sharePost.sharePostContent || null,
    hashtags: sharePostData.hashTags?.map(tag => tag.hashTagContent) || [],
    tagFriends: sharePostData.sharePostTags || [],
    likes: sharePostData.reactionCount || 0,
    comments: sharePostData.commentCount || 0,
    shares: sharePostData.shareCount || 0,
    sharedPost: originalPost
  };

  const originalPostForCard = originalPost.post ? {
    accId: originalPost.ownerPost?.accId || "",
    postId: originalPost.post.postId,
    fullName: originalPost.ownerPost?.fullName || "Unknown User",
    avatar: originalPost.ownerPost?.avatar || default_avatar,
    createAt: originalPost.post.createdAt,
    content: originalPost.post.postContent,
    images: originalPost.postImages?.map((img) => img.imageUrl) || [],
    hashtags: originalPost.hashTags?.map((tag) => tag.hashTagContent) || [],
    tagFriends: originalPost.postTags?.map((tag) => ({
      accId: tag.accId,
      fullname: tag.fullname || tag.username || "Unknown",
    })) || [],
    categories: originalPost.postCategories?.map((cat) => cat.categoryName) || [],
    likes: originalPost.reactionCount || 0,
    comments: originalPost.commentCount || 0,
    shares: originalPost.shareCount || 0,
  } : null;

  const hashTags = postData.hashtags || [];
  const tagFriends = postData.tagFriends || [];

  // Hàm hiển thị tagFriends theo định dạng yêu cầu - giống như trong PostCard
  const renderTagFriends = () => {
    const fullNameElement = (
      <span 
        style={{ cursor: "pointer" }} 
        onClick={() => handleClickToProfile(postData.accId)} 
        className="text-[#088DD0]"
      >
        {postData.fullName}
      </span>
    );

    if (!tagFriends.length) return fullNameElement;

    if (tagFriends.length === 1) {
      return (
        <>
          {fullNameElement}
          <span className="text-black">
            <span className="text-gray-400 font-normal"> with </span> 
            <span 
              onClick={() => handleClickToProfile(tagFriends[0].accId)} 
              style={{ cursor: "pointer" }}
            >
              {tagFriends[0].fullname}
            </span>
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
            <span 
              onClick={() => handleClickToProfile(tagFriends[0].accId)} 
              style={{ cursor: "pointer" }}
            >
              {tagFriends[0].fullname}
            </span> 
            and 
            <span 
              onClick={() => handleClickToProfile(tagFriends[1].accId)} 
              style={{ cursor: "pointer" }}
            >
              {tagFriends[1].fullname}
            </span>
          </span>
        </>
      );
    }

    return (
      <>
        {fullNameElement}
        <span className="text-black">
          <span className="text-gray-400 font-normal"> with </span> 
          <span 
            onClick={() => handleClickToProfile(tagFriends[0].accId)} 
            style={{ cursor: "pointer" }}
          >
            {tagFriends[0].fullname}
          </span> 
          and {tagFriends.length - 1} more
        </span>
      </>
    );
  };

  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`);
  };

  return (
    <div className="p-4 text-left bg-white border border-gray-200 border-solid rounded-lg shadow-md">
      <div className="flex justify-between">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={postData.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
            style={{ cursor: "pointer" }}
            onClick={() => handleClickToProfile(postData.accId)}
          />
          <div>
            <h3 className="font-bold">{renderTagFriends()}</h3>
            <p className="text-sm text-gray-500">{formatTime(postData.createAt)}</p>
          </div>
        </div>
        <div>
          {/* Sử dụng OptionsSharePost thay vì OptionsPost */}
          <OptionsSharePost
            onRestore={onRestore}
            onHardDelete={onHardDelete}
            isDeleted={isDeleted}
            onDeletePost={onDeletePost}
            sharePostIdParam={postData.sharePostId}
            isOwnerParam={isOwner}
          />
        </div>
      </div>
      
      <div className="flex flex-col items-start mt-3 text-sm">
        <p className="mb-2 text-[#7D7E9E] font-light">{postData.content}</p>
        {hashTags.length > 0 && (
          <p className="mb-2 font-bold">
            <span>HashTags: </span>
            {hashTags.map((tag, index) => (
              <span key={index} className="mr-2">#{tag}</span>
            ))}
          </p>
        )}
      </div>
      
      {originalPostForCard && (
        <div className="border border-gray-300 rounded-lg mt-3">
          <PostCard post={originalPostForCard} />
        </div>
      )}
    </div>
  );
};

export default SharePostCard;