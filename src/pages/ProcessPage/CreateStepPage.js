import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import CreateProgressStep from "../../components/ProcessStep/CreateProcessStep";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const CreateStepPage = () => {
  return (
    <div className="CreateStepPage">
      <Header/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <CreateProgressStep/>

    </div>
  );
};

export default CreateStepPage;