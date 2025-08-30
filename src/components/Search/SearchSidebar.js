import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SearchSidebar = ({ setSection }) => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const currentKeyword = state?.keyword || "";
    const location = useLocation();

    const isActive = (section) => state?.section === section;

    const handleSectionChange = (section) => {
        setSection(section);
        // Navigate với keyword hiện tại
        navigate("/Search", { 
            state: { 
                section: section, 
                keyword: currentKeyword, 
                categoryIds: state?.categoryIds || [] 
            } 
        });
    };

    return (
        <div
            className="w-[289px] h-screen bg-[#E5E4E9] font-roboto rounded-r-[10px] hidden md:block
        md:mt-[120px] fixed"
        >
            <div className="ml-8 pt-6 flex items-start">
                <p className="text-lg font-bold">SEARCH PAGE</p>
            </div>

            <div className="mx-8 mt-11 w-[225px] h-auto flex flex-col gap-4">
                <button
                    onClick={() => handleSectionChange("search-post")}
                    className={`flex w-full h-10 rounded-[10px] ${
                        isActive("search-post")
                            ? "bg-[#3DB3FB] text-white"
                            : "hover:bg-[#999999]"
                    }`}
                >
                    <div className="mx-4 flex items-center">
                        <i className="fa-solid fa-file-invoice"></i>
                    </div>
                    <div className="font-bold flex items-center">Post</div>
                </button>

                <button
                    onClick={() => handleSectionChange("search-user")}
                    className={`flex w-full h-10 rounded-[10px] ${
                        isActive("search-user")
                            ? "bg-[#3DB3FB] text-white"
                            : "hover:bg-[#999999]"
                    }`}
                >
                    <div className="mx-4 flex items-center">
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="font-bold flex items-center">User</div>
                </button>

                <button
                    onClick={() => handleSectionChange("search-group")}
                    className={`flex w-full h-10 rounded-[10px] ${
                        isActive("search-group")
                            ? "bg-[#3DB3FB] text-white"
                            : "hover:bg-[#999999]"
                    }`}
                >
                    <div className="mx-4 flex items-center">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <div className="font-bold flex items-center">Group</div>
                </button>
            </div>
        </div>
    );
};

export default SearchSidebar;