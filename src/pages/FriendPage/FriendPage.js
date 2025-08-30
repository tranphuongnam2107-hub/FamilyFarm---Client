import React, { useState, useEffect } from "react";
import FriendSidebar from "../../components/Friend/FriendSidebar";
import FriendRight from "../../components/Friend/FriendRight";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import { jwtDecode } from "jwt-decode";

const FriendPage = () => {

  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);

      // Lấy RoleId
      const roleIdFromToken = decoded.RoleId;
      console.log("RoleId:", roleIdFromToken);

      // Cập nhật state roleId
      setRoleId(roleIdFromToken);

      // Hoặc lấy role string
      const roleString =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      console.log("Role string:", roleString);
    } else {
      console.log("No token found");
    }
  }, []);

  if (roleId === null) return <p>Loading...</p>;

  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="flex ">
        <FriendSidebar  roleId={roleId} />
        <FriendRight />
      </div>
    </div>
  );
};

export default FriendPage;
