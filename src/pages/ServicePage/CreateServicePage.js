import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import CreateService from "../../components/Services/CreateService";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const CreateServicePage = () => {
  return (
    <div>
      <Header/>
      <CreateService/>
    </div>
  );
};

export default CreateServicePage;