import React from "react";
import { Link } from "react-router-dom";
const Cover = () => {
  return (
    <div className="bg-white rounded shadow overflow-hidden mb-5 relative">
      <img
        src="https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
        alt="Group Banner"
        className="w-full h-60 object-cover"
      />
      <div className="absolute top-32 left-6">
        <img
          src="https://th.bing.com/th/id/OIP.ZShPzTqjz_ddVJtAeHUv2AHaEK?w=294&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
          alt="Avatar"
          className="w-24 h-24 rounded-full shadow-lg"
          style={{ border: "5px solid white" }}
        />
      </div>
      <div className="p-4 text-left">
        <h2 className="text-2xl font-bold mb-5">Support Coursera FPT K17</h2>
        <p className="text-sm text-gray-500 mb-7 ">
          <span className="font-bold text-black"> Created:</span> April, 13 2020
          &nbsp;&nbsp; <span className="font-bold text-black">Members: </span>
          200K &nbsp;&nbsp;
          <span className="font-bold text-black"> Posts: </span> 998
        </p>
        <div className="flex space-x-6 mt-2 text-sm text-black-500 font-bold ml-10">
          <Link to="" className=" hover:text-cyan-300">
            Home
          </Link>
          <Link to="" className="text-cyan-400 ">
            Member
          </Link>
          <Link to="" className=" hover:text-cyan-300">
            Add to Join
          </Link>
          <Link to="" className=" hover:text-cyan-300">
            Permissions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cover;
