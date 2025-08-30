import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import default_avatar from "../../assets/images/default-avatar.png";

const ChatHistorySearch = ({ selectedChat, formatTime, currentUserId }) => {
    const [activeTab, setActiveTab] = useState("info"); // Tab hiện tại: info, files, media
    const [messages, setMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [errorMessages, setErrorMessages] = useState(null);
    const [errorProfile, setErrorProfile] = useState(null);
    const [fileSearch, setFileSearch] = useState({
        keyword: "",
        sender: "all", // all, me, other
        date: "",
    });
    const [mediaSearch, setMediaSearch] = useState({
        keyword: "",
        sender: "all",
        date: "",
    });

    // Fetch messages from API
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat?.receiverId) {
                setMessages([]);
                return;
            }

            setLoadingMessages(true);
            setErrorMessages(null);
            try {
                const response = await instance.get(`/api/chat/get-messages/${selectedChat.receiverId}`);
                if (response.data.success) {
                    setMessages(response.data.chatDetails || []);
                } else {
                    setErrorMessages(response.data.message || "Failed to load message.");
                    toast.error(response.data.message || "Failed to load message.");
                }
            } catch (error) {
                setErrorMessages("Failed to load message!");
                toast.error("Message loading failed! Please try again..");
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedChat]);

    // Fetch user profile from API
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!selectedChat?.receiverId) {
                setUserProfile(null);
                return;
            }

            setLoadingProfile(true);
            setErrorProfile(null);
            try {
                const response = await instance.get(`/api/account/profile-another/${selectedChat.receiverId}`);
                if (response.data.success) {
                    setUserProfile(response.data.data || {});
                } else {
                    setErrorProfile(response.data.message || "Failed  to load user information.");
                    toast.error(response.data.message || "Failed  to load user information.");
                }
            } catch (error) {
                setErrorProfile("Failed  to load user information!");
                toast.error("Failed  to load user information!");
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchUserProfile();
    }, [selectedChat]);

    // Filter files
    const filteredFiles = messages
        .filter((msg) => msg.fileUrl && msg.fileType !== "image" && !msg.isRecalled)
        .filter((msg) => {
            const matchesKeyword = msg.fileName
                ?.toLowerCase()
                .includes(fileSearch.keyword.toLowerCase());
            const matchesSender =
                fileSearch.sender === "all" ||
                (fileSearch.sender === "me" && msg.senderId === currentUserId) ||
                (fileSearch.sender === "other" && msg.senderId !== currentUserId);
            const matchesDate =
                !fileSearch.date ||
                new Date(msg.sendAt).toISOString().split("T")[0] === fileSearch.date;
            return matchesKeyword && matchesSender && matchesDate;
        });

    // Filter media (images/videos)
    const filteredMedia = messages
        .filter((msg) => msg.fileUrl && (msg.fileType === "image" || msg.fileType === "video") && !msg.isRecalled)
        .filter((msg) => {
            const matchesKeyword = msg.fileName
                ?.toLowerCase()
                .includes(mediaSearch.keyword.toLowerCase());
            const matchesSender =
                mediaSearch.sender === "all" ||
                (mediaSearch.sender === "me" && msg.senderId === currentUserId) ||
                (mediaSearch.sender === "other" && msg.senderId !== currentUserId);
            const matchesDate =
                !mediaSearch.date ||
                new Date(msg.sendAt).toISOString().split("T")[0] === mediaSearch.date;
            return matchesKeyword && matchesSender && matchesDate;
        });

    if (!selectedChat) {
        return (
            <div className="text-gray-600 text-sm text-center py-4">
                Select a conversation to view information
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center gap-3 p-3 border-b border-gray-200">
                <img
                    className="w-32 h-32 rounded-full object-cover"
                    src={selectedChat.senderAvatar || default_avatar}
                    alt={`${selectedChat.senderName} avatar`}
                />
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800">{selectedChat.senderName}</h3>
                    {/* <span className="text-sm text-gray-500">Đang hoạt động</span> */}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mt-2">
                <button
                    className={`flex-1 py-2 text-sm font-medium text-center ${activeTab === "info" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("info")}
                >
                    About
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium text-center ${activeTab === "files" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("files")}
                >
                    File
                </button>
                <button
                    className={`flex-1 py-2 text-sm font-medium text-center ${activeTab === "media" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("media")}
                >
                    Image/Video
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3">
                {loadingMessages || loadingProfile ? (
                    <div className="text-gray-600 text-sm text-center py-4">Loading...</div>
                ) : errorMessages || errorProfile ? (
                    <div className="text-red-600 text-sm text-center py-4">
                        {errorMessages || errorProfile}
                    </div>
                ) : (
                    <>
                        {activeTab === "info" && (
                            <div className="flex flex-col gap-4 text-left">
                                <div className="flex border border-solid border-gray-300 items-center p-3 gap-3 rounded">
                                    <div className="w-10">
                                        <i className="fa-solid fa-envelope p-2 fa-lg text-[#3DB3FB]"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-600">Email</p>
                                        <span className="text-sm text-gray-800">
                                            {userProfile?.email || "No information"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex border border-solid border-gray-300 items-center p-3 gap-3 rounded">
                                    <div className="w-10">
                                        <i className="fa-solid fa-venus-mars  w-10 p-2 fa-lg text-[#E74C3C]"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-600">Gender</p>
                                        <span className="text-sm text-gray-800">
                                            {userProfile?.gender || "No information"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex border border-solid border-gray-300 items-center p-3 gap-3 rounded">
                                    <div className="w-10">
                                        <i className="fa-solid fa-location-dot  w-10 p-2 fa-lg text-[#2BB673]"></i>
                                    </div><div>
                                        <p className="text-sm font-bold text-gray-600">Live in</p>
                                        <span className="text-sm text-gray-800">
                                            {userProfile?.city + ", " + userProfile?.country || "No information"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex border border-solid border-gray-300 items-center p-3 gap-3 rounded">
                                    <div className="w-10">
                                        <i className="fa-solid fa-graduation-cap  w-10 p-2 fa-lg text-[#F7941E]"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-600">Study At</p>
                                        <span className="text-sm text-gray-800">
                                            {userProfile?.studyAt || "No information"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex border border-solid border-gray-300 items-center p-3 gap-3 rounded">
                                    <div className="w-10">
                                        <i className="fa-solid fa-briefcase  w-10 p-2 fa-lg text-[#26ACE2]"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-600">Work At</p>
                                        <span className="text-sm text-gray-800">
                                            {userProfile?.workAt || "No information"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "files" && (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm file..."
                                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={fileSearch.keyword}
                                        onChange={(e) => setFileSearch({ ...fileSearch, keyword: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                                            value={fileSearch.sender}
                                            onChange={(e) => setFileSearch({ ...fileSearch, sender: e.target.value })}
                                        >
                                            <option value="all">All</option>
                                            <option value="me">You</option>
                                            <option value="other">{selectedChat.senderName}</option>
                                        </select>
                                        <input
                                            type="date"
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                                            value={fileSearch.date}
                                            onChange={(e) => setFileSearch({ ...fileSearch, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {filteredFiles.length > 0 ? (
                                    filteredFiles.map((file) => (
                                        <div
                                            key={file.chatDetailId}
                                            className="flex flex-col p-2 bg-gray-100 rounded-md"
                                        >
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 underline truncate"
                                            >
                                                {file.fileName || "File"}
                                            </a>
                                            <span className="text-xs text-gray-500">
                                                Send by {file.senderId === currentUserId ? "You" : selectedChat.senderName} at{" "}
                                                {formatTime(file.sendAt)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-600 text-sm text-center py-4">
                                        No files found
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "media" && (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search for photos/videos..."
                                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={mediaSearch.keyword}
                                        onChange={(e) => setMediaSearch({ ...mediaSearch, keyword: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                                            value={mediaSearch.sender}
                                            onChange={(e) => setMediaSearch({ ...mediaSearch, sender: e.target.value })}
                                        >
                                            <option value="all">All</option>
                                            <option value="me">You</option>
                                            <option value="other">{selectedChat.senderName}</option>
                                        </select>
                                        <input
                                            type="date"
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                                            value={mediaSearch.date}
                                            onChange={(e) => setMediaSearch({ ...mediaSearch, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {filteredMedia.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {filteredMedia.map((media) => (
                                            <div key={media.chatDetailId} className="flex flex-col">
                                                {media.fileType === "image" ? (
                                                    <a
                                                        href={media.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={media.fileUrl}
                                                            alt={media.fileName || "Media"}
                                                            className="w-full h-24 object-cover rounded-md"
                                                        />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={media.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <video
                                                            src={media.fileUrl}
                                                            className="w-full h-24 object-cover rounded-md"
                                                            controls
                                                        />
                                                    </a>
                                                )}
                                                <span className="text-xs text-gray-500 mt-1">
                                                    Send by {media.senderId === currentUserId ? "You" : selectedChat.senderName} at{" "}
                                                    {formatTime(media.sendAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-600 text-sm text-center py-4">
                                        No photos/videos found
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatHistorySearch;