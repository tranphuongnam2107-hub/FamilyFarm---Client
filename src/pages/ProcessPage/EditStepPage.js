import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import EditProgressStep from "../../components/ProcessStep/EditProcessStep";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const EditStepPage = () => {
  return (
    <div className="EditStepPage">
      <Header/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <EditProgressStep/>

    </div>
  );
};

export default EditStepPage;