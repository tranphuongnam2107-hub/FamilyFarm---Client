import React, { useState, useEffect } from "react";
import { getOwnProfile } from "../../services/accountService";
import instance from "../../Axios/axiosConfig";
import { toast, Bounce } from "react-toastify";
import CommentItem from "./CommentItem";
import Swal from "sweetalert2";

const CommentSection = ({ postId, commentCount, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [menuOpenCommentId, setMenuOpenCommentId] = useState(null);
  const MAX_COMMENT_LENGTH = 1000;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!postId) {
          throw new Error("postId không hợp lệ");
        }
        const response = await instance.get(`/api/comment/all-by-post/${postId}`);
        if (response.data.success) {
          const commentData = Array.isArray(response.data.data) ? response.data.data : [];
          const formattedComments = commentData.map((item) => ({
            CommentId: item.comment.commentId,
            AccId: item.comment.accId,
            PostId: item.comment.postId,
            Content: item.comment.content,
            CreateAt: item.comment.createAt,
            IsDeleted: item.comment.isDeleted,
            fullName: item.account?.fullName || "Unknown User",
            avatar: item.account?.avatar,
            likes: item.reactionsOfComment?.length || 0,
            reactionType: null,
          }));
          setComments(formattedComments);
          // Không cập nhật commentCount từ API vì đã có initialCommentCount
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        toast.error(error.message || "Cannot load comments!");
        setComments([]);
      }
    };

    const storage = localStorage.getItem("accId") ? localStorage : sessionStorage;
    const accId = storage.getItem("accId");
    if (accId) {
      setUserId(accId);
    } else {
      toast.error("Please log in!");
    }

    if (postId) {
      fetchComments();
    } else {
      console.warn("postId is undefined or null");
      setComments([]);
    }
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (newComment.length > MAX_COMMENT_LENGTH) {
      toast.error(`Bình luận không được vượt quá ${MAX_COMMENT_LENGTH} ký tự`);
      return;
    }

    try {
      const response = await instance.post("/api/comment/create", {
        PostId: postId,
        Content: newComment,
      });
      console.log("Create comment response:", response.data);

      if (response.data.success) {
        const newCommentData = response.data.data;
        const profile = await getOwnProfile();
        console.log("New comment profile:", profile.data);
        const formattedNewComment = {
          CommentId: newCommentData.commentId,
          AccId: newCommentData.accId,
          PostId: newCommentData.postId,
          Content: newCommentData.content,
          CreateAt: newCommentData.createAt,
          IsDeleted: newCommentData.isDeleted,
          fullName: profile.data.fullName || "Unknown User",
          avatar: profile.data.avatar,
          likes: 0,
          reactionType: null,
        };
        setComments([...comments, formattedNewComment]);
        setNewComment("");
        onCommentCountChange(commentCount + 1);
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error(error.message || "Cannot create comment");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.CommentId);
    setEditContent(comment.Content);
    setMenuOpenCommentId(null);
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const response = await instance.put(`/api/comment/update/${commentId}`, {
        postId: postId,
        content: editContent,
      });
      console.log("Update comment response:", response.data);

      if (response.data.success) {
        setComments(
          comments.map((comment) =>
            comment.CommentId === commentId
              ? { ...comment, Content: editContent }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditContent("");
      } else {
        throw new Error(response.data.message || "Cannot update comment");
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error(error.message || "Cannot update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await instance.delete(`/api/comment/delete/${commentId}`);
        console.log("Delete comment response:", response.data);

        if (response.data.success) {
          setComments((prev) =>
            prev.filter((comment) => comment.CommentId !== commentId)
          );
          onCommentCountChange(commentCount - 1);
          setMenuOpenCommentId(null);

          toast.success("Your comment has been deleted.")
        } else {
          throw new Error(response.data.message || "Cannot delete comment");
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
        toast.error(error.message || "Cannot delete comment")
      }
    }
  };

  const toggleMenu = (commentId) => {
    setMenuOpenCommentId(menuOpenCommentId === commentId ? null : commentId);
  };

  const sortedComments = [...comments].sort(
    (b, a) => new Date(a.CreateAt) - new Date(b.CreateAt)
  );

  return (
    <div className="border-t border-gray-200">
      <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <CommentItem
              key={comment.CommentId}
              comment={comment}
              userId={userId}
              editingCommentId={editingCommentId}
              editContent={editContent}
              setEditingCommentId={setEditingCommentId}
              setEditContent={setEditContent}
              menuOpenCommentId={menuOpenCommentId}
              toggleMenu={toggleMenu}
              handleUpdateComment={handleUpdateComment}
              handleEditComment={handleEditComment}
              handleDeleteComment={handleDeleteComment}
              hoveredCommentId={hoveredCommentId}
              setHoveredCommentId={setHoveredCommentId}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </div>
      <form
        onSubmit={handleSubmitComment}
        className="mt-4 flex flex-col gap-1 comment-input"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={MAX_COMMENT_LENGTH}
          />
          <button
            type="submit"
            className="p-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={!newComment.trim()}
          >
            Send
          </button>
        </div>
        <div className="text-right text-xs text-gray-500">
          {newComment.length}/{MAX_COMMENT_LENGTH} characters
        </div>
      </form>
    </div>
  );
};

export default CommentSection;