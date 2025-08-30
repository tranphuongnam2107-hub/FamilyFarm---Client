import React, { createContext, useContext, useState, useEffect } from "react";
import instance from "../Axios/axiosConfig";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async (forceReload = false) => {
    try {
      setIsLoading(true);
      
      const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
      const token = storage.getItem("accessToken");
      
      if (!token) {
        // Không có token, clear user data
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Nếu không force reload, thử load từ cache trước
      if (!forceReload) {
        const storedData = storage.getItem("profileData");
        if (storedData) {
          const cachedUser = JSON.parse(storedData);
          setUser(cachedUser);
        }
      }

      // Luôn fetch data mới từ API
      const response = await instance.get("/api/account/own-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.status === 200) {
        const data = response.data.data;
        setUser(data);
        storage.setItem("profileData", JSON.stringify(data));
        storage.setItem("avatarUrl", data.avatar);
        storage.setItem("fullName", data.fullName);
        // console.log("User data loaded:", data);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // Nếu API fail, clear user data
      setUser(null);
      const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
      storage.removeItem("profileData");
      storage.removeItem("avatarUrl");
      storage.removeItem("fullName");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Listen for storage changes (khi user login/logout từ tab khác)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken" || e.key === "profileData") {
        // console.log("Storage changed, reloading user data");
        loadUser(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateUser = (newData) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...newData };
      const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
      storage.setItem("profileData", JSON.stringify(updatedUser));
      storage.setItem("avatarUrl", newData.avatar || prev.avatar);
      storage.setItem("fullName", newData.fullName || prev.fullName);
      return updatedUser;
    });
  };

  const reloadUser = () => {
    loadUser(true);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      isLoading, 
      reloadUser 
    }}>
      {isLoading ? <div>Loading...</div> : children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);