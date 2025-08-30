import React, { useState, useEffect } from "react";
import ChatDetails from "../../components/Chat/ChatDetails";
import ChatList from "../../components/Chat/ChatList";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import formatTime from "../../utils/formatTime";
import ChatHistorySearch from "../../components/Chat/ChatHistorySearch";
import { toast } from "react-toastify";
import { SignalRProvider } from "../../context/SignalRContext";
import { useLocation } from "react-router-dom";
import instance from "../../Axios/axiosConfig";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const currentUserId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
  const location = useLocation();

  useEffect(() => {
    if (!currentUserId) {
      toast.error("Please log in to view chats");
      return;
    }

    // Kiểm tra state từ navigate để chọn chat tự động
    const { chatId, receiverId } = location.state || {};
    if (chatId && receiverId) {
      const fetchChatDetails = async () => {
        try {
          const response = await instance.get("/api/chat/get-by-user", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });
          if (response.data.success) {
            const chat = response.data.chats.find(
              (c) => c.chatId === chatId && c.receiver && c.receiver.accId === receiverId
            );
            if (chat) {
              setSelectedChat({
                chatId: chat.chatId,
                receiverId: chat.receiver.accId,
                senderName: chat.receiver.fullName || chat.receiver.username || "Unknown User",
                senderAvatar: chat.receiver.avatar || null,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching chat details:", error);
          toast.error("Failed to load conversation.");
        }
      };
      fetchChatDetails();
    }
  }, [currentUserId, location.state]);

  const handleChatSelect = (chat) => {
    if (!chat || !chat.chatId || !chat.receiverId) {
      console.warn("Invalid chat data:", chat);
      toast.error("Cannot open chat due to invalid data!");
      return;
    }

    setSelectedChat({
      chatId: chat.chatId,
      receiverId: chat.receiverId,
      senderName: chat.senderName || "Unknown User",
      senderAvatar: chat.senderAvatar || null,
    });
  };

  const handleUnreadCountChange = (count) => {
    setUnreadChatCount(count);
  };

  return (
    <SignalRProvider>
      <div>
        <Header />
        <NavbarHeader />
        <div className="grid grid-cols-12 md:pt-[120px] pt-[60px] mx-auto md:px-10 overflow-hidden">
          <div className="col-span-12 md:col-span-4 lg:col-span-3 p-3 bg-white rounded-lg shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto">
            <ChatList
              onChatSelect={handleChatSelect}
              onUnreadCountChange={handleUnreadCountChange}
            />
          </div>
          <div className="col-span-12 md:col-span-8 lg:col-span-6 mt-4 md:mt-0 border border-gray-200 rounded-lg bg-white h-[calc(100vh-120px)] flex flex-col">
            {selectedChat ? (
              <ChatDetails
                isVisible={!!selectedChat}
                onClose={() => setSelectedChat(null)}
                chatId={selectedChat.chatId}
                receiverId={selectedChat.receiverId}
                senderName={selectedChat.senderName}
                senderAvatar={selectedChat.senderAvatar}
                formatTime={formatTime}
                currentUserId={currentUserId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Please select a conversation to view details
              </div>
            )}
          </div>
          <div className="col-span-12 md:col-span-4 lg:col-span-3 mt-4 md:mt-0 p-3 bg-white rounded-lg shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto">
            <ChatHistorySearch
              selectedChat={selectedChat}
              formatTime={formatTime}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>
    </SignalRProvider>
  );
};

export default ChatPage;