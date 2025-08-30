import React, { useEffect, useState } from "react";
import cancelIcon from "../../assets/images/cancel_vector.png";
import headLine from "../../assets/images/head_line.png";
import ChatList from "./ChatList";
import ChatDetails from "./ChatDetails";
import formatTime from "../../utils/formatTime";
import { Link } from "react-router-dom";
import { useSignalR } from "../../context/SignalRContext";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const ChatListPopup = ({ onToggle, isVisible }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [filterStatus, setFilterStatus] = useState("all");
    const { connection, currentUserId } = useSignalR();

    // Gọi API để lấy unreadChatCount khi component mount
    useEffect(() => {
        if (!currentUserId) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await instance.get("/api/chat/get-by-user");
                if (response.data.success) {
                    setUnreadChatCount(response.data.unreadChatCount || 0);
                }
            } catch (error) {
                console.error("Fetch unread count error:", error);
            }
        };

        fetchUnreadCount();
    }, [currentUserId]);

    // Xử lý sự kiện SignalR để cập nhật unreadChatCount
    useEffect(() => {
        if (!connection || !currentUserId) {
            return;
        }

        const receiveMessageHandler = (chatDetail, chatDTO) => {
            if (!chatDTO || !chatDTO.chatId || !chatDTO.receiver || !chatDTO.receiver.accId) {
                toast.warn("Invalid message data!");
                return;
            }
            const fetchUnreadCount = async () => {
                try {
                    const response = await instance.get("/api/chat/get-by-user");
                    if (response.data.success) {
                        setUnreadChatCount(response.data.unreadChatCount || 0);
                    }
                } catch (error) {
                    console.error("Fetch unread count error:", error);
                }
            };
            fetchUnreadCount();
        };

        const messageSeenHandler = (chatId, chatDTO) => {
            if (!chatId || !chatDTO || !chatDTO.chatId || !chatDTO.receiver || !chatDTO.receiver.accId) {
                return;
            }
            const fetchUnreadCount = async () => {
                try {
                    const response = await instance.get("/api/chat/get-by-user");
                    if (response.data.success) {
                        setUnreadChatCount(response.data.unreadChatCount || 0);
                    }
                } catch (error) {
                    console.error("Fetch unread count error:", error);
                }
            };
            fetchUnreadCount();
        };

        connection.on("ReceiveMessage", receiveMessageHandler);
        connection.on("MessageSeen", messageSeenHandler);

        return () => {
            connection.off("ReceiveMessage", receiveMessageHandler);
            connection.off("MessageSeen", messageSeenHandler);
        };
    }, [connection, currentUserId]);

    useEffect(() => {
        const handleClose = () => onToggle();
        window.addEventListener("closeChat", handleClose);
        return () => window.removeEventListener("closeChat", handleClose);
    }, [onToggle]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleCloseDetails = () => {
        setSelectedChat(null);
    };

    const handleUnreadCountChange = (count) => {
        setUnreadChatCount(count);
    };

    return (
        <div className="relative">
            <div
                className="chat-box"
                onClick={onToggle}
                role="button"
                aria-label="Toggle chats"
                aria-expanded={isVisible}
            >
                <i className={`fa-solid fa-comment ${isVisible ? "text-[#3DB3FB]" : ""}`}></i>
                <div className="chat-number">{unreadChatCount}</div>
            </div>

            {isVisible && (
                <div className="fixed md:right-5 right-0 top-16 max-w-sm z-[50] border border-gray-300 border-solid shadow-lg rounded-xl h-[90vh] overflow-y-auto">
                    <div className="w-full h-full p-4 pt-4 bg-white rounded-xl">
                        <div className="w-full flex justify-between items-center mx-auto px-4 sm:px-0 h-[35px]">
                            <div className="font-bold text-black text-[18px] leading-normal whitespace-nowrap">
                                Chats
                            </div>
                            <div
                                className="flex w-[35px] h-[35px] items-center justify-center gap-2.5 p-1.5 bg-[#c0bebe] rounded-full overflow-hidden cursor-pointer hover:bg-[#999999]"
                                onClick={onToggle}
                                role="button"
                                aria-label="Close chats"
                            >
                                <img className="w-[12.62px] h-[12.62px]" src={cancelIcon} alt="Close" />
                            </div>
                        </div>
                        <img className="w-full h-[1px] object-cover mt-3" src={headLine} alt="Header line" />
                        <div className="flex px-4 mt-3 sm:px-0">
                            <div className="flex flex-row gap-2">
                                <div
                                    className={`font-semibold text-gray-500 bg-gray-100 text-sm leading-normal whitespace-nowrap px-3.5 py-1.5 rounded-md cursor-pointer hover:bg-cyan-300 transition-colors duration-200 ${
                                        filterStatus === "all" ? "text-[#3DB3FB] bg-cyan-100" : ""
                                    }`}
                                    onClick={() => setFilterStatus("all")}
                                >
                                    All
                                </div>
                                <div
                                    className={`font-semibold text-gray-500 bg-gray-100 text-sm leading-normal whitespace-nowrap px-1.5 py-1.5 rounded-md cursor-pointer hover:bg-cyan-300 transition-colors duration-200 ${
                                        filterStatus === "unread" ? "text-[#3DB3FB] bg-cyan-100" : ""
                                    }`}
                                    onClick={() => setFilterStatus("unread")}
                                >
                                    Not read yet
                                </div>
                            </div>
                            <div className="flex items-end justify-end w-full pr-2">
                                <Link
                                    to="/Chats"
                                    className="font-semibold text-gray-500 text-[13px] leading-normal whitespace-nowrap cursor-pointer hover:text-[#344258] transition-colors duration-200"
                                >
                                    VIEW ALL
                                </Link>
                            </div>
                        </div>
                        <ChatList
                            onChatSelect={handleChatSelect}
                            onUnreadCountChange={handleUnreadCountChange}
                            filterStatus={filterStatus}
                        />
                    </div>
                </div>
            )}

            {selectedChat && (
                <div className="chat-details-container fixed md:bottom-3 md:right-20 bottom-0 right-0 z-[50] border border-gray-300 border-solid rounded-md shadow-lg md:h-[500px] max-w-sm">
                    <ChatDetails
                        isVisible={!!selectedChat}
                        onClose={handleCloseDetails}
                        chatId={selectedChat.chatId}
                        receiverId={selectedChat.receiverId}
                        senderName={selectedChat.senderName}
                        senderAvatar={selectedChat.senderAvatar}
                        formatTime={formatTime}
                        currentUserId={currentUserId}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatListPopup;