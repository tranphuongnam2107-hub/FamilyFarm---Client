import React, { useState } from "react";
import "../MenuProfile/menuProfile.css";
import { Link } from "react-router-dom";

export const MenuProfile = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopupMenuProfile = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="open-popup-btn" onClick={togglePopupMenuProfile}>
        Mở Menu Profile
      </button>

      <div className={`popup-overlay ${isOpen ? "active" : ""}`} id="popup">
        <div className="menu-card">
          <div className="close-btn" onClick={togglePopupMenuProfile}>
            &times;
          </div>

          <div className="menu-grid">
            <Link to="/1" className="menu-item">
              <i className="fas fa-user"></i>Your Profile
            </Link>
            <Link to="/2" className="menu-item">
              <i className="fab fa-amazon-pay"></i>Payment
            </Link>
            <Link to="/1" className="menu-item">
              <i className="fas fa-cog"></i>Setting
            </Link>
            <Link to="/1" className="menu-item">
              <i className="fas fa-plus"></i>Profesional
            </Link>
            <Link to="/1" className="menu-item">
              <i className="fas fa-concierge-bell"></i>Your Service
            </Link>
          </div>

          <button className="logout-btn">
            <i className="fas fa-power-off"></i>Logout
          </button>
        </div>
      </div>
    </div>
  );
};
