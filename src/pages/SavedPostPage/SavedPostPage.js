import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import SavedPostBody from "../../components/SavedPost/SavedPostBody";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const SavedPostPage = () => {
  return (
    <div>
      <Header/>
      <NavbarHeader/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <SavedPostBody/>

    </div>
  );
};

export default SavedPostPage;