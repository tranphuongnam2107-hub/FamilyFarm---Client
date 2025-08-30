import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import ProcessNav from "../../components/ProcessNav/ProcessNav";
import Professional from "../../components/Professional/Professional";

const ProfessionalPage = () => {

    return (
    <div className="text-gray-800 bg-white">
      <Header />
      <div className="pt-16 mx-auto progress-management max-w-7xl">
        <ProcessNav inPage="Overview"/>
        <Professional />
      </div>
    </div>
  );
};

export default ProfessionalPage;