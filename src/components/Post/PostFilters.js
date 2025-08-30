import React from "react";

const PostFilters = () => {
  return (
    <div className="flex items-center justify-between px-3">
      <h2 className="text-lg font-bold">POSTS</h2>
      <div className="flex gap-3">
        <button className="p-2 bg-gray-200 rounded-md">Recent</button>
        <button className="p-2 bg-gray-200 rounded-md">Popular</button>
      </div>
    </div>
  );
};

export default PostFilters;