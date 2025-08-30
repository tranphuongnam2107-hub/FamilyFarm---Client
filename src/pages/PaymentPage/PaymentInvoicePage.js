import React from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import PaymentInvoiceCard from "../../components/PaymentManagement/PaymentInvoiceCard";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";

export default function PaymentInvoicePage() {
    const { id } = useParams(); // lấy paymentId
    console.log("Payment view check");
    return (
        <div className="PaymentInvoicePage">
            <PaymentInvoiceCard paymentId={id} />
        </div>
    )
}