import React from "react";
import Header from "../../components/Header/Header";
import "../../styles/globals.css";
import "./servicestyle.css";
import { Link } from "react-router-dom";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ServicesList from "../../components/Services/ServicesList";

const ServicePage = () => {
  return (
    <div className="ServicePage">
      <Header/>
      <NavbarHeader/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <ServicesList/>

    </div>
  );
};

export default ServicePage;