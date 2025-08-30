import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import adminImg from "../../assets/images/ri_admin-fill.svg";
import memberImg from "../../assets/images/subway_admin.svg";

export default function PermissionGroup() {
  const [isOpen, setIsOpen] = useState(null);

  return (
    <div className="flex flex-col md:flex-row gap-4 px-4">
      <div className="md:w-2/3 w-full bg-white rounded p-4 shadow">
        <p className="text-sm text-gray-600 mb-2 font-semibold text-left">
          NUMBER OF REQUESTS: <span>123</span>
        </p>
        <div className="px-6 mb-4 relative">
          <input
            type="text"
            placeholder="Search member..."
            className="w-full border rounded-3xl px-10 py-2 text-sm bg-slate-200"
          />
          <i className="fas fa-search absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {[1, 2].map((id) => (
          <div
            key={id}
            className="bg-gray-50 p-3 rounded flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
                className="w-10 h-10 rounded-full"
                alt="Member"
              />
              <div>
                <p className="font-bold text-left">Minh Uyen</p>
                <p className="text-xs text-gray-500">Joined: May 20, 2025</p>
                <p className="text-xs text-left  text-gray-500">Kien Giang</p>
              </div>
            </div>

            <div className="relative inline-block text-left">
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsOpen(isOpen === id ? null : id)}
                  className="text-sm inline-flex justify-center w-full rounded-md border border-blue-300 shadow-sm px-4 py-2 bg-blue-200 text-blue-500 hover:bg-blue-50 focus:outline-none"
                >
                  Choose Role
                  <svg
                    className="ml-2 -mr-1 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isOpen === id && (
                  <div className="absolute right-3 w-30 rounded-md shadow-lg bg-blue z-50">
                    <div className="py-2 space-y-2">
                      <div className="flex items-center gap-1 px-1 py-1 rounded bg-green-200 text-green-700 hover:bg-green-100">
                        <img
                          src={adminImg}
                          alt="adminImg"
                          className="w-5 h-5"
                        />
                        <Link className="text-sm text-center flex-1 rounded py-1">
                          Administrator
                        </Link>
                      </div>

                      <div className="flex items-center gap-1 px-1 py-1 rounded bg-blue-200 text-blue-700 hover:bg-blue-100">
                        <img
                          src={memberImg}
                          alt="memberImg"
                          className="w-5 h-5"
                        />
                        <Link className="text-sm text-center flex-1 rounded py-1">
                          Member
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="md:w-1/3 w-full bg-gray-200 rounded p-4 shadow">dfg</div>
    </div>
  );
}
