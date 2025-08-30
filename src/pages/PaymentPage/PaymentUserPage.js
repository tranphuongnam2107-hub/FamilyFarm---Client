import React from 'react'
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ListUserPayment from "../../components/PaymentManagement/ListUserPayment"

const PaymentUserPage = () => {
    return (
        <div className="PaymentUserPage">
            <Header />
            <NavbarHeader />
            <ListUserPayment />
        </div>
    )
}

export default PaymentUserPage