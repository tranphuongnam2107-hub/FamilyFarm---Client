import logo from "../../assets/images/logo_img.png";
import { useFormValidation } from "../../utils/validate";
import { PasswordInput } from "../Authen/InputField";
import instance from "../../Axios/axiosConfig";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ChangePasswordForm = () => {
    const { values, errors, showPassword, handleChange, handleSubmit, togglePasswordVisibility } = useFormValidation({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

        const navigate = useNavigate();


    // Xử lý đổi mật khẩu
    const onSubmit = async (values) => {
        try {
            // Gọi API đổi mật khẩu
            const response = await instance.put('/api/authen/change-password', {
                oldPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
            });
            toast.success(response.data || 'Password changed successfully! Please log in again.');

            // Gọi API logout
            try {
                await instance.post('/api/authen/logout');
            } catch (logoutErr) {
                console.error('Logout failed:', logoutErr);
            }

            // Xóa dữ liệu lưu trữ
            sessionStorage.clear();
            localStorage.clear();
            // Chuyển hướng đến trang Login
            navigate('/Login');
        } catch (err) {
            toast.error(err.response?.data || 'Current password is wrong. Please try again.');
            console.error('Change password error:', err);
        }
    };

    return (
        <div className="text-left border-solid border-0 border-t-[5px] border-t-[#3DB3FB] border-b-[5px] border-b-[#2BB673] max-w-4xl w-full px-32 bg-white max-h-min">
            <div className="flex items-center gap-4 py-6">
                <img src={logo} alt="" className="w-[60px]"/>
                <h2 className="text-2xl font-bold">Change your password</h2>
            </div>
            <p className="font-semibold">Hi,</p>
            <br />
            <p>Please enter current password, new password, and confirm to change password.</p>
            <form className="py-6" onSubmit={handleSubmit(onSubmit)}>
                <PasswordInput
                    name="currentPassword"
                    placeholder="Enter your current password"
                    value={values.currentPassword}
                    error={errors.currentPassword}
                    onChange={handleChange}
                    showPassword={showPassword}
                    togglePasswordVisibility={togglePasswordVisibility}
                />
                <PasswordInput
                    className="mt-5"
                    name="newPassword"
                    placeholder="Enter your new password"
                    value={values.newPassword}
                    error={errors.newPassword}
                    onChange={handleChange}
                    showPassword={showPassword}
                    togglePasswordVisibility={togglePasswordVisibility}
                />
                <PasswordInput
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    onChange={handleChange}
                    showPassword={showPassword}
                    togglePasswordVisibility={togglePasswordVisibility}
                    className="mt-5"
                />
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="text-white text-lg bg-[#3DB3FB] hover:bg-blue-500 font-bold rounded-sm w-48 py-2.5"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;