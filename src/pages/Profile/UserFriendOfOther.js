import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import CoverBackground from "../../components/Profile/CoverBackground";
import ProfileAvatar from "../../components/Profile/ProfileAvatar";
import FriendActionButton from "../../components/Friend/FriendActionButton";
import YourFriendCard from "../../components/Friend/YourFriendCard";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import instance from "../../Axios/axiosConfig";
import FriendSuggestButton from "../../components/Friend/FriendSuggestButton";

const UserFriendOfOther = () => {
  const friends = [
    {
      username: "Dang Khoa",
      city: "Ho Chi Minh",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 5,
    },
    {
      username: "Huu Thuc",
      city: "Ha Noi",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 2,
    },
    { username: "Minh Uyen", city: "Da Nang", avatar: null, mutualFriend: 3 },
    {
      username: "Dang Khoa",
      city: "Ho Chi Minh",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 5,
    },
    { username: "Minh Uyen", city: "Da Nang", avatar: null, mutualFriend: 3 },
    {
      username: "Mai Xuan",
      city: "Can Tho",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 0,
    },
    { username: "Minh Uyen", city: "Da Nang", avatar: null, mutualFriend: 3 },
    {
      username: "Dang Khoa",
      city: "Ho Chi Minh",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 5,
    },
    {
      username: "Mai Xuan",
      city: "Can Tho",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 0,
    },
    {
      username: "Huu Thuc",
      city: "Ha Noi",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 2,
    },
    {
      username: "Mai Xuan",
      city: "Can Tho",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 0,
    },
    {
      username: "Huu Thuc",
      city: "Ha Noi",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/Minecraft_2024_cover_art.png/250px-Minecraft_2024_cover_art.png",
      mutualFriend: 2,
    },
  ];

  const { user } = useUser();
  const [avatar, setAvatar] = useState("");
  const [fullName, setFullName] = useState(user?.fullName || "Unknown");
  const [background, setBackground] = useState("");
  const [basicInfo, setBasicInfo] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState([]);

  const { accId } = useParams();
  const defaultBackground = "...";
  const storeData =
    localStorage.getItem("profileData") ||
    sessionStorage.getItem("profileData");
  const myProfile = storeData ? JSON.parse(storeData) : null;
  const isOwner = !accId || accId === myProfile?.accId;
  const [listFriends, setListFriends] = useState([]);
  const [listCheckRelationShip, setlistCheckRelationShip] = useState([]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;
        if (isOwner) {
          response = await instance.get("/api/account/own-profile", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.status === 200) {
            const data = response.data.data;
            setFullName(data.fullName || "Unknown");
            setAvatar(data.avatar);
            setBackground(data.background || defaultBackground);

            const basicInfoMapping = {
              gender: data.gender || "Updating",
              location: data.address || "Updating",
              study: data.studyAt || "Updating",
              work: data.workAt || "Updating",
            };
            setBasicInfo(basicInfoMapping);

            const storage = localStorage.getItem("accessToken")
              ? localStorage
              : sessionStorage;
            storage.setItem("profileData", JSON.stringify(data));
            storage.setItem("avatarUrl", data.avatar);
            storage.setItem("fullName", data.fullName);
          }
        } else {
          response = await instance.get(
            `/api/account/profile-another/${accId}`
          );
          if (response.status === 200) {
            const data = response.data.data;
            setFullName(data.fullName || "Unknown");
            setAvatar(data.avatar);
            setBackground(data.background || defaultBackground);

            const basicInfoMapping = {
              gender: data.gender || "Updating",
              location: data.address || "Updating",
              study: data.studyAt || "Updating",
              work: data.workAt || "Updating",
            };
            setBasicInfo(basicInfoMapping);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy profile:", error);
      }
    };

    fetchProfile();
  }, [accId, isOwner, accessToken]);

  //lấy thông tin người dùng từ storage
  useEffect(() => {
    const storedAccId =
      localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAccesstoken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (storedAccId) {
      setAccessToken(storedAccesstoken);
    }
  }, []);

  // get list friend
  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = isOwner
        ? `https://localhost:7280/api/friend/list-friend`
        : `https://localhost:7280/api/friend/list-friend-other/${accId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      if (json.data && json.data.length > 0) {
        setListFriends(json.data);
        //console.log(isOwner + "aaaaaaaaaaaaaaaaaa");
      } else {
        setListFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setListFriends([]);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchFriends();
    }
  }, [accId, isOwner, accessToken]);
  const fetchlistCheckRelationShip = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://localhost:7280/api/friend/list-account-no-relation`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const jsonArray = await res.json();
      console.log("API response (list-account-no-relation):", jsonArray);

      // Gộp tất cả data từ các object có isSuccess === true
      const combinedList = jsonArray
        .filter((item) => item.isSuccess && Array.isArray(item.data))
        .flatMap((item) => item.data); // dùng flatMap để nối tất cả mảng lại

      if (combinedList.length > 0) {
        setlistCheckRelationShip(combinedList);
        console.log("Danh sách không có quan hệ:", combinedList);
      } else {
        setlistCheckRelationShip([]);
      }
    } catch (err) {
      console.error("Error fetching friends:", err.message || err);
      setlistCheckRelationShip([]);
    }
  };

  useEffect(() => {
    fetchlistCheckRelationShip(); // chỉ gọi khi component load hoặc section thay đổi
  }, []);
  const matchedAccount =
    !isOwner &&
    Array.isArray(listCheckRelationShip) &&
    listCheckRelationShip.find((a) => a.accId === accId);

  return (
    <div>
      <div className="min-h-screen flex flex-col">
        <Header />
        <NavbarHeader />
        <div className="flex-grow">
          <div className="container mx-auto max-w-7xl">
            <div className="relative">
              <CoverBackground backgroundImage={background} isOwner={isOwner} />
              {matchedAccount && (
                <div className="absolute right-4 bottom-4">
                  <FriendSuggestButton
                    status={matchedAccount.friendStatus}
                    roleId={matchedAccount.roleId}
                    accId={matchedAccount.accId}
                  />
                </div>
              )}

              <ProfileAvatar
                initialProfileImage={avatar}
                fullName={fullName || user?.fullName}
                isOwner={isOwner}
              />
            </div>
            <div className="flex-row gap-5 pt-10 text-left">
              <div className="p-3">
                <Link to={`/PersonalPage/${accId}`}>Profile /</Link>
                <Link className="text-blue-500" to="">
                  {" "}
                  Friends{" "}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listFriends.length > 0 ? (
                listFriends.map((friend) => (
                  <YourFriendCard
                    key={friend.accId}
                    friend={friend}
                    isOwner={isOwner}
                    isProfile={true}
                  />
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center">
                  No data to display...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFriendOfOther;
