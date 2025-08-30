import React, { useEffect, useState } from "react";
import MoreIcon from "../../assets/images/more_horiz.svg";
import namDeleteIcon from "../../assets/icons/nam_delete.svg";
import namEditIcon from "../../assets/icons/nam_edit.svg";
import namReportIcon from "../../assets/icons/nam_report_flag.svg";
import namSavePost from "../../assets/icons/nam_savepost.svg";
import { useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import ReportModal from "./ReportModal";

const OptionsPost = ({ isSavedPost, setIsSavedPost, onRestore, onHardDelete, isDeleted, onDeletePost, postIdParam, isOwnerParam, onUnsavedPost }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [postId, setPostId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm loading state

  useEffect(() => {
    setPostId(postIdParam);
    setIsOwner(isOwnerParam);
    const storedAccessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    // console.log("Access Token:", storedAccessToken); // Debug accessToken
    setAccessToken(storedAccessToken);
  }, [postIdParam, isOwnerParam]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.relative')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleReportClick = () => {
    setShowPopup(false);
    setShowReportModal(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
  };

  const handleSavedPost = async () => {
    if (isLoading) return; // Ngăn click liên tục
    setIsLoading(true);
    try {
      const response = await instance.post(
        `/api/post/saved-post/${postId}`, // Nhất quán endpoint với backend
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        setIsSavedPost(true);
        toast.success("Saved post successfully!");
        setShowPopup(false); // Đóng popup sau khi lưu
      }
    } catch (error) {
      console.error("Cannot call API save post:", error);
      toast.error("Error saving post.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsavedPost = async () => {
    if (isLoading) return; // Ngăn click liên tục
    setIsLoading(true);
    try {
      const response = await instance.delete(
        `/api/post/unsaved/${postId}`, // Nhất quán endpoint
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        setIsSavedPost(false);
        toast.success("Removed post from favorites successfully!");
        onUnsavedPost(postId);
        setShowPopup(false); // Đóng popup sau khi bỏ lưu
      }
    } catch (error) {
      console.error("Cannot call API unsave post:", error);
      toast.error("Error removing post from favorites.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This post will be moved to trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const response = await instance.delete(`/api/post/soft-delete/${postId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log(response.data)
        
        if (response.status === 200) {
          toast.success("Deleted successfully!");
          onDeletePost(postId);
        } else {
          toast.error("Delete failed!");
        }
      } catch (error) {
        console.error("Cannot delete post:", error);
        toast.error("Error deleting post.");
      }
    }
  };

  const handleRestorePost = async () => {
    try {
      const response = await instance.put(
        `/api/post/restore/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Restored successfully!");
        onRestore(postId);
      } else {
        toast.error("Restore failed!");
      }
    } catch (error) {
      console.error("Cannot restore post:", error);
      toast.error("Error restoring post.");
    }
  };

  const handleHardDeletePost = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        const response = await instance.delete(`/api/post/hard-delete/${postId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.status === 200) {
          toast.success("Permanently deleted successfully!");
          onHardDelete(postId);
        } else {
          toast.error("Permanent delete failed!");
        }
      } catch (error) {
        console.error("Cannot hard delete post:", error);
        toast.error("Error permanently deleting post.");
      }
    }
  };

  return (
    <div className="relative inline-block">
      <img
        src={MoreIcon}
        alt="More options"
        className="cursor-pointer"
        onClick={togglePopup}
      />

      {showPopup && (
        <div className="absolute right-0 mt-1 w-52 bg-white shadow-lg rounded-md p-2 border z-10 flex flex-col gap-2 outline outline-[0.5px] outline-gray-200">
          {isOwner ? (
            !isDeleted ? (
              <>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => navigate(`/EditPost/${postId}`)}>
                  <img src={namEditIcon} alt="edit" className="h-5" />
                  <p className="flex flex-col items-start gap-1">
                    Edit Post
                    <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                      Modify your post
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={handleDeletePost}>
                  <img src={namDeleteIcon} alt="delete" className="h-5" />
                  <p className="flex flex-col items-start gap-1">
                    Delete Post
                    <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                      Move to trash
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={handleRestorePost}>
                  <i className="fas fa-undo h-5"></i>
                  <p className="flex flex-col items-start gap-1">
                    Restore Post
                    <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                      Restore from trash
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={handleHardDeletePost}>
                  <img src={namDeleteIcon} alt="delete permanently" className="h-5" />
                  <p className="flex flex-col items-start gap-1">
                    Delete Permanently
                    <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                      Cannot be undone
                    </span>
                  </p>
                </div>
              </>
            )
          ) : (
            <>
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={isSavedPost ? handleUnsavedPost : handleSavedPost}
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
              >
                <img src={namSavePost} alt="save" className="h-5" />
                <p className="flex flex-col items-start gap-1">
                  {isSavedPost ? "Unsave Post" : "Save Post"}
                  <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                    {isSavedPost ? "Remove from favorites" : "Add to favorite posts"}
                  </span>
                </p>
              </div>
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={handleReportClick}
              >
                <img src={namReportIcon} alt="report" className="h-5" />
                <p className="flex flex-col items-start gap-1">
                  Report
                  <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                    Inappropriate content
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        postId={postId}
      />
    </div>
  );
};

export default OptionsPost;