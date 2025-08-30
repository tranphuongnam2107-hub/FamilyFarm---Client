import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import GroupSidebar from "../../components/Group/GroupSidebar";
import PostInGroupRight from "../../components/Group/PostInGroupRight";
import YourgroupRight from "../../components/Group/YourgroupRight";
import CreateGroupForm from "../../components/Group/CreateGroupForm";
import SuggestionGroupRight from "../../components/Group/SuggestionGroupRight";
const PostGroupPage = () => {
  const location = useLocation();

  const [section, setSection] = useState("post-in-group"); // Đặt mặc định ban đầu

  useEffect(() => {
    if (location.state?.section) {
      setSection(location.state.section);
    }
  }, [location.state]);

  const [roleId, setRoleId] = useState(null);

  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="flex">
        <GroupSidebar section={section} setSection={setSection} />
        {section === "all-group-user" && (
          <div className="lg:mt-[120px] mt-[63px] ml-24 md:ml-[360px] pt-10">
            <YourgroupRight section={section} />
          </div>
        )}
        {section === "post-in-group" && <PostInGroupRight />}
        {section === "create-group" && <CreateGroupForm />}
        {section === "group-suggestion-in-group" && (
          <div className="lg:mt-[120px] mt-[63px] ml-24 md:ml-[360px] pt-10">
            <SuggestionGroupRight />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostGroupPage;
