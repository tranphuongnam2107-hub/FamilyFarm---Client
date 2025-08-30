import React, { useState } from "react";
import formatTime from "../../utils/formatTime";
import CategoryReactionList from "../Reaction/CategoryReactionList";
import ReactionList from "../Reaction/ReactionList"; // Import ReactionList
import useReactions from "../../hooks/useReactions";
import { toast } from "react-toastify";

const CommentItem = ({
    comment,
    userId,
    editingCommentId,
    editContent,
    setEditingCommentId,
    setEditContent,
    menuOpenCommentId,
    toggleMenu,
    handleUpdateComment,
    handleEditComment,
    handleDeleteComment,
    hoveredCommentId,
    setHoveredCommentId,
}) => {
    const {
        likeCount,
        hasReacted,
        currentReaction,
        handleLikeClick,
        handleReact,
    } = useReactions({ entityType: "Comment", entityId: comment.CommentId });

    const [showReactionList, setShowReactionList] = useState(false); // State for ReactionList visibility
    const MAX_COMMENT_LENGTH = 1000;

    return (
        <div key={comment.CommentId} className="flex items-start gap-2 relative">
            <img
                src={comment.avatar}
                alt={comment.fullName || "User"}
                className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
                {editingCommentId === comment.CommentId ? (
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none"
                            rows={3}
                            maxLength={MAX_COMMENT_LENGTH}
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {editContent.length}/{MAX_COMMENT_LENGTH} ký tự
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => {
                                    if (!editContent.trim()) {
                                        toast.info("Content cannot be empty!");
                                        return;
                                    }
                                    if (editContent.length > MAX_COMMENT_LENGTH) {
                                        toast.info(`Content must not exceed ${MAX_COMMENT_LENGTH} characters`);
                                        return;
                                    }
                                    handleUpdateComment(comment.CommentId);
                                }}
                                className="text-sm text-white bg-blue-500 px-3 py-1 rounded-md"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingCommentId(null)}
                                className="text-sm text-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-gray-800">
                                    {comment.fullName || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatTime(comment.CreateAt)}
                                </p>
                            </div>
                            {comment.AccId === userId && (
                                <div className="relative">
                                    <button
                                        onClick={() => toggleMenu(comment.CommentId)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    {menuOpenCommentId === comment.CommentId && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                            <button
                                                onClick={() => handleEditComment(comment)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <i className="fa-solid fa-pen"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.CommentId)}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                               <i className="fa-solid fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1 break-all">{comment.Content}</p>
                    </div>
                )}
                <div className="flex items-center gap-3 mt-2 comment-actions">
                    <div
                        className="relative flex"
                        onMouseEnter={() => setHoveredCommentId(comment.CommentId)}
                        onMouseLeave={() => setHoveredCommentId(null)}
                    >
                        {/* Like/Reaction button */}
                        <button
                            onClick={handleLikeClick}
                            className="text-sm text-gray-500 hover:text-blue-500 flex items-center min-w-[80px]"
                        >
                            {hasReacted ? (
                                <>
                                    <img
                                        src={currentReaction.icon}
                                        alt={currentReaction.name}
                                        className="inline-block w-4 h-4 mr-1"
                                    />
                                    <span className="text-blue-500">{currentReaction.name}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-thumbs-up mr-1"></i>
                                    <span>Like</span>
                                </>
                            )}
                        </button>

                        {/* Reaction count button */}
                        {likeCount > 0 && (
                            <button
                                onClick={() => setShowReactionList(true)}
                                className="text-blue-500 mr-2 cursor-pointer hover:underline"
                                title="View list of reactions"
                            >
                                <i className="fa-solid fa-thumbs-up"></i> {likeCount}
                            </button>
                        )}
                        {hoveredCommentId === comment.CommentId && (
                            <CategoryReactionList onReact={handleReact} />
                        )}
                    </div>
                </div>
                {/* Render ReactionList for comments */}
                <ReactionList
                    entityType="Comment"
                    entityId={comment.CommentId}
                    isOpen={showReactionList}
                    onClose={() => setShowReactionList(false)}
                />
            </div>
        </div>
    );
};

export default CommentItem;