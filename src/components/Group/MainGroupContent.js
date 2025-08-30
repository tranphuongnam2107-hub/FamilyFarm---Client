
import React, { useEffect, useState } from "react";

const groupId = "660000000000000000000001"; // thay bằng groupId thật

export default function MainGroupContent() {
  const [members, setMembers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy danh sách thành viên khi load trang hoặc groupId thay đổi
  useEffect(() => {
    fetchMembers();
  }, []);

  // Hàm fetch danh sách thành viên
  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://localhost:7280/api/group-member/users/in-group/${groupId}`
      );
      if (!res.ok) {
        throw new Error("Không lấy được danh sách thành viên");
      }
      const data = await res.json();
      console.log("API data:", data);

      setMembers(data);
    } catch (err) {
      setError(err.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  // Hàm tìm kiếm thành viên trong nhóm
  const searchMembers = async (keyword) => {
    if (!keyword.trim()) {
      fetchMembers();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://localhost:7280/api/group-member/search-user-in-group/${groupId}?keyword=${encodeURIComponent(
          keyword
        )}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          setMembers([]);
          setError("Không tìm thấy thành viên.");
          setLoading(false);
          return;
        }
        throw new Error("Lỗi tìm kiếm thành viên");
      }
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message || "Lỗi server");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý input tìm kiếm
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchKeyword(val);
    searchMembers(val);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 px-4">
      <div className="md:w-2/3 w-full bg-white rounded p-4 shadow">
        <p className="text-sm text-gray-600 mb-2 font-semibold text-left">
          MEMBERS: <span>{members.length}</span>
        </p>
        <div className="px-6 mb-4 relative">
          <input
            type="text"
            placeholder="Search member..."
            className="w-full border rounded-3xl px-10 py-2 text-sm  bg-gray-200"
            value={searchKeyword}
            onChange={handleSearchChange}
          />
          <i className="fas fa-search absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Hiển thị danh sách thành viên */}
        {members.length === 0 && !loading && !error && (
          <p>Không có thành viên nào.</p>
        )}

        {members.map((member) => (
          <div
            key={member.accId}
            className="bg-gray-50 p-3 rounded flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  member.avatar ||
                  "https://th.bing.com/th/id/OIP.EKontM__37mRqxwRkIqX8wHaEK?rs=1&pid=ImgDetMain"
                }
                className="w-10 h-10 rounded-full"
                alt={member.fullName}
              />
              <div>
                <p className="font-bold text-left">{member.fullName}</p>
                <p className="text-xs text-gray-500">
                  Joined:{" "}
                  {member.JoinAt
                    ? new Date(member.JoinAt).toLocaleDateString("vi-VN")
                    : "Không rõ ngày"}
                  {member.city || ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Ví dụ hiện nút Add friend cho 1 số điều kiện */}
              <button className="bg-red-100 text-red-500 px-3 py-1 text-sm rounded hover:bg-red-300">
                Add friend
              </button>
              <button className="text-xl px-1 rounded text-blue-600 bg-blue-300">
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="md:w-1/3 w-full bg-gray-200 rounded p-4 shadow">dfg</div>
    </div>
  );
}
