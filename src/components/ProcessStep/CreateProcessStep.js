import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { handleFileSelect } from '../../utils/validateFile';
import MenuProcessStep from "./MenuProcessStep";
import RecommendService from "../Services/RecommendService"
import "./createProcessStepstyle.css";
import ProcessNav from "../ProcessNav/ProcessNav";
import Header from "../Header/Header";
import avaiProcess from "../../assets/images/fluent_person-available-20-filled.png";
import unpaidOrder from "../../assets/images/material-symbols_warning.png";
import waitingOrder from "../../assets/images/medical-icon_waiting-area.png";
import attentionIcon from "../../assets/images/icon-park-solid_attention.png";
import addStepIcon from "../../assets/images/ic_baseline-plus.svg";
import PopularService from "../Services/PopularService";

const CreateProcessStep = () => {
  const navigate = useNavigate();
  const fileInputRefs = useRef({});
  const [accessToken, setAccessToken] = useState("");
  const [searchParams] = useSearchParams();
  const { id: serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);  // State cho hiệu ứng loading

  const [processTitle, setProcessTitle] = useState("");
  const [processDescription, setProcessDescription] = useState("");

  const [preview, setPreview] = useState(null); // Khai báo state preview để hiển thị ảnh preview

  const location = useLocation();
  const passedStatus = location.state?.status; // 0/1 nếu có

  const [errors, setErrors] = useState({
    processTitle: "",
    processDescription: "",
    steps: [] // array of { title: "", description: "" } theo index
  });


  const [steps, setSteps] = useState([
    { title: "", description: "", images: [] } // khởi tạo 1 bước đầu tiên (nếu muốn)
  ]);

  // Sự kiện add step form
  const handleAddStep = () => {
    setSteps([...steps, { title: "", description: "", images: [] }]);

    // ✅ Xóa lỗi toàn cục nếu đang có
    setErrors((prev) => ({
      ...prev,
      global: ""
    }));
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);

    // Reset lỗi nếu có
    setErrors((prev) => {
      const stepErrors = [...(prev.steps || [])];

      // Xóa lỗi cho field cụ thể trong step nếu có
      if (stepErrors[index]?.[field]) {
        stepErrors[index] = { ...stepErrors[index], [field]: "" };
      }

      return {
        ...prev,
        steps: stepErrors,
        global: "" // ✅ Xóa luôn lỗi tổng nếu có
      };
    });
  };

  // const handleImageChange = (index, files) => {
  //   const updatedSteps = [...steps];
  //   const newFiles = Array.from(files);

  //   // Thêm chồng lên ảnh cũ
  //   updatedSteps[index].images = [...updatedSteps[index].images, ...newFiles];
  //   setSteps(updatedSteps);

  //   // Reset input để lần sau chọn lại vẫn trigger
  //   if (fileInputRefs.current[index]) {
  //     fileInputRefs.current[index].value = "";
  //   }
  // };

  const handleImageChange = (index, files) => {
    const updatedSteps = [...steps];
    const newFiles = Array.from(files);

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];

    const validFiles = [];
    const invalidFiles = [];

    newFiles.forEach((file) => {
      if (!allowedImageTypes.includes(file.type)) {
        invalidFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error("Only accept image files in .jpg, .jpeg, .png, or .svg format");
    }

    // Thêm những file hợp lệ vào state
    if (validFiles.length > 0) {
      updatedSteps[index].images = [...updatedSteps[index].images, ...validFiles];
      setSteps(updatedSteps);
    }

    // Reset input để lần sau chọn lại vẫn trigger
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleDeleteImage = (stepIndex, imageIndex) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].images.splice(imageIndex, 1);
    setSteps(updatedSteps);
  };


  const handleDeleteStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  // fetchService
  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        const res = await instance.get(`/api/service/get-by-id/${serviceId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setService(res.data?.data?.[0]?.service || null);
      } catch (err) {
        console.error("Failed to fetch service:", err);
        toast.error("Failed to load service.");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Validate input
  const validate = () => {
    const newErrors = {
      processTitle: "",
      processDescription: "",
      steps: [],
      global: "" // để hiển thị lỗi tổng quát như "Phải có ít nhất 1 step"
    };

    let isValid = true;

    if (!processTitle.trim()) {
      newErrors.processTitle = "Title is required.";
      isValid = false;
    }

    if (!processDescription.trim()) {
      newErrors.processDescription = "Description is required.";
      isValid = false;
    }

    // ✅ Kiểm tra phải có ít nhất 1 bước
    if (steps.length === 0) {
      newErrors.global = "At least one process step is required.";
      isValid = false;
    }

    steps.forEach((step, i) => {
      const stepError = { title: "", description: "" };
      if (!step.title.trim()) {
        stepError.title = "Step title is required.";
        isValid = false;
      }
      if (!step.description.trim()) {
        stepError.description = "Step description is required.";
        isValid = false;
      }
      newErrors.steps[i] = stepError;
    });

    setErrors(newErrors);
    return isValid;
  };

  // Upload tất cả ảnh trước, gom URL theo từng step.
  const uploadImagesAndGetUrls = async () => {
    const imageUrlsByStep = [];
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (!token) {
      toast.error("Missing access token!");
      return [];
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.images && step.images.length > 0) {
        const formData = new FormData();
        step.images.forEach((img) => formData.append("files", img));

        const res = await instance.post("/api/process/upload-images", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });

        console.log("Ảnh trả về từ step", i, res.data);

        // ✅ Sửa đúng tại đây:
        imageUrlsByStep[i] = res.data.map(file => file.urlFile).filter(Boolean);
      } else {
        imageUrlsByStep[i] = [];
      }
    }

    return imageUrlsByStep;
  };

  // Gửi thông tin process + step + url ảnh đến API
  // const handleSave = async () => {
  //   if (!serviceId) {
  //     toast.error("Missing serviceId");
  //     return;
  //   }

  //   if (!validate()) return;

  //   try {
  //     const imageUrlsByStep = await uploadImagesAndGetUrls();

  //     const requestBody = {
  //       serviceId,
  //       processTittle: processTitle,
  //       description: processDescription,
  //       numberOfSteps: steps.length,
  //       processSteps: steps.map((step, i) => ({
  //         stepNumber: i + 1,
  //         stepTitle: step.title,
  //         stepDescription: step.description,
  //         images: imageUrlsByStep[i]
  //       }))
  //     };
  //     const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  //     const res = await instance.post("/api/process/create", requestBody, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });

  //     toast.success("PROCESS CREATED SUCCESSFULLY!");
  //     console.log("✅ Dữ liệu đã gửi thành công:");
  //     console.log(JSON.stringify(requestBody, null, 2));
  //     navigate("/ServiceManagement");
  //     // navigate("/somewhere");
  //   } catch (err) {
  //     // console.error("❌ Failed to create process", err);
  //     // toast.error("Failed to create process");
  //     console.error("❌ Failed to create process:", err);
  //     console.error("➡️ Response from server:", err.response?.data);
  //     toast.error("Failed to create process");
  //   }
  // };

  const handleSave = async () => {
    if (!serviceId) {
      toast.error("Missing serviceId");
      return;
    }

    if (!validate()) return;

    setIsLoading(true); // Bật loading khi bắt đầu xử lý

    try {
      const effectiveStatus = passedStatus ?? service?.status ?? 0;

      const imageUrlsByStep = await uploadImagesAndGetUrls();

      const requestBody = {
        serviceId,
        processTittle: processTitle,
        description: processDescription,
        numberOfSteps: steps.length,
        processSteps: steps.map((step, i) => ({
          stepNumber: i + 1,
          stepTitle: step.title,
          stepDescription: step.description,
          images: imageUrlsByStep[i],
        })),
        status: effectiveStatus, // 👈 thêm vào payload
      };

      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

      const res = await instance.post("/api/process/create", requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("PROCESS CREATED SUCCESSFULLY!");
      console.log("✅ Dữ liệu đã gửi thành công:");
      console.log(JSON.stringify(requestBody, null, 2));
      navigate("/ServiceManagement");
    } catch (err) {
      console.error("❌ Failed to create process:", err);
      console.error("➡️ Response from server:", err.response?.data);
      toast.error("Failed to create process");
    } finally {
      setIsLoading(false); // Tắt loading sau khi xử lý xong
    }
  };

  if (loading) return <p>Loading service info...</p>;
  if (!service) return <p>Service not found.</p>;
  return (
    <div className="pt-16 progress-management">
      <div className="px-2 mx-auto div max-w-7xl">
        <ProcessNav inPage="Service" />

        <div className="flex flex-col w-full gap-6 mt-6 progress-container lg:mt-14 lg:flex-row lg:justify-center">
          <div className="progress-left w-full lg:w-[32%] xl:w-[344px] lg:max-w-[344px]">
            {/* <RecommendService /> */}
            <PopularService/>
          </div>

          <div className="progress-right w-full lg:w-[66.5%] xl:w-[830px] lg:max-w-[830px]">
            <div className="create-progress-container flex-1 p-6">
              <h1 className="mb-4 text-2xl font-bold create-container-title text-start">Create New Process</h1>

              <div className="header-section mb-6">
                <div className="flex flex-col md:flex-row items-center gap-7  mb-2">
                  <div className="second-header flex gap-2">
                    <span className="font-semibold">For service - </span>
                    <span className="ml-auto text-blue-600 cursor-pointer hover:underline">
                      {service.serviceName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="basic-info-section flex flex-col items-start rounded-[10px] gap-6 w-full p-4">
                <div className="basic-title">Basic Information for process</div>
                <div className="title-input w-full">
                  <input className="text-title-basic w-full px-4 py-6 rounded-[10px] border outline-none"
                    type="text"
                    placeholder="Write title for this process"
                    value={processTitle}
                    onChange={(e) => {
                      setProcessTitle(e.target.value);
                      if (errors.processTitle) {
                        setErrors((prev) => ({ ...prev, processTitle: "" }));
                      }
                    }} />
                  {errors.processTitle && <p className="text-start text-red-500 text-sm mt-1">{errors.processTitle}</p>}
                </div>
                <div className="description-input w-full">
                  <textarea
                    className="text-description-basic w-full p-4 rounded-[10px] border outline-none" rows={5}
                    placeholder="Write short description for this process"
                    value={processDescription}
                    onChange={(e) => {
                      setProcessDescription(e.target.value);
                      if (errors.processDescription) {
                        setErrors((prev) => ({ ...prev, processDescription: "" }));
                      }
                    }}
                  ></textarea>
                  {errors.processDescription && <p className="text-start text-red-500 text-sm mt-1">{errors.processDescription}</p>}
                </div>
              </div>
              <div className="progress-list-section space-y-6 mt-7">
                {steps.map((step, index) => (
                  <div key={index} className="progress-step-container flex flex-row gap-[50px]">
                    <div className="step-num-section">
                      <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                        {index + 1}
                      </div>
                    </div>

                    <div className="step-form-section flex flex-col gap-6 p-4 w-full bg-white rounded shadow">
                      <div className="title-step-input">
                        <input
                          className="text-title-basic w-full px-4 py-6 rounded-[10px] border outline-none"
                          type="text"
                          placeholder="Write title for process step"
                          value={step.title}
                          onChange={(e) => handleStepChange(index, "title", e.target.value)}
                        />

                        {errors.steps?.[index]?.title && (
                          <p className="text-start text-red-500 text-sm mt-1">{errors.steps[index].title}</p>
                        )}
                      </div>

                      <div className="description-step-input">
                        <textarea
                          className="text-description-basic w-full p-4 rounded-[10px] border outline-none"
                          rows={5}
                          placeholder="Write description detail for process step"
                          value={step.description}
                          onChange={(e) => handleStepChange(index, "description", e.target.value)}
                        ></textarea>

                        {errors.steps?.[index]?.description && (
                          <p className="text-start text-red-500 text-sm mt-1">{errors.steps[index].description}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          {/* Upload button */}
                          <input
                            id={`file-upload-${index}`}
                            type="file"
                            multiple
                            accept="image/*"
                            ref={(el) => (fileInputRefs.current[index] = el)}
                            onChange={(e) => handleImageChange(index, e.target.files)}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`file-upload-${index}`}
                              className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 w-fit"
                            >
                              Upload Images
                            </label>

                            <span className="text-sm text-gray-600">
                              {step.images.length} files selected
                            </span>
                          </div>

                          {step.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {step.images.map((img, i) => (
                                <div key={i} className="relative w-24 h-24">
                                  <img
                                    src={URL.createObjectURL(img)}
                                    alt={`Step ${index + 1} - Image ${i + 1}`}
                                    className="w-24 h-24 object-cover rounded border"
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                    onClick={() => handleDeleteImage(index, i)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        className="px-4 py-2 mt-4 text-red-700 bg-red-100 rounded hover:bg-red-200 max-w-[108px]"
                        onClick={() => handleDeleteStep(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                <div
                  className="add-new-step flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full mt-5 cursor-pointer"
                  onClick={handleAddStep}
                >
                  +
                </div>
              </div>

              {errors.global && (
                <p className="text-red-500 text-sm mt-2">{errors.global}</p>
              )}

            </div>

            <div className="w-full flex justify-end">
              <button
                className={`w-auto rounded-md px-8 py-3 text-white cursor-pointer mb-4 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={handleSave}
                disabled={isLoading} // Disable nút khi đang loading
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateProcessStep;
