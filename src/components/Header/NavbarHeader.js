import React from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";

import addFriendIcon from "../../assets/images/nam_fluent-mdl2_add-friend.svg";
import groupIcon from "../../assets/images/nam_clarity_group-solid.svg";
import serviceIcon from "../../assets/images/nam_eos-icons_service.svg";

const NavbarHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const path = location.pathname;

  return (
    <nav className="navbar-header bg-white mt-14 fixed z-50">
      <div className="navbar-header-wrapper">
        <Link
          to="/"
          className={`navbar-header-item ${path === "/" ? "item-active" : ""}`}
        >
          <i className="fa-solid fa-house"></i>
          <span>Home</span>
        </Link>

        <Link
          to="/Friend"
          className={`navbar-header-item ${
          path.includes("/Friend") || path.includes("/friend") ? "item-active" : ""
        }`}
        >
          <i className="fa-solid fa-user-plus"></i>
          <span>Friends</span>
        </Link>

        <Link
          to="/Group"
          className={`navbar-header-item ${path.includes("Group") ? "item-active" : ""}`}
        >
          <i className="fa-solid fa-user-group"></i>
          <span>Groups</span>
        </Link>

        <Link
          to="/Service"
          className={`navbar-header-item ${path.includes("/Service") ? "item-active" : ""}`}
        >
          <i className="fa-solid fa-handshake"></i>
          <span>Services</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavbarHeader;
