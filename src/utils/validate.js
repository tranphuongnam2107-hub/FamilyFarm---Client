import { useState } from 'react';

// Hook tùy chỉnh để xử lý validation và toggle mật khẩu
export const useFormValidation = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({});

    // Hàm validate chung
    const validateField = (name, value) => {
        let error = '';

        // Kiểm tra không bỏ trống
        if (!value.trim()) {
            return 'This field is required';
        }

        // Kiểm tra định dạng email
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
        }

        // Kiểm tra OTP (6 số)
        if (name === 'otp') {
            const otpRegex = /^\d{6}$/;
            if (!otpRegex.test(value)) {
                return 'OTP must be exactly 6 digits';
            }
        }

        // Kiểm tra mật khẩu (ít nhất 8 ký tự)
        if (name.toLowerCase().includes('password')) {
            if (value.length < 8) {
                return 'Password must be at least 8 characters long';
            }
        }

        // Kiểm tra xác nhận mật khẩu
        if (name === 'confirmPassword' && value !== values.newPassword) {
            return 'Passwords do not match';
        }

        return error;
    };

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
        setErrors({ ...errors, [name]: validateField(name, value) });
    };

    // Xử lý submit form
    const handleSubmit = (callback) => (e) => {
        e.preventDefault();
        const newErrors = {};
        let isValid = true;

        Object.keys(values).forEach((key) => {
            const error = validateField(key, values[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        if (isValid) {
            callback(values);
        }
    };

    // Toggle hiển thị/ẩn mật khẩu
    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    // Trả về các giá trị và hàm cần thiết
    return {
        values,
        errors,
        showPassword,
        handleChange,
        handleSubmit,
        togglePasswordVisibility,
        setErrors,
    };
};
