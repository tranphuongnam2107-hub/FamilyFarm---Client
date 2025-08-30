import React, { useState, useEffect } from "react";
import defaultAvatar from '../../assets/images/default-avatar.png';
import { toast } from "react-toastify";

export default function PopupInviteMember({ onClose, group, reloadsignlR }) {
    const [friendsData, setFriendsData] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const fetchFriends = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("accessToken");

            const res = await fetch(`https://localhost:7280/api/friend/list-friend`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const json = await res.json();
            const allFriends = json.data || [];

            // Gọi tất cả API kiểm tra group member song song
            const checkPromises = allFriends.map(friend =>
                fetch(`https://localhost:7280/api/group-member/get-by-groupid-accid/${group.groupId}/${friend.accId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }).then(res => ({ res, friend }))
                .catch(err => ({ error: err, friend }))
            );

            const results = await Promise.allSettled(checkPromises);

            const validFriends = [];

            for (const result of results) {
                if (result.status === "fulfilled") {
                    const { res, friend } = result.value;
                    if (res.status === 404) {
                        validFriends.push(friend);
                    } else if (!res.ok && res.status !== 200) {
                        console.warn(`Check failed for ${friend.fullName}: status ${res.status}`);
                    }
                } else {
                    console.warn(`Fetch failed for ${result.reason?.friend?.fullName}: ${result.reason}`);
                }
            }

            setFriendsData(validFriends);
        } catch (err) {
            console.error("Error filtering friends:", err.message || err);
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        fetchFriends();
    }, []);

    const filteredFriends = (friendsData || []).filter((friend) =>
        friend.fullName.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const toggleSelectFriend = (friend) => {
        const exists = selectedFriends.find((f) => f.accId === friend.accId);
        if (exists) {
            setSelectedFriends((prev) => prev.filter((f) => f.accId !== friend.accId));
        } else {
            setSelectedFriends((prev) => [...prev, friend]);
        }
    };

    const removeFriend = (accId) => {
        setSelectedFriends((prev) => prev.filter((f) => f.accId !== accId));
    };

    const isSelected = (accId) => {
        return selectedFriends.some((f) => f.accId === accId);
    };

    const handleSendInvite = async () => {
        if (!group || !group.groupId) return;

        const token = localStorage.getItem("accessToken");
        try {
            const promises = selectedFriends.map((friend) => {
                console.log("Friend Id", friend.accId);
                return fetch(`https://localhost:7280/api/group-member/invite/${group.groupId}/${friend.accId}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            });

            const results = await Promise.all(promises);
            const allSuccess = results.every((res) => res.ok);

            if (allSuccess) {
                toast.success("Invite successfully!");
                onClose(); // ← đóng popup
                if (typeof reloadsignlR === "function") reloadsignlR(); // ← nếu cần reload lại
            } else {
                toast.error("Invite failed.");
            }
        } catch (err) {
            console.error("Error inviting:", err);
            toast.error("Invite error.");
        }
    };

    return (
        <div className="invite-group-member fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="invite-container bg-[#fff] text-black rounded-lg w-[700px] h-[600px] flex flex-col">
                {/* Header */}
                <div className="invite-header flex justify-between items-center px-4 py-3 border-b border-gray-600">
                    <h2 className="text-lg font-bold">Invite friends to join this group</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                    >
                        <i className="fa-solid fa-xmark text-white"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="invite-body flex flex-1 overflow-hidden">
                    {/* Left: Danh sách bạn bè */}
                    <div className="w-[60%] p-0 flex flex-col">
                        {/* Ô tìm kiếm cố định */}
                        <div className="search-friend sticky top-0 bg-[#fff] z-10 p-4">
                            <input
                                type="text"
                                placeholder="Find friends by name"
                                className="w-full px-3 py-2 bg-[#3a3b3c] text-sm text-white rounded-md outline-none"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            <div className="text-sm text-gray-400 mt-5 text-start">Suggest</div>
                        </div>

                        {/* Danh sách bạn bè scroll riêng */}
                        <div className="friend-list flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                            {isLoading ? (
                                <p className="text-sm text-gray-400">Loading...</p>
                            ) : filteredFriends.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredFriends.map((friend) => (
                                        <li
                                            key={friend.accId}
                                            onClick={() => toggleSelectFriend(friend)}
                                            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-gray-300 ${isSelected(friend.accId) ? "bg-gray-500" : ""
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={
                                                        friend.avatar && friend.avatar.trim() !== ""
                                                        ? friend.avatar
                                                        : defaultAvatar
                                                    }
                                                    className="w-8 h-8 rounded-full"
                                                    alt={friend.fullName}
                                                />
                                                <span className="text-sm font-medium">{friend.fullName}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4"
                                                readOnly
                                                checked={isSelected(friend.accId)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400">No matching friends found.</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Danh sách đã chọn */}
                    <div className="choose-friend w-[40%] p-4 border-l border-gray-600">
                        <p className="text-sm text-gray-400 mb-3">SELECTED {selectedFriends.length} FRIENDS</p>
                        <ul className="space-y-2">
                            {selectedFriends.map((friend) => (
                                <li key={friend.accId} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <img
                                            src={friend.avatar}
                                            className="w-6 h-6 rounded-full"
                                            alt={friend.fullName}
                                        />
                                        <span className="text-sm">{friend.fullName}</span>
                                    </div>
                                    <button
                                        onClick={() => removeFriend(friend.accId)}
                                        className="text-gray-400 hover:text-gray-700"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="invite-footer border-t border-gray-600 p-4 flex items-center justify-between text-sm">
                    <button
                        disabled={selectedFriends.length === 0}
                        onClick={handleSendInvite}
                        className={`px-4 py-1 rounded text-sm font-semibold transition-all ${selectedFriends.length === 0
                            ? "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        Send invitation
                    </button>

                </div>
            </div>
        </div>
    )
}