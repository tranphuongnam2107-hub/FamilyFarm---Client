import React, { useState } from "react";
import { Link } from "react-router-dom";
import TablePostOfAccount from "./TablePostOfAccount";
import TableServiceAccount from "./TableServiceAccount";

const AccountDetail = ({ account, listPost, listService }) => {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div>
      <div className="text-left mb-5 font-semibold flex items-center gap-2 text-[#3E3F5E]/25">
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z"
            fill="rgba(62,63,94,0.25)"
          />
        </svg>
        <span>
          <Link to="/Dashboard">HOME</Link> / Account Management / Account
          Detail
        </span>
      </div>
      <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
        ACCOUNT DETAIL
      </h1>
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("basic")}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "basic"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Basic Information
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "post"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Post
        </button>
        <button
          onClick={() => setActiveTab("service")}
          className={`mr-6 pb-2 px-5 font-semibold ${
            activeTab === "service"
              ? "border-b-2 border-blue-400 text-blue-500"
              : "text-gray-400"
          }`}
        >
          Service
        </button>
      </div>
      <div className="flex gap-2 w-full align-middle items-center mt-10 font-bold">
        <img
          className="rounded-full w-[40px] h-[40px] object-cover mr-4"
          src={
            account.avatar ||
            "https://th.bing.com/th/id/OIP.UOAPhQfUAJFR_ynpnMtWqgHaEJ?w=326&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
          }
          alt=""
        />
        <p>{account.fullName}</p>
        <p>-</p>
        <p className="bg-[rgba(43,182,115,0.25)] p-2">
          {account.roleId === "68007b2a87b41211f0af1d57" ? "Expert" : "Farmer"}
        </p>
      </div>
      {activeTab === "basic" && (
        <div className="w-[80%] mt-7 bg-white rounded-xl">
          <div className="flex text-left items-center border-b border-gray-200">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">
              Full Name:
            </div>
            <p className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>
              {account.fullName}
            </p>
          </div>
          <div className="flex text-left items-center border-b border-gray-200">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">
              Username:
            </div>
            <p  className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>{account.username}</p>
          </div>
          <div className="flex text-left items-center border-b border-gray-200">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">
              Address:
            </div>
            <p  className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>{account.address}</p>
          </div>
          <div className="flex text-left items-center border-b border-gray-200">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">Phone:</div>
            <p  className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>{account.phoneNumber}</p>
          </div>
          <div className="flex text-left items-center border-b border-gray-200">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">Email:</div>
            <p  className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>{account.email}</p>
          </div>
          <div className="flex text-left items-center border-b border-gray-200">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">Gender:</div>
            <p  className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>{account.gender}</p>
          </div>
          <div className="flex text-left items-center">
            <div className="pt-4 pb-4 w-[180px] pl-4 font-semibold">
              Birthday:
            </div>
            <p  className="pl-4 p-3  text-black w-full rounded-sm" style={{ border: "0.5px solid #d1d5db" }}>
              {new Date(account.birthday).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      )}
      {activeTab === "post" && (
        <div className="w-full mt-7 bg-white rounded-xl">
          <TablePostOfAccount key={account.accId} listPost={listPost} />
        </div>
      )}
      {activeTab === "service" && (
        <div className="w-full mt-7 bg-white rounded-xl">
          <TableServiceAccount key={account.accId} listService={listService} />
        </div>
      )}
    </div>
  );
};

export default AccountDetail;
