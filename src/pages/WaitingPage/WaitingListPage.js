import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import WaitingList from "../../components/OrderWaiting/WaitingList";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

const WaitingListPage = () => {
  return (
    <div className="WaitingListPage">
      <Header/>
      {/* <Link to="/Register">Register</Link> */}

      {/* <main className="homepage-main">
      </main> */}
      <WaitingList/>
    </div>
  );
};

export default WaitingListPage;