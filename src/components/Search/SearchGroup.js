import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useLocation } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast, Bounce } from "react-toastify";
import SuggestionGroupCard from "../Group/SuggestionGroupCard";

const SearchGroup = () => {
    const { state } = useLocation();
    const initialKeyword = state?.keyword || "";
    const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
    const [groupsData, setGroupsData] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const popupRef = useRef(null);
    const lastFetchedKeyword = useRef("");

    const fetchGroups = async (keywordToSearch = searchKeyword) => {
        const trimmedKeyword = keywordToSearch?.trim();
        if (!trimmedKeyword || trimmedKeyword === lastFetchedKeyword.current) {
            setIsLoading(false);
            return;
        }
        lastFetchedKeyword.current = trimmedKeyword;

        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem("accessToken");
            if (!token) {
                throw new Error("No access token found");
            }

            const res = await instance.get(`/api/group/search`, {
                params: { q: trimmedKeyword },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success && res.data.count > 0) {
                const formattedGroups = res.data.data.map((item) => ({
                    groupId: item.group.groupId,
                    groupName: item.group.groupName,
                    groupAvatar: item.group.groupAvatar,
                    groupBackground: item.group.groupBackground,
                    memberCount: item.numberInGroup,
                }));
                setGroupsData(formattedGroups);
                setCount(res.data.count);
            } else {
                setGroupsData([]);
                setCount(0);
            }
        } catch (err) {
            console.error("Error fetching groups:", err);
            setError(err.message || "Failed to fetch groups");
            setGroupsData([]);
            setCount(0);
            toast.error("Failed to fetch groups.", {
                transition: Bounce,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialKeyword && initialKeyword !== searchKeyword) {
            setSearchKeyword(initialKeyword);
        }
    }, [initialKeyword]);

    useEffect(() => {
        if (searchKeyword) {
            fetchGroups(searchKeyword);
        }
    }, [searchKeyword]);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl("https://localhost:7280/groupHub")
            .withAutomaticReconnect()
            .build();

        connection
            .start()
            .then(() => {
                console.log("✅ SignalR connected for SearchGroup");
                connection.on("GroupUpdate", () => {
                    console.log("✅ GroupUpdate event received in SearchGroup");
                    if (searchKeyword && searchKeyword.trim() !== "") {
                        fetchGroups();
                    }
                });
            })
            .catch((err) => console.error("SignalR connection error:", err));

        return () => {
            connection.stop();
        };
    }, [searchKeyword]);

    return (
        <div className="w-full md:ml-[289px]">
            <div className="mt-36">
                <div className="flex items-start mt-8 mx-10 md:mx-20">
                    <span className="font-bold text-lg">KEYWORD: </span>
                    <span className="text-lg ml-1">{" "} {searchKeyword || "None"}</span>
                </div>

                <div className="flex gap-6 items-center mt-6 mb-10 mx-10 md:mx-20">
                    <div className="flex gap-1">
                        <p className="font-bold">{count}</p>
                        <p className="text-[#999999] font-bold">GROUPS FOUND</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="mx-10 md:mx-20">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 mx-10 md:mx-20">{error}</div>
                ) : groupsData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6 place-items-center md:mx-20">
                        {groupsData.map((group) => (
                            <SuggestionGroupCard
                                key={group.groupId}
                                group={group}
                                member={group.memberCount}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mx-10 md:mx-20">No groups found for "{searchKeyword}"</div>
                )}
            </div>
        </div>
    );
};

export default SearchGroup;