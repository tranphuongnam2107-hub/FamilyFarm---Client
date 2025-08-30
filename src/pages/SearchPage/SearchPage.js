import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import PostInGroupRight from "../../components/Group/PostInGroupRight";
import SearchSidebar from "../../components/Search/SearchSidebar";
import SearchPost from "../../components/Search/SearchPost";
import SearchUser from "../../components/Search/SearchUer";
import SearchGroup from "../../components/Search/SearchGroup";

const SearchPage = () => {
  const location = useLocation();
  const [section, setSection] = useState("search-post");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    console.log("Location state:", location.state);
    if (location.state?.section) {
      setSection(location.state.section);
    }
    if (location.state?.keyword) {
      setKeyword(location.state.keyword);
    } else {
      setKeyword("");
    }
  }, [location]);

  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="flex h-screen">
        <SearchSidebar setSection={setSection} />
        {section === "search-post" && <SearchPost keyword={keyword} />}
        {section === "search-user" && <SearchUser />}
        {section === "search-group" && <SearchGroup />}
      </div>
    </div>
  );
};

export default SearchPage;