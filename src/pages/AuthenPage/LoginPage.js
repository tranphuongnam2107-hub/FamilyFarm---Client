import React from "react";
import LoginForm from "../../components/Authen/LoginForm";
import "../../styles/globals.css";
import "../../styles/styleguilde.css";
import "./loginstyle.css";
import backgroundImg from '../../assets/images/469337637_593611579790872_3160416761111677688_n.jpg';
import { Link } from "react-router-dom";

const LoginPage = () => {
 
  return (
    <div className="login-page">
      <div className="img-background">
        <img
          src={backgroundImg}
          alt="Background"
        />
      </div>
      <div className="flex flex-col items-center gap-4 px-4 mx-auto div sm:px-6 lg:px-8 md:flex-row">
        {/* Gọi component form */}
        <LoginForm />
        <div className="w-full mt-20 mb-10 frame md:w-1/2 md:mb-0 md:mt-0 sm:hidden">
          <p className="we-always-welcome">
            We Always Welcome Experienced People To Work With Farmers.
          </p>
          <Link to="/Register" className="text-wrapper">
            Join as an Expert!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
