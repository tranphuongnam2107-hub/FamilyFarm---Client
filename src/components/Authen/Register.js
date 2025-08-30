import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";
import useAddress from "../../hooks/useAddress"; // Import custom hook
import registerPoster from "../../assets/images/register_poster.png";
import logo from "../../assets/images/logo.png";
import user_icon from "../../assets/icons/user_icon.svg";
import user_plus_icon from "../../assets/icons/user_plus_icon.svg";
import mail_icon from "../../assets/icons/mail_icon.svg";
import phone_icon from "../../assets/icons/phone_icon.svg";
import identify_icon from "../../assets/icons/identify_icon.svg";
import address_icon from "../../assets/icons/address_icon.svg";
import password_icon from "../../assets/icons/password_icon.svg";
import back_icon from "../../assets/icons/back_icon.svg";

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    identify: "",
    username: "",
    password: "",
    passwordConfirm: "",
    province: "",
    district: "",
    ward: "", // Maps to Address
    country: "Vietnam",
    birthday: "",
    gender: "",
    certificate: null,
    isExpert: false, // Checkbox for expert registration
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const certificateInputRef = useRef(null); // Ref for certificate file input

  // Use custom hook for address data
  const { provinces, districts, wards } = useAddress(
    formData.province,
    formData.district
  );

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
      ...(name === "province" ? { district: "", ward: "" } : {}), // Reset district and ward if province changes
      ...(name === "district" ? { ward: "" } : {}), // Reset ward if district changes
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Common validation for both Farmer and Expert
    if (!formData.fullName.trim())
      newErrors.fullName = "Full name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.province.trim())
      newErrors.province = "Province/City is required.";
    if (!formData.district.trim()) newErrors.district = "District is required.";
    if (!formData.ward.trim()) newErrors.ward = "Ward (Address) is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";
    if (!formData.identify.trim())
      newErrors.identify = "ID Number is required.";
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (formData.passwordConfirm !== formData.password)
      newErrors.passwordConfirm = "Passwords do not match.";

    // Expert-specific validation
    if (formData.isExpert) {
      if (!formData.certificate)
        newErrors.certificate = "Certificate file is required.";
      if (!formData.birthday.trim())
        newErrors.birthday = "Date of birth is required.";
      if (!formData.gender.trim()) newErrors.gender = "Gender is required.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const selectedDistrict =
      districts.find((d) => d.id === formData.district)?.name_en || "";
    const selectedWard =
      wards.find((w) => w.id === formData.ward)?.name_en || "";

    // Prepare data for submission
    const formDataToSend = new FormData();
    formDataToSend.append("Username", formData.username);
    formDataToSend.append("Password", formData.password);
    formDataToSend.append(
      formData.isExpert ? "Fullname" : "FullName",
      formData.fullName
    );
    formDataToSend.append("Email", formData.email);
    formDataToSend.append("Phone", formData.phone);
    formDataToSend.append(
      formData.isExpert ? "Identifier" : "Identify",
      formData.identify
    );
    formDataToSend.append(
      "City",
      provinces.find((p) => p.id === formData.province)?.name_en || ""
    );
    formDataToSend.append("Country", formData.country);

    formDataToSend.append(
      "Address",
      `${selectedDistrict}, ${selectedWard}`.trim()
    );

    if (formData.isExpert) {
      formDataToSend.append("Certificate", formData.certificate);
      formDataToSend.append("Birthday", formData.birthday);
      formDataToSend.append("Gender", formData.gender);
    } else if (formData.certificate) {
      formDataToSend.append("Certificate", formData.certificate);
    }

    try {
      if (formData.isExpert) {
        const response = await instance.post(
          "/api/authen/register-expert",
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.status === 201 || response.status === 200) {
          toast.info("Please wait for admin moderation your request!");
        }
        // toast.info(
        //   "Expert registration is not yet supported. Please try again later."
        // );
        return;
      } else {
        // if login for farmer
        const response = await instance.post(
          "/api/authen/register-farmer",
          formDataToSend,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.status === 201 || response.status === 200) {
          toast.success("Registration successful!");
          navigate("/Login");
        }
      }
    } catch (error) {
      const backendMessage = error.response?.data?.messageError;
      const backendErrors = error.response?.data?.errors;
      if (backendMessage) {
        toast.error(`Error: ${backendMessage}`);
      } else if (backendErrors) {
        const errorMessages = Object.values(backendErrors).flat().join(", ");
        toast.error(`Error: ${errorMessages}`);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const triggerFileInput = (ref) => {
    ref.current.click();
  };

  return (
    <div className="overflow-x-hidden">
      <div className="flex items-center gap-3 py-6 mx-auto max-w-7xl">
        <Link to="/">
          <img src={logo} alt="logo" className="w-12 h-auto" />
        </Link>
        <h3 className="text-xl font-bold name-page">Family Farm</h3>
      </div>

      <div className="flex flex-col w-full h-full gap-10 mx-auto md:flex-row max-w-7xl">
        <div className="z-10 w-full p-8 text-left bg-white border border-gray-400 border-solid rounded-lg shadow-lg lg:w-2/3">
          <div className="flex items-center mb-6">
            <img src={logo} alt="Logo" className="h-10 mr-2" />
            <h1 className="text-xl font-bold text-red-500">
              Create an Account for Free
            </h1>
          </div>

          <h2 className="mb-4 font-semibold text-left text-green-600">
            1 - Personal Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-left">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.fullName ? "border-red-500" : ""
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={user_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={mail_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={phone_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                ID Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="identify"
                  value={formData.identify}
                  onChange={handleChange}
                  placeholder="Enter your ID number"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.identify ? "border-red-500" : ""
                  }`}
                />
                {errors.identify && (
                  <p className="mt-1 text-xs text-red-500">{errors.identify}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={identify_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                Province/City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.province ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select province/city</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name_en}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-xs text-red-500">{errors.province}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={address_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                District <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.district ? "border-red-500" : ""
                  }`}
                  disabled={!formData.province}
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name_en}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-xs text-red-500">{errors.district}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={address_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                Ward (Address) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.ward ? "border-red-500" : ""
                  }`}
                  disabled={!formData.district}
                >
                  <option value="">Select ward</option>
                  {wards.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name_en}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="mt-1 text-xs text-red-500">{errors.ward}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={address_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.country ? "border-red-500" : ""
                  }`}
                  readOnly
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={address_icon} alt="" />
                </span>
              </div>
            </div>

            {formData.isExpert && (
              <>
                <div>
                  <label className="block text-sm font-medium text-left">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                        errors.birthday ? "border-red-500" : ""
                      }`}
                    />
                    {errors.birthday && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.birthday}
                      </p>
                    )}
                    <span className="absolute left-3 top-2.5 text-blue-400">
                      <img src={user_icon} alt="" />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-left">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                        errors.gender ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.gender}
                      </p>
                    )}
                    <span className="absolute left-3 top-2.5 text-blue-400">
                      <img src={user_icon} alt="" />
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <h2 className="mt-4 mb-4 font-semibold text-left text-green-600">
            2 - Security Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-left">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.username ? "border-red-500" : ""
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
                <span className="absolute left-3 top-2.5 text-blue-400">
                  <img src={user_icon} alt="" />
                </span>
              </div>
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-left">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
                <span className="absolute text-blue-400 left-3 top-2">
                  <img src={password_icon} alt="" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-left">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`w-full border rounded px-4 py-2 pl-10 text-sm ${
                    errors.passwordConfirm ? "border-red-500" : ""
                  }`}
                />
                {errors.passwordConfirm && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.passwordConfirm}
                  </p>
                )}
                <span className="absolute text-blue-400 left-3 top-2">
                  <img src={password_icon} alt="" />
                </span>
              </div>
            </div>
          </div>

          <h2 className="mt-4 mb-4 font-semibold text-left text-green-600">
            3 - Upload Files and Select Role
          </h2>
          <div className="mb-4">
            <label className="flex items-center text-sm font-medium text-left">
              <input
                type="checkbox"
                name="isExpert"
                checked={formData.isExpert}
                onChange={handleChange}
                className="mr-2"
              />
              Register as an Expert
            </label>
          </div>

          {formData.isExpert && (
            <>
              <label className="block text-sm font-medium text-left">
                Certificate <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => triggerFileInput(certificateInputRef)}
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 text-sm"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  name="certificate"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx"
                  ref={certificateInputRef}
                  className="hidden"
                />
                {formData.certificate && (
                  <span className="text-sm text-blue-400">
                    {formData.certificate.name}
                  </span>
                )}
                {errors.certificate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.certificate}
                  </p>
                )}
              </div>
            </>
          )}

          {!formData.isExpert && (
            <>
              <label className="block text-sm font-medium text-left">
                Certificate (Optional for Farmers)
              </label>
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => triggerFileInput(certificateInputRef)}
                  className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 text-sm"
                >
                  Choose File
                </button>
                <input
                  type="file"
                  name="certificate"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx"
                  ref={certificateInputRef}
                  className="hidden"
                />
                {formData.certificate && (
                  <span className="text-sm text-blue-400">
                    {formData.certificate.name}
                  </span>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-10">
            <button className="flex items-center gap-1 text-red-500">
              <img src={back_icon} alt="" />
              <Link to="/Login">Back to Login</Link>
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              <img src={user_plus_icon} alt="" />
              Register
            </button>
          </div>
        </div>
        <div className="relative flex-col hidden w-1/3 pt-8 lg:flex">
          <div className="absolute -right-[850px] -top-[600px] border-t-green-500 border-l-transparent rotate-45 bg-emerald-500 h-[1000px] w-[1000px]"></div>
          <div className="right-0 z-10 flex justify-around w-full mb-4 text-center top-20">
            <p className="text-xl font-semibold text-blue-500">
              Your Expertise
            </p>
            <p className="text-xl font-semibold text-white">Their Growth</p>
          </div>
          <img src={registerPoster} alt="Farm" className="z-10" />
        </div>
      </div>
    </div>
  );
};

export default Register;
