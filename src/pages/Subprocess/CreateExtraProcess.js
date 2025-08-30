import React from 'react'
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import FormRequestExtraProcess from "../../components/Subprocess/FormRequestExtraProcess";

const CreateExtraProcess = () => {
  const location = useLocation();
  const { bookingData, serviceData } = location.state || {};

  return (
    <div className="CreateExtraProcess">
      <Header />
      <NavbarHeader />
      <FormRequestExtraProcess bookingData={bookingData} serviceData={serviceData}/>
    </div>
  )
}

export default CreateExtraProcess