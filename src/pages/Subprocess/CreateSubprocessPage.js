import React from 'react'
import { useLocation } from "react-router-dom";
import Header from '../../components/Header/Header'
import CreateSubprocess from '../../components/Subprocess/CreateSubprocess'

const CreateSubprocessPage = () => {
    const location = useLocation();
    const { service, booking } = location.state || {};

    return (
        <div className="CreateSubprocessPage">
            <Header />
            <CreateSubprocess service={service} booking={booking}/>
        </div>
    )
}

export default CreateSubprocessPage