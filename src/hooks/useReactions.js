import { useState, useEffect } from "react";
import instance from "../Axios/axiosConfig";
import { toast } from "react-toastify";

const useReactions = ({ entityType, entityId }) => {
    const [likeCount, setLikeCount] = useState(0);
    const [reactionType, setReactionType] = useState(null);
    const [hasReacted, setHasReacted] = useState(false);
    const [reactions, setReactions] = useState([]);
    const [loadingReactions, setLoadingReactions] = useState(true);

    // Get accId from localStorage or sessionStorage
    const accId = localStorage.getItem("accId") || sessionStorage.getItem("accId");

    // Fetch available reaction categories
    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const response = await instance.get("/api/category-reaction/all-available");
                if (response.data && Array.isArray(response.data)) {
                    const formattedReactions = response.data.map((item) => ({
                        id: item.id || item.categoryReactionId,
                        name: item.reactionName || item.name || "Unknown",
                        icon: item.iconUrl || item.image || "",
                    }));
                    setReactions(formattedReactions);
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (err) {
                console.error("Error fetching reactions:", err);
                toast.error("Failed to load emoticon list!");
            } finally {
                setLoadingReactions(false);
            }
        };

        fetchReactions();
    }, []);

    // Fetch reaction data for the entity
    useEffect(() => {
        const fetchReactionData = async () => {
            if (!entityId || !accId) return;

            try {
                const response = await instance.get(`/api/reaction/all-by-${entityType.toLowerCase()}/${entityId}`);
                if (response.data.success && Array.isArray(response.data.reactionDTOs)) {
                    setLikeCount(response.data.availableCount || 0);

                    // Check if user has reacted
                    const userReaction = response.data.reactionDTOs.find(
                        (reaction) => reaction.account.accId === accId && !reaction.reaction.isDeleted
                    );
                    if (userReaction) {
                        setHasReacted(true);
                        setReactionType(userReaction.categoryReaction.id || userReaction.categoryReaction.categoryReactionId);
                    } else {
                        setHasReacted(false);
                        setReactionType(null);
                    }
                }
            } catch (err) {
                console.error(`Error fetching ${entityType} reaction data:`, err);
                toast.error("Failed to load response data!");
            }
        };

        fetchReactionData();
    }, [entityId, accId, entityType]);

    // Handle toggle reaction
    const handleReact = async (categoryReactionId) => {
        if (!accId) {
            toast.error("Please login to react!");
            return;
        }

        try {
            const response = await instance.post(
                `/api/reaction/toggle-${entityType.toLowerCase()}/${entityId}?categoryReactionId=${categoryReactionId}`
            );

            if (
                response.data === "Reaction has been toggled." ||
                (response.data && response.data.success)
            ) {
                const reactionResponse = await instance.get(`/api/reaction/all-by-${entityType.toLowerCase()}/${entityId}`);
                if (reactionResponse.data.success) {
                    setLikeCount(reactionResponse.data.availableCount || 0);

                    const userReaction = reactionResponse.data.reactionDTOs.find(
                        (reaction) => reaction.account.accId === accId && !reaction.reaction.isDeleted
                    );
                    if (userReaction) {
                        setHasReacted(true);
                        setReactionType(userReaction.categoryReaction.id || userReaction.categoryReaction.categoryReactionId);
                    } else {
                        setHasReacted(false);
                        setReactionType(null);
                    }
                }
            } else {
                throw new Error(
                    typeof response.data === "string"
                        ? response.data
                        : response.data.message || "Unable to perform reaction"
                );
            }
        } catch (err) {
            console.error(`Error toggling ${entityType} reaction:`, {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            toast.error(`Unable to perform reaction: ${err.message}`);
        }
    };

    // Handle like click (default to "Like" reaction)
    const handleLikeClick = () => {
        if (!hasReacted) {
            const likeReaction = reactions.find((reaction) => reaction.name.toLowerCase() === "like");
            if (likeReaction) {
                handleReact(likeReaction.id);
            } else {
                toast.error("'Like' reaction not found!");
            }
        } else {
            handleReact(reactionType);
        }
    };

    // Find current reaction
    const currentReaction = reactions.find((reaction) => reaction.id === reactionType) || {
        name: "Like",
        icon: "https://example.com/like.png",
    };

    return {
        likeCount,
        reactionType,
        hasReacted,
        reactions,
        loadingReactions,
        handleReact,
        handleLikeClick,
        currentReaction,
    };
};

export default useReactions;