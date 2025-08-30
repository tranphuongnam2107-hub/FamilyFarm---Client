import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ReviewServiceFrom from "../../components/ProcessList/ReviewServiceForm";
import { useLocation } from 'react-router-dom';

const ReviewServicePage = () => {
  const location = useLocation();
  const bookingServiceId = location.state?.bookingServiceId;

  return (
    <div className="ProgressListPageFarmer">
      <Header />
      <NavbarHeader />
      <ReviewServiceFrom bookingServiceId={bookingServiceId}/>
    </div>
  );
};

export default ReviewServicePage;