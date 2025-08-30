import React from "react";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import PayFailedComponent from "../../components/PaymentManagement/PaymentFailedNoti";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

export default function PaymentFailedPage() {
 return(
    <div className="PaymentFailedPage">
        <Header />
        <NavbarHeader />
        <PayFailedComponent/>
    </div>
 )
}