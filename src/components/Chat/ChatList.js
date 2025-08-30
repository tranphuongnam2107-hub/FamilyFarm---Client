import React, { useState, useEffect } from "react";
import lineShape from "../../assets/images/border_line.png";
import formatTime from "../../utils/formatTime";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import default_avatar from "../../assets/images/default-avatar.png";
import "react-toastify/dist/ReactToastify.css";
import { useSignalR } from "../../context/SignalRContext";
import Swal from "sweetalert2";

const ChatList = ({ onChatSelect = () => {}, onUnreadCountChange = () => {}, filterStatus = "all" }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredChatId, setHoveredChatId] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const { connection, currentUserId, updateCurrentUserId } = useSignalR();

    useEffect(() => {
        if (!currentUserId && localStorage.getItem("accId")) {
            if (updateCurrentUserId) {
                updateCurrentUserId();
            }
            return;
        }

        const fetchChats = async () => {
            setLoading(true);
            try {
                const response = await instance.get("/api/chat/get-by-user");
                if (response.data.success) {
                    const validChats = (response.data.chats || []).filter(
                        (chat) => chat && chat.chatId && chat.receiver && chat.receiver.accId
                    );
                    setChats(validChats);
                    onUnreadCountChange(response.data.unreadChatCount || 0);
                }
            } catch (error) {
                console.error("Fetch chats error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [currentUserId, onUnreadCountChange, updateCurrentUserId]);

    useEffect(() => {
        if (!connection) {
            return;
        }
        if (connection.state === "Connected") {
            const receiveMessageHandler = (chatDetail, chatDTO) => {
                if (!chatDTO || !chatDTO.chatId || !chatDTO.receiver || !chatDTO.receiver.accId) {
                    toast.warn("Received invalid message data");
                    return;
                }
                setChats((prevChats) => {
                    const existingChat = prevChats.find((c) => c.chatId === chatDTO.chatId);
                    let updatedChats;
                    if (existingChat) {
                        updatedChats = prevChats.map((c) =>
                            c.chatId === chatDTO.chatId
                                ? { ...c, ...chatDTO, unreadCount: (c.unreadCount || 0) + 1 }
                                : c
                        );
                    } else {
                        updatedChats = [chatDTO, ...prevChats];
                    }
                    return updatedChats.sort((a, b) => {
                        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
                        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
                        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
                    });
                });
            };

            connection.on("ReceiveMessage", receiveMessageHandler);
            connection.on("MessageSeen", (chatId, chatDTO) => {
                if (!chatId || !chatDTO || !chatDTO.chatId || !chatDTO.receiver || !chatDTO.receiver.accId) {
                    return;
                }
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.chatId === chatId ? { ...chat, ...chatDTO } : chat
                    )
                );
            });

            connection.on("ChatRecalled", (chatId, chatDetailId, chatDTO) => {
                if (!chatId || !chatDTO || !chatDTO.chatId || !chatDTO.receiver || !chatDTO.receiver.accId) {
                    return;
                }
                setChats((prevChats) =>
                    prevChats.map((chat) =>
                        chat.chatId === chatId ? { ...chat, ...chatDTO } : chat
                    )
                );
            });

            connection.on("ChatHistoryDeleted", (chatId) => {
                if (!chatId) {
                    return;
                }
                setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
                toast.info("Chat history has been deleted.");
            });

            return () => {
                connection.off("ReceiveMessage", receiveMessageHandler);
                connection.off("MessageSeen");
                connection.off("ChatRecalled");
                connection.off("ChatHistoryDeleted");
            };
        }
    }, [connection]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.chat-dropdown')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDropdown]);

    const handleDeleteChatHistory = async (chatId) => {
        const result = await Swal.fire({
            title: 'Delete chat history?',
            text: "Are you sure you want to delete this entire chat history? This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await instance.delete(`/api/chat/delete-history/${chatId}`);
                setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
                toast.success("Delete chat history successfully!");
            } catch (error) {
                toast.error("Delete chat history failed!");
                console.error("Delete chat history error:", error);
            }
        }
        setActiveDropdown(null);
    };

    const filteredChats = chats.filter((chat) => {
        const matchesSearch = chat && chat.receiver && chat.receiver.fullName
            ? chat.receiver.fullName.toLowerCase().includes(searchQuery.toLowerCase())
            : false;
        const matchesFilter = filterStatus === "unread" ? chat.unreadCount > 0 : true;
        return matchesSearch && matchesFilter;
    });

    const handleChatClick = (chat) => {
        if (!chat || !chat.receiver || !chat.receiver.accId) {
            toast.warn("Invalid chat data!");
            return;
        }
        onChatSelect({
            chatId: chat.chatId,
            receiverId: chat.receiver.accId,
            senderName: chat.receiver.fullName || chat.receiver.username || "Unknown User",
            senderAvatar: chat.receiver.avatar || default_avatar,
        });
    };

    if (!currentUserId) {
        return <div className="text-center py-4">Please log in to view chats</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full gap-3 mx-auto mt-3 chat-list">
            <div className="w-full">
                <div className="relative">
                    <i className="absolute text-gray-500 transform -translate-y-1/2 fa-solid fa-magnifying-glass left-3 top-1/2"></i>
                    <input
                        type="text"
                        placeholder="Search chats by name"
                        className="w-full rounded-full pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3DB3FB]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search chats"
                    />
                </div>
            </div>
            {loading ? (
                <div className="text-[#344258] text-[13px] text-center py-4">Loading...</div>
            ) : filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                    <div key={chat.chatId} className="flex flex-col items-start w-full gap-3">
                        <div
                            className="flex items-center w-full gap-2 cursor-pointer relative"
                            onMouseEnter={() => setHoveredChatId(chat.chatId)}
                            onMouseLeave={() => setHoveredChatId(null)}
                            role="button"
                            aria-label={`Open chat with ${chat.receiver?.fullName || "User"}`}
                        >
                            <div
                                className="flex items-center flex-grow gap-2"
                                onClick={() => handleChatClick(chat)}
                            >
                                <img
                                    className="object-cover rounded-full w-11 h-11"
                                    src={chat.receiver?.avatar || default_avatar}
                                    alt={`${chat.receiver?.fullName || "User"} avatar`}
                                />
                                <div className="flex flex-col items-start justify-center flex-grow gap-1 rich-text-editor">
                                    <div className="text-[#344258] text-left text-[14px]">
                                        <p className="font-semibold cursor-pointer hover:text-[#3DB3FB] transition-colors duration-200">
                                            {chat.receiver?.fullName || "Unknown User"}
                                        </p>
                                        <div className="text-[12px] mt-1 truncate max-w-[200px] overflow-hidden whitespace-nowrap">
                                            {chat.lastMessageAccId === currentUserId ? (
                                                <span className="flex line-clamp-2 break-all w-fit overflow-hidden">
                                                    You: <span dangerouslySetInnerHTML={{ __html: chat.lastMessage || "" }} />
                                                </span>
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: chat.lastMessage || "" }} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="font-semibold text-[#A2A5B9] text-right text-xs min-w-[48px] h-full flex flex-col items-end gap-2">
                                {hoveredChatId === chat.chatId ? (
                                    <div className="relative chat-dropdown">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === chat.chatId ? null : chat.chatId);
                                            }}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                            aria-label="Chat options"
                                        >
                                            <i className="fas fa-ellipsis-v text-gray-500"></i>
                                        </button>
                                        {activeDropdown === chat.chatId && (
                                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-10">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteChatHistory(chat.chatId);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors text-sm"
                                                >
                                                    <i className="fas fa-trash mr-2"></i>
                                                    Delete chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span>{formatTime(chat.lastMessageAt)}</span>
                                )}
                                {chat.unreadCount > 0 ? (
                                    <div className="flex items-center justify-center w-4 h-4 text-[10px] text-white bg-red-400 rounded-full cursor-pointer shrink-0 hover:bg-red-600">
                                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-4 h-4"></div>
                                )}
                            </div>
                        </div>
                        <img className="w-full h-[1px] mb-[-0.94px]" src={lineShape} alt="Separator" />
                    </div>
                ))
            ) : (
                <div className="text-[#344258] text-[13px] text-center py-4">No chats found</div>
            )}
        </div>
    );
};

export default ChatList;