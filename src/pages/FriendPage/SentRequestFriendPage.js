import React, { useState, useEffect } from "react";
import FriendSidebar from "../../components/Friend/FriendSidebar";
import FriendRight from "../../components/Friend/FriendRight";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder } from "@microsoft/signalr";
import FriendCard from "../../components/Friend/FriendCard";
import YourFriendCard from "../../components/Friend/YourFriendCard";

const SentRequestFriendPage = () => {
  const [roleId, setRoleId] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [count, setCountFriend] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);

      // Lấy RoleId
      const roleIdFromToken = decoded.RoleId;
      console.log("RoleId:", roleIdFromToken);

      // Cập nhật state roleId
      setRoleId(roleIdFromToken);

      // Hoặc lấy role string
      const roleString =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      console.log("Role string:", roleString);
    } else {
      console.log("No token found");
    }
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://localhost:7280/api/friend/requests-sent`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await res.json();

      if (json.count !== 0) {
        setFriendsData(json.data);
        setCountFriend(json.count);
      } else {
        setFriendsData([]);
        setCountFriend(json.count);
      }
    } catch (err) {
      console.error("Error fetching friends:", err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends(); // chỉ gọi khi component load hoặc section thay đổi
  }, []);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7280/friendHub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR connected");

        connection.on("FriendUpdate", () => {
          console.log("✅ FriendUpdate event received"); // <== KHÔNG in được dòng này là do .on(...) chưa đăng ký
          fetchFriends();
        });
      })
      .catch((err) => console.error("SignalR connection error:", err));

    return () => {
      connection.stop();
    };
  }, []);
  const filteredFriends = (friendsData || []).filter((friend) =>
    friend.username.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="flex ">
        <FriendSidebar roleId={roleId} />
        <div className="w-full lg:mt-[120px] mt-[63px]">
          <div>
            <p className="font-bold text-lg flex items-start mt-8 mx-10 md:mx-20">
              Sent Request list
            </p>
            {friendsData && friendsData.length > 0 ? (
              <div>
                <div className="flex gap-6 items-center mt-6 mb-10 mx-10 md:mx-20">
                  <div className="flex justify-center items-center">
                    <div className="h-10 flex overflow-hidden rounded-[30px] bg-[#fff] border-[#D1D1D1]border-solid outline outline-[0.5px] outline-gray-200">
                      <i className="fa-solid fa-magnifying-glass flex h-full justify-center items-center shrink-0 px-2 text-[#999999]"></i>
                      <input
                        type="text"
                        placeholder="Search"
                        className="flex-1 outline-none border-none h-full"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <p className="font-bold ">{friendsData.length}</p>
                    <p className="text-[#999999] font-bold">SENT REQUESTS</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-6 place-items-center md:mx-20 md:w-[954px]">
                  {/* <div
            className={`grid grid-cols-1 ${
              section === "requests-receive" ? "md:grid-cols-4" : "md:grid-cols-5"
            } gap-y-6 gap-x-6 place-items-center md:mx-20 md:w-[954px]`}
          > */}
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <YourFriendCard key={friend.accId} friend={friend} />
                    ))
                  ) : (
                    <p className="text-gray-500">No data found.</p>
                  )}
                </div>
              </div>
            ) : (
              <div>No data to display....</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentRequestFriendPage;
