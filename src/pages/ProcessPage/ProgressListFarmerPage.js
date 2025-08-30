import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ProcessListOfFarmer from "../../components/ProcessList/ProgressListOfFarmer";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const ProgressListFarmerPage = () => {
  return (
    <div className="ProgressListPageFarmer">
      <Header/>
      <NavbarHeader/>
      <ProcessListOfFarmer/>
    </div>
  );
};

export default ProgressListFarmerPage;