import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ProcessListOfFarmer from "../../components/ProcessList/ProgressListOfFarmer";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";
import ListRequestBookingFarmer from "../../components/ProcessList/ListRequestBookingFarmer";

const HomeProcessFarmer = () => {
  return (
    <div className="ProgressListPageFarmer">
      <Header/>
      <NavbarHeader/>
      <ListRequestBookingFarmer/>
    </div>
  );
};

export default HomeProcessFarmer;