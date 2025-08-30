import React, { useState, useRef, useEffect } from "react";
import cancelIcon from "../../assets/images/cancel_vector.png";
import headLine from "../../assets/images/head_line.png";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import { handleSend, handleTyping, fetchMessages, toggleFormat, scrollToBottom } from "../../services/chatService";
import { handleFileSelect, removeSelectedFile } from "../../utils/validateFile";
import instance from "../../Axios/axiosConfig";
import { useSignalR } from "../../context/SignalRContext";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const modules = {
    toolbar: false,
};

const formats = ["bold", "italic", "underline"];

const ChatDetails = ({
    isVisible,
    onClose,
    chatId,
    receiverId,
    senderName,
    senderAvatar,
    formatTime,
}) => {
    const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [totalMessages, setTotalMessages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [menuMessageId, setMenuMessageId] = useState(null);
    const quillRef = useRef(null);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const previousScrollHeightRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { connection, currentUserId } = useSignalR();

    const TAKE = 20;

    const { skip, setSkip } = useInfiniteScroll({
        fetchData: ({ currentSkip, previousScrollHeightRef }) =>
            fetchMessages({
                receiverId,
                setLoading,
                setLoadingMore,
                setError,
                setMessages,
                setTotalMessages,
                setHasMore,
                chatContainerRef,
                previousScrollHeightRef,
                currentSkip,
                TAKE,
            }),
        containerRef: chatContainerRef,
        direction: "up",
        threshold: 50,
        hasMore,
        loading,
        loadingMore,
        take: TAKE,
        data: messages,
    });

    useEffect(() => {
        if (!chatId || !currentUserId) return;

        const markMessagesAsSeen = async () => {
            try {
                const response = await instance.put(`/api/chat/mark-messages-as-seen/${chatId}`);
                if (response.data === "Messages marked as seen.") {
                    // console.log("Messages marked as seen for chatId:", chatId);
                } else {
                    // console.warn("Failed to mark messages as seen:", response.data);
                }
            } catch (error) {
                // console.error("Error marking messages as seen:", error.response?.data || error.message);
            }
        };

        markMessagesAsSeen();
    }, [chatId, currentUserId]);

    useEffect(() => {
        if (connection && connection.state === "Connected") {
            connection.on("ReceiveMessage", (chatDetail, chatDTO) => {
                if (chatDetail?.chatId === chatId) {
                    setMessages((prevMessages) => [...prevMessages, chatDetail]);
                    scrollToBottom({ messagesEndRef });
                }
            });

            connection.on("MessageSeen", (receivedChatId) => {
                if (receivedChatId === chatId) {
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.chatId === chatId && !msg.isSeen ? { ...msg, isSeen: true } : msg
                        )
                    );
                }
            });

            connection.on("ChatRecalled", (receivedChatId, chatDetailId) => {
                if (receivedChatId === chatId) {
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) => msg.chatDetailId === chatDetailId ? { ...msg, isRecalled: true } : msg
                        )
                    );
                    setMenuMessageId(null);
                }
            });

            connection.on("ChatHistoryDeleted", (receivedChatId) => {
                if (receivedChatId === chatId) {
                    setMessages([]);
                    setTotalMessages(0);
                    setHasMore(false);
                    toast.info("Chat history has been deleted.");
                }
            });

            connection.on("SendTyping", (senderId) => {
                if (senderId === receiverId) {
                    setIsTyping(true);
                }
            });

            connection.on("StopTyping", (senderId) => {
                if (senderId === receiverId) {
                    setIsTyping(false);
                }
            });

            return () => {
                connection.off("ReceiveMessage");
                connection.off("MessageSeen");
                connection.off("ChatRecalled");
                connection.off("ChatHistoryDeleted");
                connection.off("SendTyping");
                connection.off("StopTyping");
            };
        }
    }, [connection, chatId, receiverId]);

    useEffect(() => {
        if (!receiverId) return;
        setSkip(0);
        fetchMessages({
            receiverId,
            setLoading,
            setLoadingMore,
            setError,
            setMessages,
            setTotalMessages,
            setHasMore,
            chatContainerRef,
            previousScrollHeightRef,
            currentSkip: 0,
            reset: true,
            TAKE,
        });
    }, [receiverId]);

    useEffect(() => {
        const handleScroll = () => {
            const container = chatContainerRef.current;
            if (container) {
                const isNearBottom =
                    container.scrollHeight - container.scrollTop - container.clientHeight < 50;
                setShowScrollButton(!isNearBottom);
            }
        };

        const containerRef = chatContainerRef.current;
        if (containerRef) {
            containerRef.addEventListener("scroll", handleScroll);
            return () => containerRef.removeEventListener("scroll", handleScroll);
        }
    }, []);

    useEffect(() => {
        if (skip === 0) {
            scrollToBottom({ messagesEndRef });
        }
    }, [messages, skip]);

    const handleRecallMessage = async (chatDetailId) => {
        try {
            const response = await instance.put(`/api/chat/recall-message/${chatDetailId}`);
            if (response.status === 200) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.chatDetailId === chatDetailId ? { ...msg, isRecalled: true } : msg
                    )
                );
                setMenuMessageId(null);
                toast.success("Message recalled successfully!");
            } else {
                toast.error("Failed to recall message.");
            }
        } catch (error) {
            toast.error("An error occurred while recalling the message.");
        }
    };

    if (!isVisible || !currentUserId) return null;

    const messageGroups = [];
    let currentGroup = null;
    const TIME_THRESHOLD = 5 * 60 * 1000;

    messages
        .filter((detail) => detail?.chatId === chatId)
        .sort((a, b) => new Date(a.sendAt) - new Date(b.sendAt))
        .forEach((detail, index) => {
            const prevDetail = index > 0 ? messages[index - 1] : null;
            const currentTime = new Date(detail.sendAt).getTime();
            const prevTime = prevDetail ? new Date(prevDetail.sendAt).getTime() : null;

            const isNewGroup =
                !prevDetail ||
                detail.senderId !== prevDetail.senderId ||
                (prevTime && currentTime - prevTime >= TIME_THRESHOLD);

            if (isNewGroup) {
                currentGroup = {
                    senderId: detail.senderId,
                    messages: [],
                    timestamp: detail.sendAt,
                };
                messageGroups.push(currentGroup);
            }

            currentGroup.messages.push(detail);
        });

    const lastSeenMessage = messages
        .filter((msg) => msg.senderId === currentUserId && msg.isSeen)
        .sort((a, b) => new Date(b.sendAt) - new Date(a.sendAt))[0];

    return (
        <div className="relative flex flex-col w-full h-full p-3 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="w-full flex justify-between items-center mx-auto px-4 sm:px-0 h-[60px]">
                <div className="flex items-center gap-2">
                    <img
                        className="object-cover w-8 h-8 rounded-full"
                        src={senderAvatar}
                        alt={`${senderName || "User"} avatar`}
                    />
                    <div className="font-bold text-black text-[18px] leading-normal whitespace-nowrap">
                        {senderName}
                    </div>
                </div>
                <div
                    className="flex w-[35px] h-[35px] items-center justify-center gap-2.5 p-1.5 bg-[#c0bebe] rounded-full overflow-hidden cursor-pointer hover:bg-[#999999]"
                    onClick={onClose}
                    role="button"
                    aria-label="Close chat details"
                >
                    <img className="w-[12.62px] h-[12.62px]" src={cancelIcon} alt="Close" />
                </div>
            </div>
            <img className="w-full h-[1px] object-cover" src={headLine} alt="Header line" />
            <div
                ref={chatContainerRef}
                className="flex flex-col flex-1 gap-2 p-4 overflow-x-hidden overflow-y-auto max-h-[calc(100vh-240px)]"
            >
                {loadingMore && (
                    <div className="text-[#344258] text-[13px] text-center py-4">
                        <svg
                            className="animate-spin h-5 w-5 mx-auto text-[#344258]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Loading more messages...
                    </div>
                )}
                {loading && skip === 0 ? (
                    <div className="text-[#344258] text-[13px] text-center py-4">
                        <svg
                            className="animate-spin h-5 w-5 mx-auto text-[#344258]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Loading messages...
                    </div>
                ) : error ? (
                    <div className="text-[#344258] text-[13px] text-center py-4">{error}</div>
                ) : messageGroups.length > 0 ? (
                    messageGroups.map((group, groupIndex) => (
                        <div key={`group-${groupIndex}`} className="flex flex-col w-full gap-1">
                            {(groupIndex === 0 ||
                                new Date(group.timestamp).getTime() -
                                new Date(messageGroups[groupIndex - 1].timestamp).getTime() >=
                                TIME_THRESHOLD) && (
                                    <div className="text-center text-xs text-[#A2A5B9] my-2">
                                        {formatTime(group.timestamp)}
                                    </div>
                                )}
                            <div
                                className={`flex flex-col ${group.senderId === currentUserId ? "items-end" : "items-start"
                                    } w-full`}
                            >
                                {group.messages.map((detail, msgIndex) => (
                                    <div
                                        key={`${detail.chatDetailId}-${msgIndex}`}
                                        className={`flex items-end gap-2 ${group.senderId === currentUserId ? "flex-row-reverse" : "flex-row"
                                            } ${msgIndex > 0 ? "mt-1" : ""} w-full relative`}
                                        onMouseEnter={() =>
                                            group.senderId === currentUserId &&
                                            !detail.isRecalled &&
                                            setHoveredMessageId(detail.chatDetailId)
                                        }
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        {group.senderId !== currentUserId &&
                                            msgIndex === group.messages.length - 1 ? (
                                            <img
                                                className="object-cover w-6 h-6 rounded-full"
                                                src={senderAvatar}
                                                alt={`${senderName || "User"} avatar`}
                                            />
                                        ) : (
                                            group.senderId !== currentUserId && <div className="w-6 h-6" />
                                        )}
                                        <div
                                            className={`flex flex-col gap-1 max-w-[80%] ${group.senderId === currentUserId ? "items-end" : "items-start"
                                                } relative`}
                                        >
                                            {detail.isRecalled ? (
                                                <div
                                                    className={`p-2 rounded-full ${group.senderId === currentUserId
                                                        ? "bg-[#3DB3FB] text-white"
                                                        : "bg-gray-100 text-[#344258]"
                                                        } break-all w-fit overflow-hidden`}
                                                >
                                                    <p
                                                        className={`text-sm italic ${group.senderId === currentUserId ? "text-right" : "text-left"
                                                            }`}
                                                    >
                                                        Message recalled
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {detail.fileUrl && detail.fileType === "image" && (
                                                        <a
                                                            href={detail.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-fit"
                                                        >
                                                            <img
                                                                src={detail.fileUrl}
                                                                alt={detail.fileName || "Image"}
                                                                className="max-w-[150px] w-full h-auto rounded-md"
                                                            />
                                                        </a>
                                                    )}
                                                    {detail.fileUrl && detail.fileType !== "image" && (
                                                        <div
                                                            className={`p-2 rounded-lg ${group.senderId === currentUserId
                                                                ? "bg-[#3DB3FB] text-white"
                                                                : "bg-gray-100 text-[#344258]"
                                                                } break-all w-fit overflow-hidden`}
                                                        >
                                                            <a
                                                                href={detail.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`text-sm underline truncate max-w-[150px] ${group.senderId === currentUserId ? "text-right" : "text-left"
                                                                    } block`}
                                                            >
                                                                {detail.fileName || "File"}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {group.senderId === currentUserId && hoveredMessageId === detail.chatDetailId && (
                                                        <button
                                                            onClick={() => setMenuMessageId(detail.chatDetailId)}
                                                            className={`absolute top-1/2 -translate-y-1/2 ${group.senderId === currentUserId ? "left-[-30px]" : "right-2"
                                                                } p-1 text-gray-500 hover:text-gray-700`}
                                                            aria-label="Message options"
                                                        >
                                                            <i className="fas fa-ellipsis-v"></i>
                                                        </button>
                                                    )}
                                                    {group.senderId === currentUserId && menuMessageId === detail.chatDetailId && (
                                                        <div
                                                            className={`absolute item-center top-[calc(50%+1.5rem)] ${group.senderId === currentUserId ? "left-[-30px]" : "right-10"
                                                                } bg-white border border-gray-300 rounded shadow-lg z-10`}
                                                        >
                                                            <button
                                                                onClick={() => handleRecallMessage(detail.chatDetailId)}
                                                                className="px-4 flex py-2 gap-1 text-sm text-red-600 hover:bg-gray-100 w-full text-left border border-solid border-gray-400 rounded-md item-center"
                                                                aria-label="Recall message"
                                                            >
                                                                <i className="fa fa-undo text-base" aria-hidden="true"></i> Recall
                                                            </button>
                                                        </div>
                                                    )}
                                                    {detail.message?.trim() && (
                                                        <div
                                                            className={`p-2 rich-text-editor rounded-lg ${group.senderId === currentUserId
                                                                ? "bg-[#3DB3FB] text-white"
                                                                : "bg-gray-100 text-[#344258]"
                                                                } break-all w-fit overflow-hidden`}
                                                        >
                                                            <div
                                                                className={`text-sm ${group.senderId === currentUserId ? "text-right" : "text-left"
                                                                    }`}
                                                                dangerouslySetInnerHTML={{ __html: detail.message.trim() }}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {group.senderId === currentUserId &&
                                            lastSeenMessage &&
                                            detail.chatDetailId === lastSeenMessage.chatDetailId && (
                                                <span className="text-xs text-[#A2A5B9] ml-1">✓✓</span>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-[#344258] text-[13px] text-center py-4">No messages found</div>
                )}
                {isTyping && (
                    <div className="text-[#344258] text-xs italic ml-4 mb-2">Typing...</div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom({ messagesEndRef })}
                    className="absolute flex items-center justify-center w-8 h-8 text-gray-800 transition-colors duration-200 bg-gray-200 rounded-full shadow-lg bottom-24 right-6 hover:bg-gray-300"
                >
                    <i className="fa-solid fa-angle-down fa-lg"></i>
                </button>
            )}
            <hr />
            <div className="w-full rich-text-editor">
                <div className="flex items-center gap-2 p-1">
                    <label
                        htmlFor="imageInput"
                        className="p-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-300"
                        aria-label="Upload image"
                    >
                        <i className="fas fa-image"></i>
                    </label>
                    <input
                        type="file"
                        id="imageInput"
                        accept="image/*" // Giới hạn định dạng ảnh
                        className="hidden"
                        ref={imageInputRef}
                        onChange={(e) => handleFileSelect({ event: e, setSelectedFile })}
                    />
                    <label
                        htmlFor="fileInput"
                        className="p-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-300"
                        aria-label="Upload file"
                    >
                        <i className="fas fa-paperclip"></i>
                    </label>
                    <input
                        type="file"
                        id="fileInput"
                        accept=".pdf,.doc,.docx" // Giới hạn định dạng file
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect({ event: e, setSelectedFile })}
                    />
                    <button
                        onClick={() => toggleFormat({ quillRef, format: "bold" })}
                        className="p-1 cursor-pointer hover:bg-gray-300"
                        aria-label="Toggle bold text"
                    >
                        <i className="fas fa-bold"></i>
                    </button>
                    <button
                        onClick={() => toggleFormat({ quillRef, format: "italic" })}
                        className="p-1 cursor-pointer hover:bg-gray-300"
                        aria-label="Toggle italic text"
                    >
                        <i className="fas fa-italic"></i>
                    </button>
                    <button
                        onClick={() => toggleFormat({ quillRef, format: "underline" })}
                        className="p-1 cursor-pointer hover:bg-gray-300"
                        aria-label="Toggle underline text"
                    >
                        <i className="fas fa-underline"></i>
                    </button>
                </div>
                {selectedFile && (
                    <div className="flex items-center w-full gap-2 p-2 mt-1 bg-gray-100 rounded-md">
                        {selectedFile.type === "image" ? (
                            <img
                                src={selectedFile.url}
                                alt="Preview"
                                className="object-cover w-12 h-12 rounded"
                            />
                        ) : (
                            <span className="text-sm text-[#344258] truncate max-w-[150px]">
                                {selectedFile.name}
                            </span>
                        )}
                        <button
                            onClick={() =>
                                removeSelectedFile({ selectedFile, setSelectedFile, imageInputRef, fileInputRef })
                            }
                            className="p-1 text-red-500 hover:text-red-700"
                            aria-label="Remove file"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}
                <div className="flex items-end border border-gray-300 rounded-md">
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={(value) => {
                            setContent(value);
                            handleTyping({ connection, currentUserId, receiverId, typingTimeoutRef });
                        }}
                        className="flex-1 text-sm bg-white border-none"
                        placeholder="Type message..."
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        style={{ maxHeight: "100px", overflowY: "auto" }}
                    />
                    <button
                        onClick={() =>
                            handleSend({
                                content,
                                setContent,
                                selectedFile,
                                setSelectedFile,
                                receiverId,
                                imageInputRef,
                                fileInputRef,
                                scrollToBottom: () => scrollToBottom({ messagesEndRef }),
                            })
                        }
                        className="h-full p-3 text-[#3DB3FB] rounded-r-md"
                        aria-label="Send message"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatDetails;