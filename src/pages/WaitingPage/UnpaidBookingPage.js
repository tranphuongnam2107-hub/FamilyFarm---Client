import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import UnpaidList from "../../components/OrderWaiting/UnpaidList";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const UnpaidBookingPage = () => {
  return (
    <div className="UnpaidBookingPage">
      <Header/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <UnpaidList />
    </div>
  );
};

export default UnpaidBookingPage;