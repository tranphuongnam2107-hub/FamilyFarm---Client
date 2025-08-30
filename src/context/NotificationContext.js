import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import instance from "../Axios/axiosConfig";
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hubConnection, setHubConnection] = useState(null);
    const [currentToken, setCurrentToken] = useState(null);
    const { user } = useUser();

    // Kiểm tra token hiện tại
    const getCurrentToken = useCallback(() => {
        return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    }, []);

    const isAuthenticated = useCallback(() => {
        const token = getCurrentToken();
        return !!token;
    }, [getCurrentToken]);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated()) {
            console.log("User not authenticated, skipping notification fetch");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await instance.get("/api/notification/get-by-user");

            if (response.data.success) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unreadCount || 0);
            } else {
                setError(response.data.message || "Cannot load notification!");
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
            if (isAuthenticated()) {
                setError("Lỗi khi tải thông báo từ máy chủ!");
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const markAsRead = async (notifiStatusId) => {
        if (!isAuthenticated()) return;

        try {
            const response = await instance.put(
                `/api/notification/mark-as-read/${notifiStatusId}`
            );

            if (response.status === 200) {
                setNotifications((prevNotifications) =>
                    prevNotifications.map((noti) =>
                        noti.status.notifiStatusId === notifiStatusId
                            ? { ...noti, status: { ...noti.status, isRead: true } }
                            : noti
                    )
                );
                setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
            }
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (!isAuthenticated()) return;

        try {
            const response = await instance.put("/api/notification/mark-all-as-read");

            if (response.status === 200) {
                setNotifications((prevNotifications) =>
                    prevNotifications.map((noti) => ({
                        ...noti,
                        status: { ...noti.status, isRead: true },
                    }))
                );
                setUnreadCount(0);
            }
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
        }
    };

    // Reset state khi user logout
    const resetNotificationState = useCallback(() => {
        console.log("Resetting notification state");
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        setError(null);
        if (hubConnection) {
            hubConnection.stop();
            setHubConnection(null);
        }
    }, [hubConnection]);

    // Effect để theo dõi token changes - SỬA CHÍNH TẠI ĐÂY
    useEffect(() => {
        const checkToken = () => {
            const token = getCurrentToken();
            
            if (token !== currentToken) {
                setCurrentToken(token);
                
                // Nếu không có token (logout)
                if (!token) {
                    resetNotificationState();
                }
            }
        };

        // Kiểm tra token ngay lập tức
        checkToken();

        // Thiết lập interval để kiểm tra token thay đổi
        const tokenCheckInterval = setInterval(checkToken, 1000);

        // Lắng nghe storage events (khi token thay đổi từ tab khác)
        const handleStorageChange = (e) => {
            if (e.key === 'accessToken' || e.key === 'sessionStorage') {
                checkToken();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(tokenCheckInterval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [currentToken, getCurrentToken, resetNotificationState]);

    // Setup SignalR connection khi có token
    useEffect(() => {
        if (!currentToken || !isAuthenticated()) {
            return;
        }

        const connection = new HubConnectionBuilder()
            .withUrl(`https://localhost:7280/notificationHub?access_token=${currentToken}`, {
                logger: LogLevel.Information
            })
            .withAutomaticReconnect()
            .build();

        setHubConnection(connection);

        connection
            .start()
            .then(() => {                
                // Fetch notifications ngay sau khi connect thành công
                setTimeout(() => {
                    fetchNotifications();
                }, 300);

                connection.on("ReceiveNotification", (notification) => {
                    console.log("Received notification:", JSON.stringify(notification, null, 2));
                    if (!notification.notifiId || !notification.content || !notification.status) {
                        console.error("Invalid notification data:", notification);
                        return;
                    }
                    setNotifications((prevNotifications) => {
                        if (prevNotifications.some((noti) => noti.notifiId === notification.notifiId)) {
                            return prevNotifications;
                        }
                        return [notification, ...prevNotifications];
                    });
                    setUnreadCount((prevCount) => prevCount + (notification.status.isRead ? 0 : 1));
                });

                connection.onreconnected(() => {
                    console.log("SignalR Reconnected!");
                    fetchNotifications();
                });
            })
            .catch((err) => {
                console.error("SignalR Connection Error:", err);
            });

        return () => {
            console.log("Cleaning up SignalR connection");
            if (connection) {
                connection.stop();
            }
        };
    }, [currentToken, isAuthenticated, fetchNotifications]);

    // Fetch notifications khi có token mới (backup)
    useEffect(() => {
        if (currentToken && isAuthenticated()) {
            const timeoutId = setTimeout(() => {
                fetchNotifications();
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [currentToken, isAuthenticated, fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        isAuthenticated: isAuthenticated(),
        hubConnection
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};