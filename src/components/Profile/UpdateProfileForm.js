import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAddress from '../../hooks/useAddress';
import instance from "../../Axios/axiosConfig";
import { useNavigate } from "react-router-dom";
import { handleFileSelect } from '../../utils/validateFile';

const UpdateProfileForm = ({ profileData }) => {
  // 👇 Khi profileData thay đổi → map vào formData
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null); // để hiện ảnh
  const [userRole, setUserRole] = useState("");
  const [isCertificateRemoved, setIsCertificateRemoved] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    gender: '',
    email: '',
    phone: '',
    province: '', // Thay cho city
    district: '', // Thêm trường district
    ward: '', // Thay cho address
    country: 'Vietnam', // Cố định
    school: '',
    workplace: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    province: '', // Thay cho city
    district: '',
    ward: '', // Thay cho address
    country: '',
    certificate: '',
  });

  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // Sử dụng useAddress hook
  const { provinces, districts, wards } = useAddress(formData.province, formData.district);

  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    if (!profileData?.accId) return;

    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

      const res = await instance.get(`/api/account/profile-another/${profileData.accId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success && res.data.data) {
        // console.log("Profile another:", res.data.data);
        setUserRole(res.data.data.roleId); // 👉 set vào state
        // console.log("check role id", userRole);
      } else {
        console.error("Failed to load profile another!");
      }
    } catch (err) {
      console.error("Error fetching profile another:", err);
    }
  };

  // Chao nha

  useEffect(() => {
    if (profileData) {
      fetchUserProfile();

      setFormData(prev => ({
        ...prev,
        name: profileData.fullName || '',
        birthday: profileData.birthday ? profileData.birthday.substring(0, 10) : '',
        gender: profileData.gender ? profileData.gender.toLowerCase() : '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        country: profileData.country || 'Vietnam',
        school: profileData.studyAt || '',
        workplace: profileData.workAt || '',
        certificate: profileData.certificate || '',
      }));
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData && provinces.length > 0 && !isInitialLoad) {
      const selectedProvince = provinces.find(
        p => p.name_en.trim().toLowerCase() === profileData.city.trim().toLowerCase()
      );

      setFormData(prev => ({
        ...prev,
        province: selectedProvince?.id || '',
      }));

      setIsInitialLoad(true);
    }
  }, [profileData, provinces, isInitialLoad]);

  useEffect(() => {
    if (districts.length > 0) {
      let district = "";
      let ward = "";

      if (profileData?.address) {
        const parts = profileData.address.split(",").map(part => part.trim());
        if (parts.length === 2) {
          district = parts[0];
          ward = parts[1];
        } else if (parts.length === 1) {
          district = parts[0];
        }
      }

      const selectedDistrict = districts.find(
        d => d.name_en.trim().toLowerCase() === district.trim().toLowerCase()
      );

      setFormData(prev => ({
        ...prev,
        district: selectedDistrict?.id || '',
      }));
    }
  }, [districts, profileData?.address]);

  // Tách useEffect cho ward:
  useEffect(() => {
    if (formData.district && wards.length > 0) {
      let district = "";
      let ward = "";

      if (profileData?.address) {
        const parts = profileData.address.split(",").map(part => part.trim());
        if (parts.length === 2) {
          district = parts[0];
          ward = parts[1];
        } else if (parts.length === 1) {
          district = parts[0];
        }
      }

      // console.log("Ward from address:", ward);
      // console.log("Wards list:", wards.map(w => w.name_en));

      const selectedWard = wards.find(
        w => w.name_en.trim().toLowerCase() === ward.trim().toLowerCase()
      );

      setFormData(prev => ({
        ...prev,
        ward: selectedWard?.id || '',
      }));

    }
  }, [formData.district, wards, profileData?.address]);

  // 👉 Handle change 
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevData => {
      let updatedData = { ...prevData, [name]: value };

      // Nếu chọn province mới → reset district và ward
      if (name === 'province') {
        updatedData = { ...updatedData, district: '', ward: '' };
      }

      // Nếu chọn district mới → reset ward
      if (name === 'district') {
        updatedData = { ...updatedData, ward: '' };
      }

      return updatedData;
    });

    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  // Handler khi chọn ảnh:
  // const handleCertificateChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setCertificateFile(file);
  //     setCertificatePreview(URL.createObjectURL(file));
  //     setIsCertificateRemoved(false); // 👉 Reset lại nếu chọn ảnh mới
  //     setErrors(prev => ({ ...prev, certificate: '' })); // clear lỗi khi chọn file
  //   }
  // };

  const handleCertificateChange = (e) => {
    handleFileSelect({
      event: e,
      setSelectedFile: (fileData) => {
        setCertificateFile(fileData.file); // Lưu lại file đã chọn
        setCertificatePreview(fileData.url); // Hiển thị preview của file (nếu có)
        setIsCertificateRemoved(false); // Đặt lại trạng thái đã xóa nếu có file mới
        setErrors((prev) => ({ ...prev, certificate: '' })); // Clear lỗi nếu file hợp lệ
      },
    });
  };

  // Handler xóa ảnh:
  const handleRemoveCertificate = (e) => {
    e.stopPropagation(); // 👉 Chặn sự kiện lan lên label
    e.preventDefault();  // 👉 Phòng khi button là submit
    setCertificateFile(null);
    setCertificatePreview(null);
    setIsCertificateRemoved(true); // Đánh dấu đã xoá ảnh
    
    // Cập nhật profileData nếu cần
    if (profileData && profileData.certificate) {
      profileData.certificate = null; // Hoặc nếu không cần cập nhật vào profileData thì không cần dòng này
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      country: '',
      certificate: '',
    };
    let isValid = true;

    // Check for empty required fields
    const requiredFields = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      province: formData.province.trim(),
      district: formData.district.trim(),
      ward: formData.ward.trim(),
      country: formData.country.trim(),
    };

    for (let field in requiredFields) {
      if (!requiredFields[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (requiredFields.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (requiredFields.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      isValid = false;
    }

    // Nếu là expert thì phải có file
    if (
      userRole === '68007b2a87b41211f0af1d57' &&
      !certificateFile && // chưa chọn mới
      (!profileData?.certificate || profileData.certificate.trim() === "")
    ) {
      newErrors.certificate = 'Certificate is required for expert!';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    const selectedDistrict = districts.find((d) => d.id === formData.district)?.name_en || "";
    const selectedWard = wards.find((w) => w.id === formData.ward)?.name_en || "";

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("FullName", formData.name);
      formDataToSend.append("Birthday", formData.birthday);
      formDataToSend.append("Gender", formData.gender);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("PhoneNumber", formData.phone);
      formDataToSend.append(
        "City",
        provinces.find(p => p.id === formData.province)?.name_en || ''
      );
      formDataToSend.append(
        "Address",
        `${selectedDistrict}, ${selectedWard}`.trim()
      );
      formDataToSend.append("Country", formData.country);
      formDataToSend.append("StudyAt", formData.school);
      formDataToSend.append("WorkAt", formData.workplace);
      if (userRole === '68007b2a87b41211f0af1d57' && certificateFile) {
        formDataToSend.append('Certificate', certificateFile);
      }

      console.log("FormData to send:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Nếu có thêm Certificate (cho expert), bạn có thể append thêm
      const res = await instance.put("/api/account/update-profile", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 && res.data?.isSuccess) {
        const rememberMe = true; // Tùy bạn có lưu nhớ không
        const storage = rememberMe ? localStorage : sessionStorage;

        const profileResponse = await instance.get(
          "https://localhost:7280/api/account/own-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // const profileResponse = await getOwnProfile();

        const profileData = profileResponse.data;

        storage.setItem("profileData", JSON.stringify(profileData.data || {}));

        toast.success("PROFILE UPDATED SUCCESSFULLY!");
        storage.setItem("fullName", formData.name);
        console.log("Updated profile:", res.data);
        navigate("/PersonalPage");
      } else {
        const message = res.data?.messageError || "Failed to update profile.";

        // 👇 Nếu trùng email hoặc phone
        if (message.includes("Email")) {
          setErrors(prev => ({ ...prev, email: message }));
        }
        if (message.includes("Phone")) {
          setErrors(prev => ({ ...prev, phone: message }));
        }
      }
    } catch (err) {
      console.error("Update profile failed:", err);
      toast.error("Error updating profile.");
    }
  };

  return (
    <div className="w-full p-8 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Update Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={`mt-1 p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="birthday">
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <div className="flex mt-1 space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Male
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Female
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Other
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              className={`mt-1 p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="phone">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone"
              className={`mt-1 p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="country">
              Country *
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              readOnly
              className={`mt-1 p-2 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md bg-gray-100 cursor-not-allowed`}
            />
            {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="province">
              Province/City *
            </label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className={`mt-1 p-2 border ${errors.province ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select province/city</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name_en}
                </option>
              ))}
            </select>
            {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province}</p>}
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="district">
              District *
            </label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={`mt-1 p-2 border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={!formData.province}
            >
              <option value="">Select district</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name_en}
                </option>
              ))}
            </select>
            {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district}</p>}
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="ward">
              Ward (Address) *
            </label>
            <select
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className={`mt-1 p-2 border ${errors.ward ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={!formData.district}
            >
              <option value="">Select ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name_en}
                </option>
              ))}
            </select>
            {errors.ward && <p className="mt-1 text-sm text-red-500">{errors.ward}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="school">
              School
            </label>
            <input
              type="text"
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Your school"
              className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col p-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="workplace">
              Workplace
            </label>
            <input
              type="text"
              id="workplace"
              name="workplace"
              value={formData.workplace}
              onChange={handleChange}
              placeholder="Your workplace"
              className="p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {userRole === '68007b2a87b41211f0af1d57' && (
            <div className="flex flex-col p-2 w-full">
              <label className="text-sm font-medium text-gray-700" htmlFor="certificate">
                Certificate <span className="text-red-500">*</span>
              </label>

              <input
                id="certificate-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCertificateChange}
              />

              <label htmlFor="certificate-upload" className="block cursor-pointer mt-2 w-full relative group">
                <img
                  className="relative px-3 object-cover rounded-[12px] w-full min-h-[200px] h-auto border z-10"
                  src={
                    certificatePreview
                      ? certificatePreview
                      : !isCertificateRemoved && profileData.certificate
                      ? profileData.certificate
                      : ""
                  }
                  alt="Certificate preview"
                />

                {(certificatePreview || (!isCertificateRemoved && profileData.certificate)) && (
                  <button
                    type="button"
                    onClick={handleRemoveCertificate}
                    className="absolute top-2 right-4 z-10 w-[30px] h-[30px] bg-white text-red-600 rounded-full pl-[1px] shadow hover:bg-red-100 transition"
                    title="Remove certificate"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}

                {!certificatePreview && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl z-0">
                    <i className="fa-solid fa-cloud-arrow-up mr-2"></i> Upload certificate here
                  </div>
                )}
              </label>

              {errors.certificate && (
                <p className="mt-1 text-sm text-red-500">{errors.certificate}</p>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="flex flex-col p-2">
            <button
              type="button"
              className="w-full px-4 py-2 text-black bg-white rounded-lg hover:bg-green-600 border border-solid "
              onClick={() => navigate('/PersonalPage')}
            >
              Back
            </button>
          </div>

          <div className="flex flex-col p-2">
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-[#26ACE2] rounded-lg hover:bg-[#5688f3]"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfileForm;