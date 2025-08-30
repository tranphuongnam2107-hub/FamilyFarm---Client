import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PopupChangeImage from "./PopupChangeImage";
import PopupInviteMember from "./PopupInviteMember";
import { useSignalR } from "../../context/SignalRContext";
import instance from "../../Axios/axiosConfig";

const GroupDetailHeader = ({
  group,
  userRole,
  userAccId,
  memberStatus,
  countMember,
  selectedTab,
  setSelectedTab,
  reload,
  reloadsignlR,
  searchKeyword,
  setSearchKeyword,
  countPosts
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupInvite, setShowPopupInvite] = useState(false);

  // Load ảnh theo thời gian thực
  function getCacheBustedUrl(url, updatedAt) {
    if (!url) return url;
    if (!updatedAt) return url + `?v=${Date.now()}`;
    return url + `?v=${encodeURIComponent(updatedAt)}`;
  }

  const backgroundUrl = getCacheBustedUrl(
    group?.groupBackground,
    group?.updatedAt
  );
  const avatarUrl = getCacheBustedUrl(group?.groupAvatar, group?.updatedAt);

  // useEffect(() => {
  //   console.log('Group avatar URL:', group?.groupAvatar);
  //   console.log('Group updatedAt:', group?.updatedAt);
  //   console.log('Avatar URL render:', avatarUrl);
  // }, [group, avatarUrl]);

  if (!group) return <div>Loading...</div>;
  return (
    <div>
      {/* md:w-[832px] h-72 md:h-[24rem] shadow-md relative rounded-md overflow-hidden */}
      <div className="w-full h-[200px] md:w-[832px] md:h-[296px] shadow-md relative rounded-md overflow-hidden">
        {/* background */}
        <div className="w-full h-full">
          <img
            className="w-full h-full object-cover"
            src={backgroundUrl}
            alt=""
          />
        </div>
        {/* avatar */}
        <div className="absolute left-8 z-10 bottom-6">
          <img
            className="rounded-full w-14 h-14 md:w-[130px] md:h-[130px] object-fill "
            src={avatarUrl}
            alt=""
          />
        </div>
        <div className="absolute right-8 z-10 bottom-6 flex flex-row gap-2">
          <button
              className="bg-white hover:bg-[rgba(61,179,251,0.14)] p-2 md:p-3 text-black rounded-[20px] border border-gray-500 hover:text-white"
              onClick={() => setShowPopupInvite(true)}
            >
              <i className="fa-solid fa-user-plus text-[#3DB3FB] mr-2"></i>
              Invite
            </button>
          {userRole === "680ce8722b3eec497a30201e" && (
            <button
              className="bg-white hover:bg-[rgba(61,179,251,0.14)] p-2 md:p-3 text-black rounded-[20px] border border-gray-500 hover:text-white"
              onClick={() => setShowPopup(true)}
            >
              <i className="fa-solid fa-pen px-1 text-[#3DB3FB] mr-2"></i>
              Change image
            </button>
          )}
        </div>
      </div>
      {showPopupInvite && (
        <PopupInviteMember
          group={group}
          userAccId={userAccId}
          onClose={() => setShowPopupInvite(false)} 
          reloadsignlR={reloadsignlR}
          />
      )}
      {showPopup && (
        <PopupChangeImage
          group={group}
          userRole={userRole}
          userAccId={userAccId}
          onClose={() => setShowPopup(false)}
          onSave={() => {
            console.log("Save image clicked");
            setShowPopup(false);
            reloadsignlR(); // nếu cần reload lại group
          }}
        />
      )}

      <div>
        <div className="p-4 text-left">
          <div className="md:flex md:flex-row justify-between flex-col">
            <h2 className="text-2xl font-bold mb-5 break-words max-w-2xl">
              {group.groupName || "groupName"}
            </h2>

            {["680cea9fd26b52bd2922a596", "680ce8722b3eec497a30201e"].includes(
              userRole
            ) && (
              <Link
                to={`/EditGroup/${group.groupId}`}
                className=" hover:text-[#3DB3FB]"
                state={{ userRole: userRole, userAccId: userAccId }}
              >
                Setting group
              </Link>
            )}
          </div>

          <div className="md:flex justify-between md:flex-row flex-col">
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-7 flex gap-10">
                <span>
                  <span className="font-bold text-black"> Created:</span>{" "}
                  {new Date(group.createdAt).toLocaleDateString("vi-VN")}{" "}
                  &nbsp;&nbsp;{" "}
                </span>
                <span>
                  <span className="font-bold text-black">Members: </span>
                  {countMember} &nbsp;&nbsp;
                </span>
                <span>
                  {" "}
                  <span className="font-bold text-black"> Posts: </span> {countPosts}
                </span>
              </p>
            </div>
            <div>
              <div className="flex justify-center items-center">
                <div className="h-10 flex overflow-hidden rounded-[30px] bg-[#fff] border-[#D1D1D1] border-solid outline outline-[0.5px] outline-gray-200">
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
            </div>
          </div>

          <div className="md:flex md:flex-row space-x-6 mt-2 text-sm text-black-500 font-bold md:text-center flex flex-wrap w-[390px] md:w-full">
            <button
              onClick={() => setSelectedTab("posts")}
              className={`md:w-[10%] ${
                selectedTab === "posts"
                  ? "shadow-[0_2px_0_0_#3DB3FB] text-[#3DB3FB]"
                  : "text-black"
              } hover:shadow-[0_2px_0_0_#3DB3FB] hover:text-[#3DB3FB]`}
            >
              Home
            </button>

            <button
              onClick={() => setSelectedTab("members")}
              className={`md:w-[10%] ${
                selectedTab === "members"
                  ? "shadow-[0_2px_0_0_#3DB3FB] text-[#3DB3FB]"
                  : "text-black"
              } hover:shadow-[0_2px_0_0_#3DB3FB] hover:text-[#3DB3FB]`}
            >
              Member
            </button>
            <button
              onClick={() => setSelectedTab("requests")}
              className={`md:w-[10%] ${
                selectedTab === "requests"
                  ? "shadow-[0_2px_0_0_#3DB3FB] text-[#3DB3FB]"
                  : "text-black"
              } hover:shadow-[0_2px_0_0_#3DB3FB] hover:text-[#3DB3FB]`}
            >
              Add to Join
            </button>

            <button
              onClick={() => setSelectedTab("permission")}
              className={`md:w-[10%] ${
                selectedTab === "permission"
                  ? "shadow-[0_2px_0_0_#3DB3FB] text-[#3DB3FB]"
                  : "text-black"
              } hover:shadow-[0_2px_0_0_#3DB3FB] hover:text-[#3DB3FB]`}
            >
              Permissions
            </button>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailHeader;
