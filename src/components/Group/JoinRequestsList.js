import React from "react";

export default function JoinRequestsList() {
  return (
    // <div className="py-2">
    //   <div className="px-6 pb-6 pt-5 bg-white rounded shadow overflow-hidden">

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
            <div className="flex items-center gap-2">
              {id === 1 && (
                <button className="bg-red-100 text-red-500 px-4 py-2 text-sm rounded hover:bg-red-300">
                  Delete
                </button>
              )}
              <button className="bg-blue-100 text-blue-500 px-4 py-2 text-sm rounded hover:bg-blue-300">
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="md:w-1/3 w-full bg-gray-200 rounded p-4 shadow">dfg</div>
    </div>
  );
}
