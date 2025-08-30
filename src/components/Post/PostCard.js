import React, { useEffect, useState } from "react";
import OptionsPost from "./OptionsPost";
import CategoryReactionList from "../Reaction/CategoryReactionList";
import ReactionList from "../Reaction/ReactionList";
import CommentSection from "../Comment/CommentSection";
import formatTime from "../../utils/formatTime";
import useReactions from "../../hooks/useReactions";
import nam_like_icon from "../../assets/icons/nam_like.svg";
import nam_comment_icon from "../../assets/icons/nam_comment.svg";
import nam_share_icon from "../../assets/icons/nam_share.svg";
import { useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import default_avatar from "../../assets/images/default-avatar.png";
import PostDetailModal from "./PostDetailModal";
import SharePostPopup from "./SharePostPopup";

const PostCard = ({ onRestore, onHardDelete, isDeleted, onDeletePost, post, onCommentCountChange, onUnsavedPost }) => {
  const navigate = useNavigate();
  const accIdStorage = localStorage.getItem("accId") || sessionStorage.getItem("accId");
  const isOwner = (post.accId !== accIdStorage) ? false : true;
  const [isSavedPost, setIsSavedPost] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [showPostDetail, setShowPostDetail] = useState(false);

  const defaultPost = {
    accId: "",
    fullName: "Unknown User",
    avatar: default_avatar,
    createAt: "Unknown",
    content: null,
    images: null,
    hashtags: null,
    tagFriends: null,
    likes: 0,
    comments: 0,
    shares: 0,
  };

  useEffect(() => {
    const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAccesstoken = localStorage.getItem("accessToken");
    if (storedAccId) {
      setAccessToken(storedAccesstoken);
    }
  }, []);

  const postData = { ...defaultPost, ...post };
  const hashTags = postData.hashtags || [];
  const categories = postData.categories || [];
  const tagFriends = postData.tagFriends || [];

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(postData.comments);
  const [isLikeHovered, setIsLikeHovered] = useState(false);
  const [showReactionList, setShowReactionList] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const {
    likeCount,
    hasReacted,
    currentReaction,
    handleLikeClick,
    handleReact,
  } = useReactions({ entityType: "Post", entityId: postData.postId });

  const renderTagFriends = () => {
    const isVerified = postData.roleId === "68007b2a87b41211f0af1d57";
    const fullNameElement = (
      <span style={{ cursor: "pointer" }} onClick={() => handleClickToProfile(postData.accId)} className="text-[#088DD0]">
        {postData.fullName}
        {isVerified && (
          <>
            {" "}
            <i className="fa-solid fa-circle-check text-[#3db3fb]"></i>
          </>
        )}
      </span>
    );

    if (!tagFriends.length) return fullNameElement;

    if (tagFriends.length === 1) {
      return (
        <>
          {fullNameElement}
          <span className="text-black">
            <span className="text-gray-400 font-normal"> with </span>
            <span onClick={() => handleClickToProfile(tagFriends[0].accId)} style={{ cursor: "pointer" }}>
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
            <span onClick={() => handleClickToProfile(tagFriends[0].accId)} style={{ cursor: "pointer" }}>
              {tagFriends[0].fullname}
            </span>{" "}
            and
            <span onClick={() => handleClickToProfile(tagFriends[1].accId)} style={{ cursor: "pointer" }}>
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
          <span onClick={() => handleClickToProfile(tagFriends[0].accId)} style={{ cursor: "pointer" }}>
            {tagFriends[0].fullname}
          </span>{" "}
          and {tagFriends.length - 1} more
        </span>
      </>
    );
  };

  const handleClickToProfile = (accId) => {
    navigate(`/PersonalPage/${accId}`);
  };

  const handleImageClick = () => {
    setShowPostDetail(true);
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentCountChange = (newCount) => {
    if (newCount !== commentCount) {
      setCommentCount(newCount);
      onCommentCountChange(newCount);
    }
  };

  useEffect(() => {
    const checkIsSavedPost = async () => {
      try {
        const response = await instance.get(`/api/post/check-saved/${post.postId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (response.status === 200) {
          setIsSavedPost(response.data);
        }
      } catch (error) {
        console.log("Cannot check saved posts: " + error);
        setIsSavedPost(false);
      }
    };

    if (accessToken) {
      checkIsSavedPost();
    }
  }, [post?.postId, accessToken]);

  return (
    <>
      <div className="p-4 text-left bg-white border border-gray-200 border-solid rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
            <OptionsPost
              isSavedPost={isSavedPost}
              setIsSavedPost={setIsSavedPost}
              onRestore={onRestore}
              onUnsavedPost={onUnsavedPost}
              onHardDelete={onHardDelete}
              isDeleted={isDeleted}
              onDeletePost={onDeletePost}
              postIdParam={postData.postId}
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
          <div className="flex items-center gap-2 mb-2">
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 font-bold">
                Danh mục:
                {categories.map((cat, index) => (
                  <span
                    key={index}
                    className="flex items-center px-2 py-1 font-normal text-gray-700 bg-gray-200 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {postData.images && postData.images.length > 0 && (
          <>
            {postData.images.length === 3 ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex flex-col gap-2">
                  <img
                    src={postData.images[0]}
                    alt={postData.content}
                    className="object-cover w-full rounded-md h-1/2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                  />
                  <img
                    src={postData.images[1]}
                    alt={postData.content}
                    className="object-cover w-full rounded-md h-1/2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleImageClick}
                  />
                </div>
                <img
                  src={postData.images[2]}
                  alt={postData.content}
                  className="object-cover w-full h-full rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleImageClick}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {postData.images.slice(0, 4).map((img, index) => {
                  const isLastVisible = index === 3 && postData.images.length > 4;
                  return (
                    <div
                      key={index}
                      className={`relative rounded-md overflow-hidden ${postData.images.length === 1 ? "col-span-2" : ""}`}
                    >
                      <img
                        src={img}
                        alt={postData.content}
                        className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={handleImageClick}
                      />
                      {isLastVisible && (
                        <div
                          className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white bg-black bg-opacity-50 hover:bg-opacity-60 transition-all cursor-pointer"
                          onClick={handleImageClick}
                        >
                          +{postData.images.length - 4} more
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        <div className="flex flex-col items-center justify-between gap-3 lg:flex-row lg:gap-8 pb-4">
          <div className="flex justify-around w-full lg:w-1/4 lg:justify-between">
            <button
              onClick={() => setShowReactionList(true)}
              className="cursor-pointer hover:underline"
              title="View list of reactions"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
            >
              <img src={nam_like_icon} alt="like" className="h-5" /> {likeCount}
            </button>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <img src={nam_comment_icon} alt="comment" className="h-5" /> {commentCount > 0 ? commentCount : 0}
            </p>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <img src={nam_share_icon} alt="share" className="h-5" /> {postData.shares}
            </p>
          </div>
          <div className="flex justify-between w-full gap-1 lg:w-3/4 items-center text-sm">
            <div
              className="relative flex-1"
              onMouseEnter={() => setIsLikeHovered(true)}
              onMouseLeave={() => setIsLikeHovered(false)}
            >
              <button
                onClick={handleLikeClick}
                className="flex-1 p-2 text-center rounded-sm w-full flex items-center bg-gray-100 hover:bg-gray-200 h-9 justify-center"
              >
                {hasReacted ? (
                  <>
                    <img
                      src={currentReaction.icon}
                      alt={currentReaction.name}
                      className="inline-block w-5 h-5 mr-1 object-contain"
                      style={{ verticalAlign: "middle" }}
                    />
                    <span className="text-blue-600">{currentReaction.name}</span>
                  </>
                ) : (
                  <>
                    <i className="mr-2 fa-solid fa-thumbs-up"></i>
                    <span>Like</span>
                  </>
                )}
              </button>
              {isLikeHovered && <CategoryReactionList onReact={handleReact} />}
            </div>
            <button
              className="flex-1 p-2 text-center bg-gray-100 rounded-sm hover:bg-gray-200 items-center h-9"
              onClick={handleToggleComments}
            >
              <i className="mr-2 fas fa-comment w-5 h-5"></i>Comment
            </button>
            <button
              onClick={() => setShowSharePopup(true)}
              className="flex-1 p-2 text-center bg-gray-100 rounded-sm hover:bg-gray-200 items-center h-9"
            >
              <i className="mr-2 fa-solid fa-share w-5 h-5"></i>Share
            </button>
          </div>
        </div>
        {showSharePopup && (
          <SharePostPopup
            post={postData}
            onClose={() => setShowSharePopup(false)}
            onSharedPost={(sharedPost) => {
              console.log('Post has been shared:', sharedPost);
            }}
          />
        )}
        {showComments && (
          <CommentSection
            postId={postData.postId}
            commentCount={commentCount}
            onCommentCountChange={handleCommentCountChange}
          />
        )}
        <ReactionList
          entityType="Post"
          entityId={postData.postId}
          isOpen={showReactionList}
          onClose={() => setShowReactionList(false)}
        />
      </div>
      {showPostDetail && (
        <PostDetailModal
          postId={postData.postId}
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </>
  );
};

export default PostCard;