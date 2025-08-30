import instance from "../Axios/axiosConfig";
import { toast } from "react-toastify";

// Hàm gửi tin nhắn
export const handleSend = async ({
  content,
  setContent,
  selectedFile,
  setSelectedFile,
  receiverId,
  imageInputRef,
  fileInputRef,
  scrollToBottom,
}) => {
  const strippedContent = content.replace(/<[^>]+>/g, "").trim();
  if (!strippedContent && !selectedFile) return;

  try {
    const formData = new FormData();
    formData.append("ReceiverId", receiverId);
    if (strippedContent) {
      formData.append("Message", content.trim());
    }
    if (selectedFile) {
      formData.append("File", selectedFile.file);
      formData.append("FileName", selectedFile.name);
      formData.append(
        "FileType",
        selectedFile.type === "image" ? "image" : "file"
      );
    }

    const response = await instance.post("/api/chat/send-message", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.data.success) {
      setContent("");
      if (selectedFile?.url) {
        URL.revokeObjectURL(selectedFile.url);
      }
      setSelectedFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    } else {
      toast.error(response.data.message || "Failed to send message!");
    }
  } catch (error) {
    console.error("Send message error:", error.response?.data || error.message);
  }
};

// Hàm xử lý trạng thái nhập liệu
export const handleTyping = ({
  connection,
  currentUserId,
  receiverId,
  typingTimeoutRef,
}) => {
  if (connection && connection.state === "Connected") {
    connection.invoke("SendTyping", currentUserId, receiverId).catch((err) => {
      console.error("Error invoking SendTyping:", err);
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      connection
        .invoke("StopTyping", currentUserId, receiverId)
        .catch((err) => {
          console.error("Error invoking StopTyping:", err);
        });
    }, 1000);
  }
};

// Hàm định dạng văn bản
export const toggleFormat = ({ quillRef, format }) => {
  if (quillRef.current) {
    const editor = quillRef.current.getEditor();
    const isActive = editor.getFormat()[format];
    editor.format(format, !isActive);
  }
};

// Hàm cuộn xuống cuối
export const scrollToBottom = ({ messagesEndRef }) => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "auto" });
  }
};

// Hàm fetchData dùng cho useInfiniteScroll
export const fetchData = async ({
  receiverId,
  skip,
  take,
  setSkip,
  setHasMore,
  setLoadingMore,
  setMessages,
  setTotalMessages,
  setError,
  previousScrollHeightRef,
  containerRef,
  reset = false,
}) => {
  if (!receiverId) {
    setError("No receiver ID provided");
    return;
  }

  setLoadingMore(true);
  setError(null);
  try {
    const response = await instance.get(
      `/api/chat/get-messages/${receiverId}`,
      {
        params: { skip, take },
      }
    );

    if (response.data.success) {
      const newMessages = response.data.chatDetails || [];
      setTotalMessages(response.data.totalMessages || 0);
      setHasMore(skip + newMessages.length < response.data.totalMessages);

      if (containerRef.current) {
        previousScrollHeightRef.current = containerRef.current.scrollHeight;
      }

      setMessages((prevMessages) =>
        reset ? newMessages : [...newMessages, ...prevMessages]
      );
      setSkip(skip);
    } else {
      setError(response.data.message || "Failed to load messages");
      toast.error(response.data.message || "Failed to load messages.");
    }
  } catch (error) {
    setError("Failed to fetch messages");
    toast.error("Failed to load messages!");
    console.error(
      "Fetch messages error:",
      error.response?.data || error.message
    );
  } finally {
    setLoadingMore(false);
  }
};

// Hàm fetchMessages (được giữ lại để tương thích với code cũ, nhưng giờ gọi fetchData)
export const fetchMessages = async ({
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
  reset = false,
  TAKE,
}) => {
  setLoading(true);
  await fetchData({
    receiverId,
    skip: currentSkip,
    take: TAKE,
    setSkip: () => {},
    setHasMore,
    setLoadingMore,
    setMessages,
    setTotalMessages,
    setError,
    previousScrollHeightRef,
    containerRef: chatContainerRef,
    reset,
  });
  setLoading(false);
};