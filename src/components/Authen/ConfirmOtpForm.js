import { useEffect, useState, useRef  } from "react";
import logo from "../../assets/images/logo_img.png";
import { useFormValidation } from "../../utils/validate";
import { TextInput } from "./InputField";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const ConfirmOtpForm = () => {
    const location = useLocation();
    const { email, accountId } = location.state || {};
    const navigate = useNavigate();
    const firstCallRef = useRef(false);

    const [secondsLeft, setSecondsLeft] = useState(60);
    const { values, errors, handleChange, handleSubmit, setErrors } = useFormValidation({
        otp: '',
    });

    useEffect(() => {
        console.log("AccID confirm OTP", accountId)
        // if (accountId && email) {
        //     generateAndSendOTP();
        // }
            if (!firstCallRef.current && accountId && email) {
                firstCallRef.current = true;
                generateAndSendOTP();
            }
    }, [accountId, email]);

    const generateAndSendOTP = async () => {
        try {
            const formData = new FormData();
            formData.append("id", accountId);

            await instance.post("/api/authen/generate-OTP", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });


            // Gửi email
            await instance.post("/api/authen/send-email", {
                toEmail: email,
                subject: "Your OTP Code",
            });

            console.log("OTP generated and email sent.");
        } catch (err) {
            console.error("Error generating/sending OTP:", err);
        }
    };

    const handleResendOtp = async () => {
        await generateAndSendOTP();
        toast.success("OTP has been sent to your email.");
        setSecondsLeft(60); // reset countdown
    };


    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setSecondsLeft((prev) => {
    //             if (prev === 0) {
    //                 clearInterval(timer);
    //                 return 0;
    //             }
    //             return prev - 1;
    //         });
    //     }, 1000);
    //     return () => clearInterval(timer);
    // }, []);

    useEffect(() => {
        if (secondsLeft === 0) return;

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev === 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft]); // 👈 phụ thuộc secondsLeft


    // const onSubmit = (values) => {
    //     console.log('OTP Form submitted:', values);
    //     // Xử lý gửi OTP
    // };

    const onSubmit = async (values) => {
        console.log('OTP Form submitted:', values);
        try {

            const res = await instance.get(`/api/account/get-by-email/${email}`);
            console.log("check data", res.data);
            const account = res.data.data;

            if (account) {
                const serverOtp = account.otp;
                const otpTime = account.createOtp;

                console.log("serverOTP: ", serverOtp);
                console.log("otpTime: ", otpTime);

                if (!serverOtp || !otpTime) {
                    setErrors((prev) => ({
                        ...prev,
                        otp: "OTP has not been generated. Please request again.",
                    }));
                    return;
                }

                // Kiểm tra OTP hết hạn (giả sử 2 phút)
                const otpCreatedAt = new Date(otpTime);
                const now = new Date();
                const diffMinutes = (now - otpCreatedAt) / (1000 * 60);

                if (diffMinutes > 1) {
                    setErrors((prev) => ({
                        ...prev,
                        otp: "OTP has expired. Please request a new OTP.",
                    }));
                    return;
                }

                // Kiểm tra OTP nhập đúng không
                if (parseInt(values.otp) !== serverOtp) {
                    setErrors((prev) => ({
                        ...prev,
                        otp: "Invalid OTP. Please try again.",
                    }));
                    return;
                }

                toast.success("OTP verified successfully!");
                navigate('/ResetPassword', { state: { accountId: accountId } });
                // navigate('/ResetPassword');
            } else {
                setErrors((prev) => ({
                    ...prev,
                    otp: "Account not found.",
                }));
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            setErrors((prev) => ({
                ...prev,
                otp: "Failed to verify OTP. Please try again.",
            }));
        }

        // try {
        //     const res = await instance.post("/api/account/verify-OTP", {
        //         accountId: accountId,
        //         otp: parseInt(values.otp),
        //     });

        //     if (res.status === 200 && res.data?.success) {
        //         toast.success("OTP verified successfully!");
        //         // Redirect tới trang Reset Password hoặc Home
        //     } else {
        //         // Nếu verify lỗi, show lỗi dưới input
        //         setErrors((prev) => ({
        //             ...prev,
        //             otp: res.data?.message || "Invalid OTP.",
        //         }));
        //     }
        // } catch (err) {
        //     console.error("Verify OTP failed:", err);

        //     setErrors((prev) => ({
        //         ...prev,
        //         otp: "Failed to verify OTP. Please try again.",
        //     }));
        // }
    };


    return (
        <div className="text-left border-solid border-0 border-t-[5px] border-t-[#3DB3FB] border-b-[5px] border-b-[#2BB673] max-w-4xl w-full px-32 bg-white max-h-min">
            <div className="flex items-center gap-4 py-6">
                <img src={logo} alt="" className="w-[60px]"/>
                <h2 className="text-2xl font-bold">Reset your password</h2>
            </div>
            <p className="font-semibold">Hi,</p>
            <br />
            <p>Please open your email to get the OTP code.</p>
            <form className="py-6" onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                    name="otp"
                    placeholder="Enter your OTP code"
                    value={values.otp}
                    error={errors.otp}
                    onChange={handleChange}
                />
                <div className="flex flex-col items-center pt-5">
                    <p className="py-4">
                        Code expires after:
                        <span className="text-[#EF3E36] font-bold"> {secondsLeft}s</span>
                    </p>
                    <button
                        type="submit"
                        className="text-white text-lg bg-[#3DB3FB] hover:bg-blue-500 font-bold rounded-sm w-48 py-2.5 mt-3"
                    >
                        Confirm OTP
                    </button>
                </div>
            </form>
            <p className="pt-6 pb-10">
                If you have not received the code, please click the following link:{' '}
                <span className="cursor-pointer underline text-[#3DB3FB]" onClick={handleResendOtp}>Resend OTP</span>
            </p>
        </div>
    );
};

export default ConfirmOtpForm;