import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import EditService from "../../components/Services/EditService";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const EditServicePage = () => {
  return (
    <div>
      <Header/>
      <EditService/>
    </div>
  );
};

export default EditServicePage;