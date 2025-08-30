import React from 'react'
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import FormCreditCard from "../../components/Profile/FormCreditCard"

const CreditCardPage = () => {
    return (
        <div className="CreditCardPage">
            <Header />
            <NavbarHeader />
            <FormCreditCard />
        </div>
    )
}

export default CreditCardPage