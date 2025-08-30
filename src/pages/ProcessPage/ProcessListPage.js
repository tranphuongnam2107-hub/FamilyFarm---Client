import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ProcessList from "../../components/ProcessList/ProcessList";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const ProcessListPage = () => {
  return (
    <div className="ProgressListPage">
      <Header/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <ProcessList/>

    </div>
  );
};

export default ProcessListPage;