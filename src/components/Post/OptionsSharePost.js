import React, { useEffect, useState } from "react";
import MoreIcon from "../../assets/images/more_horiz.svg";
import namDeleteIcon from "../../assets/icons/nam_delete.svg";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const OptionsSharePost = ({
    onRestore,
    onHardDelete,
    isDeleted,
    onDeletePost,
    sharePostIdParam,
    isOwnerParam
}) => {
    const [accessToken, setAccessToken] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [sharePostId, setSharePostId] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSharePostId(sharePostIdParam);
        setIsOwner(isOwnerParam);
        const storedAccessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        setAccessToken(storedAccessToken);
    }, [sharePostIdParam, isOwnerParam]);

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

    const handleDeleteSharePost = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This shared post will be moved to trash!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
        });

        if (result.isConfirmed) {
            if (isLoading) return;
            setIsLoading(true);
            try {
                const response = await instance.delete(`/api/share-post/soft-delete/${sharePostId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.status === 200) {
                    toast.success("Share post deleted successfully!");
                    onDeletePost(sharePostId);
                    setShowPopup(false);
                } else {
                    toast.error("Delete failed!");
                }
            } catch (error) {
                console.error("Cannot delete share post:", error);
                toast.error("Error deleting share post.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRestoreSharePost = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await instance.put(
                `/api/share-post/restore/${sharePostId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.status === 200) {
                toast.success("Share post restored successfully!");
                onRestore(sharePostId);
                setShowPopup(false);
            } else {
                toast.error("Restore failed!");
            }
        } catch (error) {
            console.error("Cannot restore share post:", error);
            toast.error("Error restoring share post.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHardDeleteSharePost = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete permanently!",
            cancelButtonText: "No, cancel!",
        });

        if (result.isConfirmed) {
            if (isLoading) return;
            setIsLoading(true);
            try {
                const response = await instance.delete(`/api/share-post/hard-delete/${sharePostId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.status === 200) {
                    toast.success("Share post permanently deleted successfully!");
                    onHardDelete(sharePostId);
                    setShowPopup(false);
                } else {
                    toast.error("Permanent delete failed!");
                }
            } catch (error) {
                console.error("Cannot hard delete share post:", error);
                toast.error("Error permanently deleting share post.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="relative inline-block">
            {isOwner && ( // ✅ Chỉ render Options nếu là owner
                <>
                    <img
                        src={MoreIcon}
                        alt="More options"
                        className="cursor-pointer"
                        onClick={togglePopup}
                    />

                    {showPopup && (
                        <div className="absolute right-0 mt-1 w-52 bg-white shadow-lg rounded-md p-2 border z-10 flex flex-col gap-2 outline outline-[0.5px] outline-gray-200">
                            {!isDeleted ? (
                                // Share post chưa xóa - chỉ có nút Delete
                                <div
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                    onClick={handleDeleteSharePost}
                                    style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                                >
                                    <img src={namDeleteIcon} alt="delete" className="h-5" />
                                    <p className="flex flex-col items-start gap-1">
                                        Delete Share Post
                                        <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                                            Move to trash
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                // Share post đã xóa - có nút Restore và Hard Delete
                                <>
                                    <div
                                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={handleRestoreSharePost}
                                        style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                                    >
                                        <i className="fas fa-undo h-5"></i>
                                        <p className="flex flex-col items-start gap-1">
                                            Restore Share Post
                                            <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                                                Restore from trash
                                            </span>
                                        </p>
                                    </div>
                                    <div
                                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                        onClick={handleHardDeleteSharePost}
                                        style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                                    >
                                        <img src={namDeleteIcon} alt="delete permanently" className="h-5" />
                                        <p className="flex flex-col items-start gap-1">
                                            Delete Permanently
                                            <span className="font-light text-[10px] text-[#9195AE] opacity-50">
                                                Cannot be undone
                                            </span>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );

};

export default OptionsSharePost;
