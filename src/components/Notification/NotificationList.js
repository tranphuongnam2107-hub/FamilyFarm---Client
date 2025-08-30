import React, { useState, useEffect } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "./notificationstyle.css";
import cancelIcon from "../../assets/images/cancel_vector.png";
import headLine from "../../assets/images/head_line.png";
import readIcon from "../../assets/images/letter_vector.png";
import lineShape from "../../assets/images/border_line.png";
import formatTime from "../../utils/formatTime";
import { useNotification } from "../../context/NotificationContext";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";

const NotificationList = ({ onToggle, isVisible }) => {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        fetchNotifications
    } = useNotification();

    const [inviteStatusMap, setInviteStatusMap] = useState({});
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchInviteStatuses = async () => {
            const newMap = {};

            const inviteNotis = notifications.filter(
                (n) => n.targetType === "GroupMember" && n.targetId
            );

            const requests = inviteNotis.map(async (noti) => {
                try {
                    const res = await instance.get(
                        `/api/group-member/get-member-invite-by-id/${noti.targetId}`
                    );
                    if (res.status === 200 && res.data) {
                        newMap[noti.targetId] = res.data.memberStatus || "Unknown";
                    }
                } catch (err) {
                    console.warn(`❗ Không lấy được trạng thái lời mời của ${noti.targetId}`, err);
                }
            });

            await Promise.all(requests);
            setInviteStatusMap(newMap);
        };

        if (notifications.length > 0) {
            fetchInviteStatuses();
        }
    }, [notifications]);

    // const handleRespondToInvite = async (groupMemberId, status) => {
    //     try {
    //         const res = await instance.put(
    //             `/api/group-member/response-to-invite-group/${groupMemberId}?status=${status}`
    //         );
    //         if (res.status === 200) {
    //             toast.success(`You have ${status.toLowerCase()}ed the invite.`);
    //             fetchNotifications();
    //         } else {
    //             toast.error("Failed to respond to invite");
    //         }
    //     } catch (err) {
    //         console.error("Error responding to invite:", err);
    //         toast.error("Something went wrong");
    //     }
    // };

    const handleRespondToInvite = async (groupMemberId, status) => {
        try {
            const res = await instance.put(
                `/api/group-member/response-to-invite-group/${groupMemberId}?status=${status}`
            );

            if (res.status === 200) {
                toast.success(res.data.message || `You have ${status.toLowerCase()}ed the invite.`);
                fetchNotifications();
            } else {
                toast.error(res.data.message || "Failed to respond to invite");
            }
        } catch (err) {
            console.error("Error responding to invite:", err);

            if (err.response) {
                // Lấy message từ BE
                const message = err.response.data?.message;
                if (message) {
                    toast.error(message);
                } else {
                    toast.error("Something went wrong");
                }
            } else {
                toast.error("Something went wrong");
            }

            fetchNotifications();
        }
    };

    // Lọc thông báo theo trạng thái
    const filteredNotifications = notifications.filter((noti) => {
        // Kiểm tra noti.status tồn tại và isRead được định nghĩa
        if (!noti.status || typeof noti.status.isRead === "undefined") {
            console.warn(`Thông báo ${noti.notifiId} thiếu trạng thái isRead`, noti);
            return false; // Bỏ qua thông báo không hợp lệ
        }
        return filterStatus === "unread" ? !noti.status.isRead : true;
    });

    return (
        <div className="relative">
            <div
                className="notifi-box"
                onClick={onToggle}
                role="button"
                aria-label="Toggle notifications"
                aria-expanded={isVisible}
            >
                <i className={`fa-solid fa-bell ${isVisible ? "text-[#3DB3FB]" : ""}`}></i>
                <div className="notifi-number">{unreadCount > 0 ? unreadCount : 0}</div>
            </div>

            {isVisible && (
                <div className="popup-notifi fixed md:right-5 right-0 top-16 max-w-sm z-[50] border border-gray-300 border-solid shadow-lg rounded-xl md:h-[90vh] h-[95vh]">
                    <div className="w-full h-full p-4 pt-4 bg-white rounded-xl">
                        <div className="flex items-center justify-between w-full px-4 mx-auto popup-header sm:px-0">
                            <div className="popup-title">Notifications</div>
                            <div
                                className="cancel-notifi"
                                onClick={() => onToggle()}
                                role="button"
                                aria-label="Close notifications"
                            >
                                <img className="vector" src={cancelIcon} alt="Close" />
                            </div>
                        </div>
                        <img className="w-full mt-3 header-noti-line" src={headLine} alt="Header line" />
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
                                <div
                                    className="font-semibold text-gray-500 text-[13px] leading-normal whitespace-nowrap cursor-pointer hover:text-[#344258] transition-colors duration-200"
                                    onClick={markAllAsRead}
                                    role="button"
                                    aria-label="Mark all as read"
                                >
                                    Mark all as read
                                </div>
                            </div>
                        </div>
                        <div className="noti-list-container w-full mx-auto mt-[16.3px] px-4 sm:px-0 max-h-[75vh] overflow-y-auto flex flex-col justify-start items-start gap-3">
                            {loading ? (
                                <div className="text-center py-4 w-full">Loading...</div>
                            ) : error ? (
                                <div className="text-center py-4 w-full text-red-500">{error}</div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="text-center py-4 w-full">No notifications found!</div>
                            ) : (
                                filteredNotifications.map((noti) => {
                                    const isGroupInvite = noti.targetType === "GroupMember";
                                    const memberStatus = inviteStatusMap[noti.targetId];
                                    const shouldShowButtons = isGroupInvite && memberStatus === "Invite";

                                    return (
                                        <div key={noti.notifiId} className="flex flex-col gap-3">
                                            <div className="noti-item flex justify-between items-start">
                                                <div className="flex">
                                                    <img
                                                        className="noti-avatar w-10 h-10 rounded-full mr-3"
                                                        src={
                                                            noti.senderAvatar ||
                                                            "https://firebasestorage.googleapis.com/...default-avatar.jpg"
                                                        }
                                                        alt={noti.senderName || "System"}
                                                    />
                                                    <div  className="w-full text-start">
                                                        <p className="text-sm text-start leading-snug">
                                                            {noti.senderName && <span className="font-semibold">{noti.senderName} </span>}
                                                            {noti.content}
                                                        </p>
                                                        <span className="text-xs text-gray-400">{formatTime(noti.createdAt)}</span>

                                                        {shouldShowButtons && (
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => handleRespondToInvite(noti.targetId, "Accept")}
                                                                    className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRespondToInvite(noti.targetId, "Reject")}
                                                                    className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <img
                                                    className={`noti-status w-4 h-4 cursor-pointer mt-1 ${noti.status.isRead ? "opacity-30" : ""}`}
                                                    src={readIcon}
                                                    alt={noti.status.isRead ? "Read" : "Unread"}
                                                    onClick={() => !noti.status.isRead && markAsRead(noti.status.notifiStatusId)}
                                                />
                                            </div>
                                            <img src={lineShape} alt="Divider" />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationList;