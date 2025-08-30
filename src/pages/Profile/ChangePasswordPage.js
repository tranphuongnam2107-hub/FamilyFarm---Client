import ChangePasswordForm from "../../components/Profile/ChangePasswordForm";
import background from "../../assets/images/469337637_593611579790872_3160416761111677688_n.jpg";

const ChangePasswordPage = () => {
    return (
        <div className="w-full min-h-screen flex justify-center pt-20 bg-gray-100"
            style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <ChangePasswordForm />
        </div>
    );
};

export default ChangePasswordPage;