// src/utils/auth.js
import jwtDecode from "jwt-decode";

export const getUserInfoFromToken = (accessToken) => {
    if (!accessToken) {
        console.warn("No access token provided");
        return null;
    }

    try {
        const decodedToken = jwtDecode(accessToken);
        return {
            username: decodedToken.name || "",
            email: decodedToken.email || "",
            accId: decodedToken.AccId || "",
            roleId: decodedToken.RoleId || "",
            roleName: decodedToken.role || "",
            expiry: decodedToken.exp ? decodedToken.exp * 1000 : null, // Thời gian hết hạn (mili giây)
        };
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
};

// Hàm lấy thông tin người dùng từ storage
export const getUserInfo = () => {
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    return getUserInfoFromToken(accessToken);
};