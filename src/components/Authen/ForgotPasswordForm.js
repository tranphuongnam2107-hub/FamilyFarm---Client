import logo from "../../assets/images/logo_img.png";
import { useFormValidation } from "../../utils/validate";
import { TextInput } from "./InputField";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
    const { values, errors, handleChange, handleSubmit , setErrors } = useFormValidation({
        email: '',
    });

    const navigate = useNavigate();

    // Hàm xử lý submit
    const handleSendOTP = async (values) => {
        console.log('Forgot Password Form submitted:', values);

        try {
            const res = await instance.get(`/api/account/get-by-email/${encodeURIComponent(values.email)}`);

            if (res.status === 200 && res.data?.success) {
                toast.success("OTP has been sent to your email.");
                console.log("Account found:", res.data);
                // navigate("/ConfirmOtp");
                // Nếu muốn, có thể chuyển trang nhập OTP ở đây
                navigate("/ConfirmOtp", { state: { email: values.email, accountId: res.data?.data?.accId } });
            } else {
                // 👉 Set lỗi cho field email
                setErrors((prev) => ({
                    ...prev,
                    email: res.data?.message || "Email not found.",
                }));
            }
        } catch (err) {
            console.error("Error finding account:", err);

            // 👉 Nếu lỗi từ server hoặc mạng
            setErrors((prev) => ({
                ...prev,
                email: "Failed to verify email. Please try again.",
            }));
        }
    };


    return (
        <div className="text-left border-solid border-0 border-t-[5px] border-t-[#3DB3FB] border-b-[5px] border-b-[#2BB673] max-w-4xl w-full px-32 bg-white max-h-min">
            <div className="flex items-center gap-4 py-6">
                <img src={logo} alt="" className="w-[60px]"/>
                <h2 className="text-2xl font-bold">Reset your password</h2>
            </div>
            <p className="font-semibold">Hi,</p>
            <br />
            <p>Please enter your registered email in the box below to retrieve your password.</p>
            <form className="py-6" onSubmit={handleSubmit(handleSendOTP)}>
                <TextInput
                    name="email"
                    placeholder="Enter your email"
                    value={values.email}
                    error={errors.email}
                    onChange={handleChange}
                />
                <div className="flex justify-center pt-5">
                    <button
                        type="submit"
                        className="text-white text-lg bg-[#3DB3FB] hover:bg-blue-500 font-bold rounded-sm w-48 py-2.5"
                    >
                        Send OTP
                    </button>
                </div>
            </form>
            <p className="pt-6 pb-10">Please check your email and get OTP.</p>
        </div>
    );
};

export default ForgotPasswordForm;