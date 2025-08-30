import React from "react";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import PaySuccessComponent from "../../components/PaymentManagement/PaymentSuccessNoti";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

export default function PaymentSuccessfulPage() {
 return(
    <div className="PaymentSuccessfulPage">
        <Header />
        <NavbarHeader />
        <PaySuccessComponent/>
    </div>
 )
}