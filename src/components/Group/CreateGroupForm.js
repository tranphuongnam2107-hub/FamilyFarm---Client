import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";
import "./createGroupStyle.css";
import memberAvt from "../../assets/images/Ellipse 52.png";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { handleFileSelect } from '../../utils/validateFile';

export default function CreateGroupForm() {
  const navigate = useNavigate();

  // User Information
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const [groupName, setGroupName] = useState("");
  const [privacyType, setPrivacyType] = useState("Public");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  const [bgImage, setBgImage] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);

  // list friend khi search
  const [listFriends, setListFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get user information
  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") || sessionStorage.getItem("username");
    const storedFullName =
      localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
    const storedAvatarUrl =
      localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");

    if (storedUsername) {
      setUsername(storedUsername);
      setFullName(storedFullName || storedUsername);
      setAvatarUrl(storedAvatarUrl || defaultAvatar);
    }
  }, []);

  const [errors, setErrors] = useState({
    image: null, // lỗi chung cho avatar hoặc background
  });

  // Hàm up và thay đổi ảnh
  // const handleBgChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setBgImage(URL.createObjectURL(file));
  //     setBgFile(file);
  //     validateImages(avatarFile, file);
  //   } else {
  //     setBgImage(null);
  //     setBgFile(null);
  //     validateImages(avatarFile, null);
  //   }
  // };

  // Hàm up và thay đổi ảnh nền
  const handleBgChange = (e) => {
    handleFileSelect({
      event: e,
      setSelectedFile: (fileData) => {
        setBgImage(fileData.url); // Hiển thị ảnh nền
        setBgFile(fileData.file); // Lưu file ảnh nền
        validateImages(avatarFile, fileData.file); // Validate ảnh nền và avatar
      },
    });
  };

  // const handleAvatarChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setAvatarImage(URL.createObjectURL(file));
  //     setAvatarFile(file);
  //     validateImages(file, bgFile);
  //   } else {
  //     setAvatarImage(null);
  //     setAvatarFile(null);
  //     validateImages(null, bgFile);
  //   }
  // };

  const handleAvatarChange = (e) => {
    handleFileSelect({
      event: e,
      setSelectedFile: (fileData) => {
        setAvatarImage(fileData.url); // Hiển thị ảnh avatar
        setAvatarFile(fileData.file); // Lưu file avatar
        validateImages(fileData.file, bgFile); // Validate avatar và ảnh nền
      },
    });
  };

  // Hàm xóa ảnh
  const handleRemoveBgImage = () => {
    setBgImage(null);
    setBgFile(null);
  };

  const handleRemoveAvatarImage = () => {
    setAvatarImage(null);
    setAvatarFile(null);
  };

  // Valiadate thông thường
  const validate = () => {
    const newErrors = {};

    if (!groupName.trim()) newErrors.groupName = "Group name is required.";

    if (!privacyType || !["Public", "Private"].includes(privacyType)) {
      newErrors.privacyType = "Please select a valid privacy type.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Bắt validate ảnh
  const validateImages = (avatar, background) => {
    if (!avatar || !background) {
      setErrors((prev) => ({
        ...prev,
        image: "Background and Avatar is required.",
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, image: null }));
    return true;
  };

  // validate ảnh mỗi khi submitted thay đổi
  useEffect(() => {
    if (submitted) {
      validateImages(avatarFile, bgFile);
    }
  }, [submitted, avatarFile, bgFile]);

  // 👇 Chỉ xử lý khi groupName thay đổi
  useEffect(() => {
    if (groupName.trim()) {
      setErrors((prev) => ({ ...prev, groupName: "" }));
    }
  }, [groupName]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setIsLoading(true); // 🔹 Start loading

    const isFormValid = validate();
    const isImageValid = validateImages(avatarFile, bgFile);

    if (!isFormValid || !isImageValid) {
      setIsLoading(false); // 🔹 Stop loading if validation fails
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("GroupName", groupName);
      formData.append("GroupAvatar", avatarFile);
      formData.append("GroupBackground", bgFile);
      formData.append("PrivacyType", privacyType);

      const createRes = await instance.post("/api/group/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("GROUP CREATED SUCCESSFULLY!");

      const latestGroupRes = await instance.get("/api/group/get-lastest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const groupId = latestGroupRes?.data?.data?.[0]?.groupId;

      if (!groupId) {
        console.error("Cannot find newly created group.");
        return;
      }

      for (const member of selectedMembers) {
        try {
          await instance.post(
            `/api/group-member/create/${groupId}/${member.accId}`,
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (err) {
          console.error("Failed to add member:", member, err);
        }
      }

      navigate("/Group", { state: { section: "all-group-user" } });
    } catch (error) {
      console.error("Group creation failed:", error);
      if (error.response?.data) {
        toast.error(error.response.data || "Failed to create group!");
      } else {
        toast.error("Failed to create group!");
      }
    } finally {
      setIsLoading(false); // 🔹 Stop loading after everything
    }
  };

  //GỌI API LẤY DANH SÁCH FRIEND CỦA ACCID
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await instance.get("/api/friend/list-friend", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          var listFriendDb = response.data.data;
          setListFriends(listFriendDb);
        }
      } catch (error) {
        console.log("Cannot get list friend!");
      }
    };

    fetchFriends();
  }, []);

  const filteredFriends = listFriends.filter(
    (friend) =>
      (friend.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !selectedMembers.some((member) => member.accId === friend.accId)
  );

  // Thêm xóa thành viên trong preview mem list
  const handleAddMember = async (friend) => {
    try {
      const response = await instance.get(
        `/api/account/profile-another/${friend.accId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        const detailedProfile = response.data.data;
        setSelectedMembers((prev) => [...prev, detailedProfile]);
      } else {
        toast.error("Failed to fetch member profile.");
      }
    } catch (error) {
      console.error("Error fetching member profile:", error);
      toast.error("Could not load member info.");
    }
  };

  const handleRemoveMember = (accId) => {
    setSelectedMembers(
      selectedMembers.filter((member) => member.accId !== accId)
    );
  };

  return (
    <div className="group-page-right w-full h-full flex flex-col pt-12 lg:mt-[120px] md:ml-[30%] mt-[63px] pr-4 pl-[8%] lg:pl-0">
      <form
        onSubmit={handleCreateGroup}
        className="create-group-container w-full max-w-[832px] h-screen mb-[120px]"
      >
        <div className="create-h1-label">
          <h1 className="create-group-h1">Create new group</h1>
        </div>
        <div className="user-admin-container mt-10 flex md:flex-row items-center gap-4">
          <div className="avatar-admin rounded-full w-[60px] h-[60px]">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="admin-info flex flex-col gap-2">
            <div className="admin-name">{fullName}</div>
            <div className="admin-role bg-[#3DB3FB] px-[14px] py-[7px] bg-opacity-25 w-fit">
              Owner
            </div>
          </div>
        </div>

        <div className="image-upload-container mt-7 relative flex flex-col gap-4">
          {/* Background upload */}
          <div className="relative img-bg-container">
            <input
              className="hidden"
              type="file"
              id="background-group-img"
              accept="image/*"
              onChange={handleBgChange}
            />
            <label
              htmlFor="background-group-img"
              className="flex items-center justify-center gap-4 w-full h-[296px] rounded-[10px] bg-[#f5f5f5] border-[2px] border-solid border-[rgba(62,63,94,0.25)] cursor-pointer"
            >
              <i className="fa-solid fa-upload text-[var(--variable-collection-black)]"></i>
              <p className="upload-bg-img-text">Upload Background</p>
            </label>
            {bgImage && (
              <>
                <img
                  src={bgImage}
                  alt="bg"
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-[10px] border-[2px] border-solid border-[rgba(62,63,94,0.25)] z-0 pointer-events-none"
                />
                <button
                  onClick={handleRemoveBgImage}
                  type="button"
                  className="absolute w-6 h-6 top-2 right-2 bg-white rounded-full shadow p-1 z-10 hover:bg-gray-100"
                >
                  <i className="fa-solid fa-xmark text-red-500 ml-[1px]"></i>
                </button>
              </>
            )}
            {/* {errors.bgFile && <p className="text-red-500 text-sm mt-1">{errors.bgFile}</p>} */}
          </div>

          {/* Avatar upload */}
          <div className="absolute top-[50%] left-[5%] img-avt-container">
            <input
              className="hidden"
              type="file"
              id="avatar-group-img"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-group-img"
              className="flex items-center justify-center gap-2 rounded-full w-[130px] h-[130px] bg-[#ffffff] border-[3px] border-solid border-[rgba(62,63,94,0.25)] cursor-pointer"
            >
              <i className="upload-avt-icon fa-solid fa-upload text-[var(--variable-collection-black)]"></i>
              <p className="upload-avt-img-text">Upload Avatar</p>
            </label>
            {avatarImage && (
              <>
                <img
                  src={avatarImage}
                  alt="avatar"
                  className="absolute top-0 left-0 w-[130px] h-[130px] object-cover rounded-full border-[3px] border-solid border-[rgba(62,63,94,0.25)] z-10 pointer-events-none"
                />
                <button
                  onClick={handleRemoveAvatarImage}
                  type="button"
                  className="absolute w-6 h-6 top-1 right-1 bg-white rounded-full shadow p-1 z-20 hover:bg-gray-100"
                >
                  <i className="fa-solid fa-xmark text-red-500 text-[14px]"></i>
                </button>
              </>
            )}
          </div>
        </div>
        {submitted && errors.image && (
          <p className="text-red-500 text-start text-sm mt-2">{errors.image}</p>
        )}

        <div className="group-name-container w-fit mt-4">
          <input
            className="group-name-text px-[46px] py-[15px] bg-[#3DB3FB] bg-opacity-25 rounded-sm text-black text-[24px] font-light placeholder:font-light placeholder:text-[24px] placeholder:text-[rgba(62,63,94,0.25)] font-roboto border-none focus:outline-none focus:ring-0 focus:border-none"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Type your group name"
          />
          {errors.groupName && (
            <p className="text-red-500 text-start text-sm mt-1">
              {errors.groupName}
            </p>
          )}
        </div>

        <div className="type-privacy-container flex flex-row gap-6 mt-[54px]">
          <div className="title-privacy h-10 flex flex-row items-center gap-2">
            <div className="icon-privacy">
              <i className="fa-solid fa-shield-halved text-[24px] text-[var(--variable-collection-black)] text-opacity-50"></i>
            </div>
            <div className="privacy-text">Select privacy</div>
          </div>
          <div className="select-privacy h-10">
            <select
              className="w-[190px] p-2 bg-[#3DB3FB] bg-opacity-25 text-[#3DB3FB] focus:outline-none focus:ring-0 focus:border-none cursor-pointer font-roboto"
              name=""
              id=""
              value={privacyType}
              onChange={(e) => setPrivacyType(e.target.value)}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>

        <div className="group-member-container flex flex-col lg:flex-row gap-6 mt-[94px]">
          <div className="title-member h-10 flex flex-row items-center gap-2">
            <div className="icon-member">
              <i className="fa-solid fa-user-group text-[24px] text-[var(--variable-collection-black)] text-opacity-50"></i>
            </div>
            <div className="member-text">Invite friends</div>
          </div>
          <div className="search-container h-10 relative w-[190px] flex flex-row items-center gap-4 p-2">
            <i className="fa-solid fa-magnifying-glass relative text-[#3db3fb]"></i>
            <input
              className="input-friend w-fit relative text-black placeholder:text-[#3db3fb] focus:outline-none focus:ring-0 focus:border-none"
              type="text"
              placeholder="Search friend..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && filteredFriends.length > 0 && (
              <div className="suggestions bg-white border rounded shadow mt-2 absolute z-[999] max-h-[200px] overflow-y-auto top-9">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.accId}
                    className="p-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => handleAddMember(friend)}
                  >
                    {friend.fullName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="member-list-container md:w-[345px] flex flex-col gap-6">
            {selectedMembers.map((member) => (
              <div
                key={member.accId}
                className="member-card flex flex-row items-center justify-between p-2 bg-[#3db3fb] bg-opacity-25"
              >
                <div className="member-info flex flex-row items-center gap-2">
                  <div className="member-avatar rounded-full w-[32px] h-[32px] overflow-hidden">
                    <img
                      src={member.avatar || defaultAvatar}
                      alt={member.fullName}
                    />
                  </div>
                  <div className="member-name w-fit">{member.fullName}</div>
                </div>
                <i
                  className="fa-solid fa-xmark text-[#3db3fb] cursor-pointer"
                  onClick={() => handleRemoveMember(member.accId)}
                ></i>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`create-button lg:w-[220px] mt-14 p-[10px] flex items-center justify-center gap-[10px] rounded-sm transition-colors duration-200 ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3db3fb] hover:bg-[#50ace6] cursor-pointer"
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 
          1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </div>
          ) : (
            <div className="create-btn-text w-fit text-white">Create</div>
          )}
        </button>

      </form>
    </div>
  );
}
