import React from "react";
import YourFriendCard from "./YourFriendCard";

const YourFriendRight = () => {
  return (
    <div className="w-full">
      <div>
        <p className="font-bold text-lg flex items-start mt-8 mx-10 md:mx-20">
          Your friends
        </p>
        <div className="flex gap-6 items-center mt-6 mb-10 mx-10 md:mx-20">
          <div className="flex justify-center items-center">
            <div className="h-10 flex overflow-hidden rounded-[30px] bg-[#fff] border-[#D1D1D1]border-solid border">
              <i className="fa-solid fa-magnifying-glass flex h-full justify-center items-center shrink-0 px-2 text-[#999999]"></i>
              <input
                type="text"
                placeholder="Search"
                className="flex-1 outline-none border-none h-full"
              />
            </div>
          </div>
          <div className="flex gap-1">
            <p className="font-bold ">8</p>
            <p className="text-[#999999] font-bold">FRIENDS</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-6 place-items-center md:mx-20 md:w-[954px]">
          <YourFriendCard />
          
        </div>
      </div>
    </div>
  );
};

export default YourFriendRight;
