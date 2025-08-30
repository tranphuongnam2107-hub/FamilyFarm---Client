import React from "react";
import iconEye from "../../assets/images/lets-icons_view-duotone.svg";
import Group from "../../assets/images/Group.svg";
import { Link } from "react-router-dom";

const GroupSidebarU = () => {
  const groups = [
    {
      name: "React tutorials",
      image:
        "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain",
    },
    {
      name: "React tutorials",
      image:
        "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain",
    },
    {
      name: "React tutorials",
      image:
        "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain",
    },
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-3 text-left">Your Groups</h2>
      {groups.map((group, index) => (
        <div key={index} className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 ">
            <img
              src={group.image}
              alt="Group"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <p className="font-bold">{group.name}</p>
              <div className="relative">
                <Link href="#" className="text-sm text-blue-500 text-left">
                  View group
                </Link>
                <img
                  className="mdi-eye fas fa-search absolute left-23 top-1/2 transform -translate-y-1/2 text-gray-400"
                  src={iconEye}
                  alt="Eye"
                />
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              className="absolute right-11 top-1/2 transform -translate-y-1/2 text-gray-400"
              src={Group}
              alt="Eye"
            />
            <button className="text-red-500 text-sm">Leave</button>
          </div>{" "}
        </div>
      ))}
    </div>
  );
};

export default GroupSidebarU;
