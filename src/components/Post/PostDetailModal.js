import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import default_avatar from "../../assets/images/default-avatar.png";
import nam_like_icon from "../../assets/icons/nam_like.svg";
import nam_comment_icon from "../../assets/icons/nam_comment.svg";
import nam_share_icon from "../../assets/icons/nam_share.svg";
import useReactions from "../../hooks/useReactions";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactionList from "../Reaction/ReactionList";
import SharePostPopup from "./SharePostPopup";
import CommentSection from "../Comment/CommentSection";
import CategoryReactionList from "../Reaction/CategoryReactionList";
import formatTime from "../../utils/formatTime";

const PostDetailModal = ({ postId, onClose }) => {
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLikeHovered, setIsLikeHovered] = useState(false);
    const [showReactionList, setShowReactionList] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const {
        likeCount,
        hasReacted,
        currentReaction,
        handleLikeClick,
        handleReact,
    } = useReactions({ entityType: "Post", entityId: postId });

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await instance.get(`/api/post/get-by-id/${postId}`);

                if (response.data.success) {
                    const { post: postData, ownerPost, postCategories, postImages, hashTags, postTags } = response.data.data;

                    const transformedPost = {
                        postId: postData.postId,
                        accId: ownerPost.accId,
                        fullName: ownerPost.fullName,
                        avatar: ownerPost.avatar || default_avatar,
                        createAt: postData.createdAt,
                        content: postData.postContent,
                        images: postImages?.map(img => img.imageUrl) || [],
                        hashtags: hashTags?.map(tag => tag.hashTagContent || tag) || [],
                        tagFriends: postTags || [],
                        categories: postCategories?.map(cat => cat.categoryName) || [],
                        likes: response.data.data.reactionCount || 0,
                        comments: response.data.data.commentCount || 0,
                        shares: response.data.data.shareCount || 0,
                    };

                    setPost(transformedPost);
                }
            } catch (err) {
                setError("Cannot load this post");
                console.error("Cannot load this post:", err);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClickToProfile = (accId) => {
        navigate(`/PersonalPage/${accId}`);
        onClose();
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === post.images.length - 1 ? 0 : prev + 1
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? post.images.length - 1 : prev - 1
        );
    };

    const handleCommentCountChange = (newCount) => {
        setPost((prevPost) => ({ ...prevPost, comments: newCount }));
    };

    const renderTagFriends = () => {
        const fullNameElement = (
            <span
                style={{ cursor: "pointer" }}
                onClick={() => handleClickToProfile(post.accId)}
                className="text-[#088DD0] hover:underline font-semibold"
            >
                {post.fullName}
            </span>
        );

        if (!post.tagFriends.length) return fullNameElement;

        if (post.tagFriends.length === 1) {
            return (
                <>
                    {fullNameElement}
                    <span className="text-gray-600">
                        <span className="text-gray-400 font-normal"> with </span>
                        <span
                            onClick={() => handleClickToProfile(post.tagFriends[0].accId)}
                            className="text-[#088DD0] hover:underline cursor-pointer"
                        >
                            {post.tagFriends[0].fullname}
                        </span>
                    </span>
                </>
            );
        }

        if (post.tagFriends.length === 2) {
            return (
                <>
                    {fullNameElement}
                    <span className="text-gray-600">
                        <span className="text-gray-400 font-normal"> with </span>
                        <span
                            onClick={() => handleClickToProfile(post.tagFriends[0].accId)}
                            className="text-[#088DD0] hover:underline cursor-pointer"
                        >
                            {post.tagFriends[0].fullname}
                        </span>
                        <span className="text-gray-400"> and </span>
                        <span
                            onClick={() => handleClickToProfile(post.tagFriends[1].accId)}
                            className="text-[#088DD0] hover:underline cursor-pointer"
                        >
                            {post.tagFriends[1].fullname}
                        </span>
                    </span>
                </>
            );
        }

        return (
            <>
                {fullNameElement}
                <span className="text-gray-600">
                    <span className="text-gray-400 font-normal"> with </span>
                    <span
                        onClick={() => handleClickToProfile(post.tagFriends[0].accId)}
                        className="text-[#088DD0] hover:underline cursor-pointer"
                    >
                        {post.tagFriends[0].fullname}
                    </span>
                    <span className="text-gray-400"> and {post.tagFriends.length - 1} more</span>
                </span>
            </>
        );
    };

    // Component riêng cho Interaction Buttons để tái sử dụng
    const InteractionButtons = ({ className = "", showStats = true }) => (
        <div className={`py-4 border-b border-gray-100 ${className}`}>
            {showStats && (
                <div className="flex justify-around mb-4 items-center">
                    <button
                        onClick={() => setShowReactionList(true)}
                        className="flex items-center group cursor-pointer gap-1"
                        title="View list of reactions"
                    >
                        <img
                            src={nam_like_icon}
                            alt="like"
                            className="h-6 w-6 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm text-gray-500 mt-1">{likeCount}</span>
                    </button>
                    <div className="flex items-center group cursor-pointer gap-1">
                        <img
                            src={nam_comment_icon}
                            alt="comment"
                            className="h-6 w-6 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm text-gray-500 mt-1">{post.comments}</span>
                    </div>
                    <div className="flex items-center group cursor-pointer gap-1">
                        <img
                            src={nam_share_icon}
                            alt="share"
                            className="h-6 w-6 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm text-gray-500 mt-1">{post.shares}</span>
                    </div>
                </div>
            )}
            <div className="flex justify-between gap-1">
                <div
                    className="relative flex-1"
                    onMouseEnter={() => setIsLikeHovered(true)}
                    onMouseLeave={() => setIsLikeHovered(false)}
                >
                    <button
                        onClick={handleLikeClick}
                        className="flex-1 p-2 text-center rounded-sm w-full flex items-center bg-gray-100 hover:bg-gray-200 h-9 justify-center text-xs"
                    >
                        {hasReacted ? (
                            <>
                                <img
                                    src={currentReaction.icon}
                                    alt={currentReaction.name}
                                    className="inline-block w-4 h-4 mr-1 object-contain"
                                    style={{ verticalAlign: "middle" }}
                                />
                                <span className="text-blue-600">{currentReaction.name}</span>
                            </>
                        ) : (
                            <>
                                <i className="mr-1 fa-solid fa-thumbs-up text-xs"></i>
                                <span>Like</span>
                            </>
                        )}
                    </button>
                    {isLikeHovered && <CategoryReactionList onReact={handleReact} />}
                </div>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 p-2 text-center bg-gray-100 rounded-sm hover:bg-gray-200 items-center h-9 text-xs"
                >
                    <i className="mr-1 fas fa-comment"></i>Comment
                </button>
                <button
                    onClick={() => setShowSharePopup(true)}
                    className="flex-1 p-2 text-center bg-gray-100 rounded-sm hover:bg-gray-200 items-center h-9 text-xs"
                >
                    <i className="mr-1 fa-solid fa-share"></i>Share
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Cannot find this post"}</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[1001] bg-black bg-opacity-75 flex items-center justify-center text-left"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-[100vw] w-full h-[100vh] md:max-w-[95vw] md:h-[95vh]  overflow-y-auto flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute md:top-8 md:right-14 top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                    title="Close"
                >
                    <X size={20} />
                </button>

                {/* Main Content */}
                <div className="flex flex-col w-full md:flex-row md:h-full">
                    {/* Mobile Layout */}
                    <div className="block md:hidden w-full">
                        {/* Avatar and Name - Mobile */}
                        <div className="p-4 flex items-center border-b border-gray-100">
                            <img
                                src={post.avatar}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full mr-3 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => handleClickToProfile(post.accId)}
                            />
                            <div className="flex-1">
                                <div className="text-sm leading-relaxed">{renderTagFriends()}</div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(post.createAt)}
                                </p>
                            </div>
                        </div>

                        {/* Post Content - Mobile */}
                        <div className="p-4 border-b border-gray-100">
                            {post.content && (
                                <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                            )}

                            {post.hashtags.length > 0 && (
                                <div className="mb-3 flex gap-1">
                                    <span className="text-sm font-medium text-gray-600">Hashtags:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {post.hashtags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="text-blue-500 text-sm hover:underline cursor-pointer"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {post.categories.length > 0 && (
                                <div className="flex gap-1 items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Categories:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {post.categories.map((cat, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Images - Mobile */}
                        {post.images.length > 0 && (
                            <div className="p-4">
                                <div className="relative bg-black rounded-lg overflow-hidden shadow-lg mb-4">
                                    {post.images.length > 1 && (
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}

                                    <img
                                        src={post.images[currentImageIndex]}
                                        alt={post.content}
                                        className="w-full h-64 sm:h-80 object-contain"
                                    />

                                    {post.images.length > 1 && (
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    )}

                                    {/* Image Counter */}
                                    {post.images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                            {currentImageIndex + 1} / {post.images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Section - Mobile */}
                                {post.images.length > 1 && (
                                    <div className="h-24 flex gap-2 overflow-x-auto items-center">
                                        {post.images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                className={`flex-shrink-0 w-20 h-20 object-cover rounded-md cursor-pointer transition-all ${
                                                    index === currentImageIndex
                                                        ? "border-4 border-blue-500 scale-110 shadow-lg"
                                                        : "border-2 border-gray-200 hover:border-blue-300"
                                                }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interaction Buttons - Mobile (sau khi images) */}
                        <div className="px-4">
                            <InteractionButtons className="border-b-0" />
                        </div>

                        {/* Comment Section - Mobile */}
                        {showComments && (
                            <div className="p-4 border-t border-gray-100">
                                <h4 className="font-medium text-gray-800 mb-3">Comments</h4>
                                <div className="max-h-64 overflow-y-auto">
                                    <CommentSection
                                        postId={post.postId}
                                        commentCount={post.comments}
                                        onCommentCountChange={handleCommentCountChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex md:w-full md:h-full">
                        {/* Left Section (Images) - Desktop */}
                        <div className="md:w-3/4 p-4 flex flex-col">
                            {/* Main Image Section */}
                            {post.images.length > 0 && (
                                <div className="flex-1 mb-4 relative bg-black rounded-lg overflow-hidden shadow-lg">
                                    {post.images.length > 1 && (
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}

                                    <img
                                        src={post.images[currentImageIndex]}
                                        alt={post.content}
                                        className="w-full h-full object-contain"
                                    />

                                    {post.images.length > 1 && (
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    )}

                                    {/* Image Counter */}
                                    {post.images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                            {currentImageIndex + 1} / {post.images.length}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Thumbnail Section */}
                            {post.images.length > 1 && (
                                <div className="h-24 flex gap-2 overflow-x-auto items-center">
                                    {post.images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={`flex-shrink-0 w-20 h-20 object-cover rounded-md cursor-pointer transition-all ${
                                                index === currentImageIndex
                                                    ? "border-4 border-blue-500 scale-110 shadow-lg"
                                                    : "border-2 border-gray-200 hover:border-blue-300"
                                            }`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Section (Details) - Desktop */}
                        <div className="md:w-1/4 p-4 flex flex-col border-l md:border-gray-200">
                            {/* Avatar and Name */}
                            <div className="flex items-center border-b border-gray-100 pb-4">
                                <img
                                    src={post.avatar}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full mr-3 cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => handleClickToProfile(post.accId)}
                                />
                                <div className="flex-1">
                                    <div className="text-sm leading-relaxed">{renderTagFriends()}</div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatTime(post.createAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="pt-4 border-b border-gray-100">
                                {post.content && (
                                    <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                                )}

                                {post.hashtags.length > 0 && (
                                    <div className="mb-3 flex gap-1">
                                        <span className="text-sm font-medium text-gray-600">Hashtags:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {post.hashtags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-blue-500 text-sm hover:underline cursor-pointer"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {post.categories.length > 0 && (
                                    <div className="flex gap-1 items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">Categories:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {post.categories.map((cat, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Interaction Buttons - Desktop */}
                            <InteractionButtons />

                            {/* Comment Section - Desktop */}
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-medium text-gray-800 mb-3">Comments</h4>
                                <div className="h-full overflow-y-auto">
                                    <CommentSection
                                        postId={post.postId}
                                        commentCount={post.comments}
                                        onCommentCountChange={handleCommentCountChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Popup and Reaction List */}
                {showSharePopup && (
                    <SharePostPopup
                        post={post}
                        onClose={() => setShowSharePopup(false)}
                        onSharedPost={(sharedPost) => {
                            console.log('Bài viết đã được chia sẻ:', sharedPost);
                            setPost((prevPost) => ({ ...prevPost, shares: prevPost.shares + 1 }));
                        }}
                    />
                )}
                <ReactionList
                    entityType="Post"
                    entityId={post.postId}
                    isOpen={showReactionList}
                    onClose={() => setShowReactionList(false)}
                />
            </div>
        </div>
    );
};

export default PostDetailModal;