import logo from "../../assets/images/logo_img.png";
import default_avatar from "../../assets/images/default-avatar.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
const SidebarDashboard = () => {
  const [openSections, setOpenSections] = useState({
    censor: true,
    management: true,
    system: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await instance.post("/api/authen/logout");
      sessionStorage.clear();
      localStorage.clear();

      // Force reload toàn bộ app
      window.location.reload();
      navigate("/Login");
    } catch (error) {
      console.error("Logout failed:", error);
      sessionStorage.clear();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="w-[25%] h-screen bg-white shadow-md p-4 px-6 flex flex-col text-left">
      <div>
        <div className="font-bold mb-6 flex items-center gap-4">
          <img src={logo} alt="logo" className="w-[50px]"></img>
          <span className="text-lg text-[#3DB3FB]">Dashboard</span>
        </div>

        <nav className="text-sm">
          <div className="font-semibold flex items-center gap-2 py-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z"
                fill="#3E3F5E"
              />
            </svg>
            <Link to="/Dashboard">
              <span>HOME</span>
            </Link>
          </div>
          <div
            className="font-bold flex items-center gap-2 py-3 pt-5 cursor-pointer"
            onClick={() => toggleSection("censor")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.25 15.5V5H3.25V15.5H0.25ZM5.5 15.5V0.5H8.5V15.5H5.5ZM10.75 15.5V9.5H13.75V15.5H10.75Z"
                fill="#3E3F5E"
              />
            </svg>
            <span>Censor</span>
            <span className="ml-auto">
              <i
                className={`fa-solid ${
                  openSections.censor ? "fa-angle-down" : "fa-angle-right"
                }`}
              ></i>
            </span>
          </div>
          <ul
            className={`ml-6 space-y-3 text-[#3E3F5E]/25 font-semibold cursor-pointer ${
              openSections.censor ? "" : "hidden"
            }`}
          >
            <li>
              <Link to="/ListPostCheckedAI">AI Checker</Link>
            </li>
            <li>
              <Link to="/ListCensor">Account Censor</Link>
            </li>
          </ul>
          <div
            className="font-bold flex items-center gap-2 py-3 pt-5 cursor-pointer"
            onClick={() => toggleSection("management")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.5 12.75V11.5125C9.5 11.4125 9.51875 11.3157 9.55625 11.2222C9.59375 11.1287 9.65 11.0442 9.725 10.9688L13.6437 7.06875C13.7562 6.95625 13.8812 6.875 14.0187 6.825C14.1562 6.775 14.2938 6.75 14.4313 6.75C14.5813 6.75 14.725 6.77825 14.8625 6.83475C15 6.89125 15.125 6.9755 15.2375 7.0875L15.9313 7.78125C16.0313 7.89375 16.1095 8.01875 16.166 8.15625C16.2225 8.29375 16.2505 8.43125 16.25 8.56875C16.2495 8.70625 16.2245 8.847 16.175 8.991C16.1255 9.135 16.0443 9.263 15.9313 9.375L12.0312 13.275C11.9563 13.35 11.872 13.4062 11.7785 13.4437C11.685 13.4812 11.588 13.5 11.4875 13.5H10.25C10.0375 13.5 9.8595 13.4282 9.716 13.2847C9.5725 13.1412 9.5005 12.963 9.5 12.75ZM14.4313 9.3L15.125 8.56875L14.4313 7.875L13.7188 8.5875L14.4313 9.3ZM2 12C1.5875 12 1.2345 11.8533 0.941 11.5597C0.6475 11.2662 0.5005 10.913 0.5 10.5V1.5C0.5 1.0875 0.647 0.7345 0.941 0.441C1.235 0.1475 1.588 0.0005 2 0H5.88125C6.08125 0 6.272 0.0375001 6.4535 0.1125C6.635 0.1875 6.79425 0.29375 6.93125 0.43125L8 1.5H14C14.4125 1.5 14.7657 1.647 15.0597 1.941C15.3538 2.235 15.5005 2.588 15.5 3V4.55625C15.5 4.78125 15.4092 4.9625 15.2277 5.1C15.0462 5.2375 14.837 5.2875 14.6 5.25H14.3937C14.0437 5.25 13.7157 5.3125 13.4097 5.4375C13.1037 5.5625 12.8255 5.75 12.575 6L8.43125 10.1437C8.29375 10.2812 8.1875 10.4408 8.1125 10.6222C8.0375 10.8038 8 10.9942 8 11.1937V11.25C8 11.4625 7.928 11.6407 7.784 11.7847C7.64 11.9287 7.462 12.0005 7.25 12H2Z"
                fill="#3E3F5E"
              />
            </svg>
            <span>Management</span>
            <span className="ml-auto">
              <i
                className={`fa-solid ${
                  openSections.management ? "fa-angle-down" : "fa-angle-right"
                }`}
              ></i>
            </span>
          </div>
          <ul
            className={`ml-6 space-y-3 text-[#3E3F5E]/25 font-semibold cursor-pointer ${
              openSections.management ? "" : "hidden"
            }`}
          >
            <li>
              <Link to="/ListAccount">Account Management</Link>
            </li>
            <li>
              <Link to="/ReportManagement">Report Management</Link>
            </li>
            <li>
              <Link to="/PostManagement">Post Management</Link>
            </li>
            <li>
              <Link to="/PaymentManagement">Payment</Link>
            </li>
          </ul>
          <div
            className="font-bold flex items-center gap-2 py-3 pt-5 cursor-pointer"
            onClick={() => toggleSection("system")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.25 0.5H0.75V12.5H17.25V0.5ZM10.1895 8.375L12.0645 6.5L10.1895 4.625L11.25 3.5645L14.1855 6.5L11.25 9.4355L10.1895 8.375ZM6.75 9.4355L3.8145 6.5L6.75 3.5645L7.8105 4.625L5.9355 6.5L7.8105 8.375L6.75 9.4355ZM15.75 14H2.25V15.5H15.75V14Z"
                fill="#3E3F5E"
              />
            </svg>
            <span>System Management</span>
            <span className="ml-auto">
              <i
                className={`fa-solid ${
                  openSections.system ? "fa-angle-down" : "fa-angle-right"
                }`}
              ></i>
            </span>
          </div>
          <ul
            className={`ml-6 space-y-3 text-[#3E3F5E]/25 font-semibold cursor-pointer ${
              openSections.system ? "" : "hidden"
            }`}
          >
            <li>
              <Link to="/CateService">Category Service</Link>
            </li>
            <li>
              <Link to="/PostCatePage">Category Post</Link>
            </li>
            <li>
              <Link to="/ReactionManagement">Reaction</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="text-left pt-8">
        <div className="mb-2 text-md flex items-center gap-3 cursor-pointer">
          <img
            src={default_avatar}
            alt="default_avatar"
            className="w-12 rounded-full"
          ></img>
          <span className="font-bold">Profile Setting</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-100 text-[#EF3E36] py-4 rounded hover:bg-red-200 text-md w-full"
        >
          <span className="font-semibold">Log out </span>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </div>
  );
};

export default SidebarDashboard;
