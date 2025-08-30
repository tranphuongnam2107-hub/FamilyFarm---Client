import { useEffect, useState, useRef } from "react";
import instance from "../Axios/axiosConfig";

const useAuth = (navigate, location) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const publicRoutes = ["/Login", "/Register", "/ConfirmOtp", "/ForgotPassword", "/ResetPassword"];

  const clearAllTokens = () => {
    ["accessToken", "refreshToken", "username", "accId", "roleId", "tokenExpiry", "fullName", "avatarUrl", "profileData"].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  const getTokenFromStorage = (tokenName) => {
    return localStorage.getItem(tokenName) || sessionStorage.getItem(tokenName);
  };

  const getStorageType = () => {
    if (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken")) {
      return localStorage;
    }
    if (sessionStorage.getItem("accessToken") || sessionStorage.getItem("refreshToken")) {
      return sessionStorage;
    }
    return localStorage;
  };

  const scheduleNextRefresh = () => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    const expiryTime = parseInt(getTokenFromStorage("tokenExpiry") || "0", 10);
    if (!expiryTime) return;

    // Refresh token 5 phút trước khi hết hạn
    const refreshTime = expiryTime - (5 * 60 * 1000);
    const currentTime = Date.now();
    const timeUntilRefresh = refreshTime - currentTime;

    if (timeUntilRefresh > 0) {
      refreshIntervalRef.current = setTimeout(() => {
        refreshToken(true);
      }, timeUntilRefresh);
    } else {
      // Token đã hết hạn hoặc sắp hết hạn, refresh ngay
      refreshToken(true);
    }
  };

  const refreshToken = async (isScheduled = false) => {
    // Tránh refresh token đồng thời
    if (isRefreshingRef.current && !isScheduled) {
      return;
    }

    try {
      isRefreshingRef.current = true;
      
      const currentRefreshToken = getTokenFromStorage("refreshToken");

      if (!currentRefreshToken) {
        if (!publicRoutes.includes(location.pathname)) {
          setIsAuthenticated(false);
          clearAllTokens();
          navigate("/Login");
        }
        setIsLoading(false);
        return;
      }

      // Kiểm tra thời gian hết hạn của accessToken (chỉ khi không phải scheduled refresh)
      if (!isScheduled) {
        const expiryTime = parseInt(getTokenFromStorage("tokenExpiry") || "0", 10);
        if (expiryTime && Date.now() < (expiryTime - 60000)) { // Còn hơn 1 phút
          setIsAuthenticated(true);
          setIsLoading(false);
          scheduleNextRefresh();
          return;
        }
      }
      
      const response = await instance.post(
        "/api/authen/refresh-token",
        { token: currentRefreshToken },
        {
          skipInterceptor: true, // Bỏ qua interceptor để tránh loop
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const refreshData = response.data;
      const storage = getStorageType();

      // Cập nhật tokens
      storage.setItem("accessToken", refreshData.accessToken);
      storage.setItem("refreshToken", refreshData.refreshToken);
      storage.setItem("username", refreshData.username);
      storage.setItem("accId", refreshData.accId);
      
      if (refreshData.roleId) {
        storage.setItem("roleId", refreshData.roleId);
      }

      const newExpiryTime = Date.now() + refreshData.tokenExpiryIn * 1000;
      storage.setItem("tokenExpiry", newExpiryTime.toString());      
      setIsAuthenticated(true);
      
      // Schedule next refresh
      scheduleNextRefresh();

    } catch (error) {      
      if (!publicRoutes.includes(location.pathname)) {
        clearAllTokens();
        setIsAuthenticated(false);
        navigate("/Login");
      }
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  };

  const checkAuthStatus = () => {
    const accessToken = getTokenFromStorage("accessToken");
    const refreshTokenValue = getTokenFromStorage("refreshToken");
    
    if (!accessToken || !refreshTokenValue) {
      if (!publicRoutes.includes(location.pathname)) {
        clearAllTokens();
        navigate("/Login");
        setIsAuthenticated(false);
      }
      setIsLoading(false);
      return;
    }

    // Kiểm tra token expiry
    const expiryTime = parseInt(getTokenFromStorage("tokenExpiry") || "0", 10);
    const currentTime = Date.now();
    
    if (expiryTime && currentTime >= expiryTime) {
      refreshToken();
    } else if (expiryTime && currentTime >= (expiryTime - 5 * 60 * 1000)) {
      refreshToken();
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
      scheduleNextRefresh();
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
    };
  }, [navigate, location.pathname]);

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" || e.key === "refreshToken") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { isAuthenticated, isLoading, refreshToken: () => refreshToken(true) };
};

export default useAuth;