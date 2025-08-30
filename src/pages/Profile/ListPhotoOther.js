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
import PhotoItem from "../../components/Profile/PhotoItem";
import FriendSuggestButton from "../../components/Friend/FriendSuggestButton";

const ListPhotoOther = () => {
  const { user } = useUser();
  const [avatar, setAvatar] = useState("");
  const [fullName, setFullName] = useState(user?.fullName || "Unknown");
  const [background, setBackground] = useState("");
  const [basicInfo, setBasicInfo] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const { accId } = useParams();
  const defaultBackground = "...";
  const storeData =
    localStorage.getItem("profileData") ||
    sessionStorage.getItem("profileData");
  const myProfile = storeData ? JSON.parse(storeData) : null;
  const isOwner = !accId || accId === myProfile?.accId;
  const [listCheckRelationShip, setlistCheckRelationShip] = useState([]);
  const [photos, setPhotos] = useState([]);

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

  //get list photo
  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = isOwner
        ? `https://localhost:7280/api/post/images`
        : `https://localhost:7280/api/post/images/${accId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      if (json.data && json.count > 0) {
        setPhotos(json.data);
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      setPhotos([]);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchPhotos();
    }
  }, [accId, isOwner, accessToken]);
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
                  Photos{" "}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    onClick={() => setSelectedPhoto(photo)}
                    src={photo}
                    alt="Photos"
                    className="w-full h-44 object-cover rounded-md"
                  />
                </div>
              ))}

              {selectedPhoto && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 opacity-95"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <div
                    className="bg-white p-4 rounded-lg flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-[400px] h-[400px]">
                      <img
                        src={selectedPhoto}
                        alt="Selected"
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPhotoOther;
