import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Helper function để xác định storage type một cách nhất quán
const getStorageType = () => {
  // Kiểm tra accessToken trước, sau đó mới đến refreshToken
  if (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken")) {
    return localStorage;
  }
  if (sessionStorage.getItem("accessToken") || sessionStorage.getItem("refreshToken")) {
    return sessionStorage;
  }
  return localStorage; // fallback
};

const getTokenFromStorage = (tokenName) => {
  return localStorage.getItem(tokenName) || sessionStorage.getItem(tokenName);
};

const clearAllTokens = () => {
  // Xóa từ cả hai storage để đảm bảo
  ["accessToken", "refreshToken", "username", "accId", "roleId", "tokenExpiry", "fullName", "avatarUrl", "profileData"].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const accessToken = getTokenFromStorage("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor cho các authentication requests
    if (originalRequest.skipInterceptor) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, thêm vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentRefreshToken = getTokenFromStorage("refreshToken");

        if (!currentRefreshToken) {
          // console.log("No refresh token found, redirecting to login");
          clearAllTokens();
          window.location.href = "/Login";
          return Promise.reject(error);
        }

        // console.log("Attempting to refresh token...");

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/authen/refresh-token`,
          { token: currentRefreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000 // Shorter timeout for refresh requests
          }
        );

        const refreshData = response.data;

        // Sử dụng storage type đã được xác định trước đó
        const storage = getStorageType();

        // Cập nhật tất cả token và thông tin liên quan
        storage.setItem("accessToken", refreshData.accessToken);
        storage.setItem("refreshToken", refreshData.refreshToken);
        storage.setItem("username", refreshData.username);
        storage.setItem("accId", refreshData.accId);

        // Cập nhật thời gian hết hạn
        const expiryTime = Date.now() + refreshData.tokenExpiryIn * 1000;
        storage.setItem("tokenExpiry", expiryTime);

        // Lưu roleId nếu có
        if (refreshData.roleId) {
          storage.setItem("roleId", refreshData.roleId);
        }

        // console.log("Token refreshed successfully via interceptor");

        // Process queue với token mới
        processQueue(null, refreshData.accessToken);

        // Retry original request với token mới
        originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;
        return instance(originalRequest);

      } catch (refreshError) {
        // console.log("Token refresh failed:", refreshError.message);

        // Process queue với error
        processQueue(refreshError);

        // Clear tất cả tokens và redirect
        clearAllTokens();
        window.location.href = "/Login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;