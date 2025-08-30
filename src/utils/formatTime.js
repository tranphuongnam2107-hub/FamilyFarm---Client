const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now - messageDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // Helper to format time as hh:mm AM/PM
    const timeString = messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    // Under 1 day
    if (diffDay < 1) {
        if (diffSec < 60) return `${diffSec} sec${diffSec !== 1 ? "s" : ""} ago`;
        if (diffMin < 60) return `${diffMin} min${diffMin !== 1 ? "s" : ""} ago`;
        return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
        messageDate.getDate() === yesterday.getDate() &&
        messageDate.getMonth() === yesterday.getMonth() &&
        messageDate.getFullYear() === yesterday.getFullYear()
    ) {
        return `${timeString}, Yesterday`;
    }

    // Under 1 week
    if (diffDay < 7) {
        return `${timeString}, ${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    }

    // Over 1 week
    const dateString = messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    return `${timeString}, ${dateString}`;
};

export default formatTime;
