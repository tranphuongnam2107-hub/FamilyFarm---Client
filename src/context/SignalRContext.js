import React, { createContext, useContext, useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Khởi tạo currentUserId từ localStorage
    useEffect(() => {
        const initUserId = () => {
            const userId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
            // console.log("Initializing currentUserId:", userId);
            setCurrentUserId(userId);
        };

        initUserId();

        // Lắng nghe thay đổi localStorage (optional)
        const handleStorageChange = (e) => {
            if (e.key === "accId") {
                // console.log("localStorage accId changed:", e.newValue);
                setCurrentUserId(e.newValue);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Tạo SignalR connection khi có currentUserId
    useEffect(() => {
        if (!currentUserId) {
            // console.warn("No currentUserId, SignalR connection will not be established");
            return;
        }

        // console.log("Creating SignalR connection for userId:", currentUserId);

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${process.env.REACT_APP_API_BASE_URL}/chatHub?accId=${currentUserId}`, {
                accessTokenFactory: () => {
                    const token = localStorage.getItem("accessToken");
                    // console.log("Getting token for SignalR:", token ? "exists" : "missing");
                    return token;
                },
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection
            .start()
            .then(() => {
                // console.log("SignalR Connected successfully");
            })
            .catch((err) => {
                // console.error("SignalR Connection Error:", err);
            });

        newConnection.onreconnecting((err) => {
            // console.warn("SignalR Reconnecting:", err);
        });

        newConnection.onreconnected(() => {
            // console.log("SignalR Reconnected");
        });

        return () => {
            if (newConnection) {
                newConnection.stop().catch((err) => console.error("Error stopping SignalR:", err)
            );
            }
        };
    }, [currentUserId]); // Dependency vào currentUserId state

    const updateCurrentUserId = () => {
        const userId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
        // console.log("Manually updating currentUserId:", userId);
        setCurrentUserId(userId);
    };

    return (
        <SignalRContext.Provider value={{ connection, currentUserId, updateCurrentUserId }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => useContext(SignalRContext);