import { useEffect, useRef, useState } from "react";

// Hook useInfiniteScroll
// direction: "up" (cho chat, tải thêm khi cuộn lên đầu) hoặc "down" (cho bài post, tải thêm khi cuộn xuống cuối)
const useInfiniteScroll = ({
    fetchData,
    containerRef,
    direction = "down",
    threshold = 50,
    hasMore,
    loading,
    loadingMore,
    take,
    data,
}) => {
    const [skip, setSkip] = useState(0);
    const previousScrollHeightRef = useRef(null);

    useEffect(() => {
        const container = containerRef?.current || window;
        if (!container) return;

        const handleScroll = () => {
            if (!hasMore || loading || loadingMore) return;

            let scrollTop, scrollHeight, clientHeight;

            if (container === window) {
                scrollTop = window.scrollY;
                scrollHeight = document.documentElement.scrollHeight;
                clientHeight = window.innerHeight;
            } else {
                scrollTop = container.scrollTop;
                scrollHeight = container.scrollHeight;
                clientHeight = container.clientHeight;
            }

            if (
                direction === "down" &&
                scrollHeight - scrollTop - clientHeight < threshold
            ) {
                fetchData({ currentSkip: skip + take });
                setSkip((prevSkip) => prevSkip + take);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading, loadingMore, skip, fetchData, containerRef, direction, threshold, take]);

    // Reset skip khi hasMore là false
    useEffect(() => {
        if (!hasMore) {
            setSkip(0); // Ngăn gọi lại fetchData
        }
    }, [hasMore]);

    return { skip, setSkip };
};
export default useInfiniteScroll;