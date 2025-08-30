import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import MenuProcessStep from "./MenuProcessStep";
import RecommendService from "../Services/RecommendService";
import "./createProcessStepstyle.css";
import ProcessNav from "../ProcessNav/ProcessNav";
import Header from "../Header/Header";
import avaiProcess from "../../assets/images/fluent_person-available-20-filled.png";
import unpaidOrder from "../../assets/images/material-symbols_warning.png";
import waitingOrder from "../../assets/images/medical-icon_waiting-area.png";
import attentionIcon from "../../assets/images/icon-park-solid_attention.png";
import addStepIcon from "../../assets/images/ic_baseline-plus.svg";
import PopularService from "../Services/PopularService";

const EditProcessStep = () => {
  const navigate = useNavigate();
  const fileInputRefs = useRef({});
  const [accessToken, setAccessToken] = useState("");
  const [searchParams] = useSearchParams();
  const { id: serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processId, setProcessId] = useState("");

  const [processTitle, setProcessTitle] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [deletedStepIds, setDeletedStepIds] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // Thêm state để theo dõi trạng thái loading

  const [errors, setErrors] = useState({
    processTitle: "",
    processDescription: "",
    steps: [], // array of { title: "", description: "" } theo index
  });

  const [steps, setSteps] = useState([
    { title: "", description: "", images: [] }, // khởi tạo 1 bước đầu tiên (nếu muốn)
  ]);

  // fetch dữ liệu service, process và process step
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        // 1. Fetch service
        const serviceRes = await instance.get(
          `/api/service/get-by-id/${serviceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setService(serviceRes.data?.data?.[0]?.service || null);

        // 2. Fetch process
        const processRes = await instance.get(
          `/api/process/get-by-id/${serviceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = processRes.data?.data?.[0];

        setProcessId(data.process.processId);
        setProcessTitle(data.process.processTittle);
        setProcessDescription(data.process.description);

        const mappedSteps = data.steps.map((s) => ({
          stepId: s.step.stepId,
          title: s.step.stepTitle,
          description: s.step.stepDesciption,
          images: s.images.map((img) => ({
            url: img.imageUrl,
            id: img.processStepImageId,
          })),
        }));

        setSteps(mappedSteps);
      } catch (err) {
        console.error("Failed to load process or service:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  // Validate input
  const validate = () => {
    const newErrors = {
      processTitle: "",
      processDescription: "",
      steps: [],
      global: "", // để hiển thị lỗi tổng quát như "Phải có ít nhất 1 step"
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

  // Sự kiện add step form
  const handleAddStep = () => {
    setSteps([...steps, { title: "", description: "", images: [] }]);

    // ✅ Xóa lỗi toàn cục nếu đang có
    setErrors((prev) => ({
      ...prev,
      global: "",
    }));
  };

  // Sự kiện delete step
  const handleDeleteStep = (index) => {
    const stepToDelete = steps[index];

    if (stepToDelete?.stepId) {
      setDeletedStepIds((prev) => [...prev, stepToDelete.stepId]);
    }

    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  // Xử lý sự kiện change ở step
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
        global: "", // ✅ Xóa luôn lỗi tổng nếu có
      };
    });
  };

  // Xử lý sự change của image
  // const handleImageChange = (index, files) => {
  //     const updatedSteps = [...steps];
  //     const newFiles = Array.from(files).map(file => ({ file, isNew: true }));
  //     updatedSteps[index].images = [...updatedSteps[index].images, ...newFiles];
  //     setSteps(updatedSteps);
  // };

  const handleImageChange = (index, files) => {
    const updatedSteps = [...steps];
    const newFiles = Array.from(files);

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/svg+xml",
    ];
    const validFiles = [];
    const invalidFiles = [];

    // Kiểm tra loại file hình ảnh
    newFiles.forEach((file) => {
      if (!allowedImageTypes.includes(file.type)) {
        invalidFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    // Hiển thị thông báo lỗi nếu có file không hợp lệ
    if (invalidFiles.length > 0) {
      toast.error(
        "Only accept image files in .jpg, .jpeg, .png, or .svg format"
      );
    }

    // Thêm những file hợp lệ vào state
    if (validFiles.length > 0) {
      const newFileObjects = validFiles.map((file) => ({ file, isNew: true }));
      updatedSteps[index].images = [
        ...updatedSteps[index].images,
        ...newFileObjects,
      ];
      setSteps(updatedSteps);
    }

    // Reset input để lần sau chọn lại vẫn trigger
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  // Xóa ảnh mỗi step
  // const handleDeleteImage = (stepIndex, imageIndex) => {
  //     const updatedSteps = [...steps];
  //     const imageToDelete = updatedSteps[stepIndex].images[imageIndex];

  //     // Nếu ảnh cũ (không phải ảnh mới), lưu id để gửi xóa backend
  //     if (!imageToDelete.isNew && imageToDelete.id) {
  //         setDeletedImageIds(prev => [...prev, imageToDelete.id]);
  //     }

  //     // Xóa khỏi giao diện
  //     updatedSteps[stepIndex].images.splice(imageIndex, 1);
  //     setSteps(updatedSteps);
  // };
  const handleDeleteImage = (stepIndex, imageIndex) => {
    const updatedSteps = [...steps];
    const imageToDelete = updatedSteps[stepIndex].images[imageIndex];

    // Nếu ảnh cũ (không phải ảnh mới), lưu id để gửi xóa backend
    if (!imageToDelete.isNew && imageToDelete.id) {
      setDeletedImageIds((prev) => [...prev, imageToDelete.id]);
    }

    // Xóa khỏi giao diện
    updatedSteps[stepIndex].images.splice(imageIndex, 1);
    setSteps(updatedSteps);
  };

  // Lấy URL khi up từ file
  const uploadImagesAndGetUrls = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    const result = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepImages = [];

      const newImages = step.images.filter((img) => img.isNew);
      const existingImages = step.images.filter((img) => !img.isNew);

      // Upload ảnh mới
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => formData.append("files", img.file));

        const res = await instance.post(
          "/api/process/upload-images",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const uploaded = res.data.map((f) => ({ imageUrl: f.urlFile }));
        stepImages.push(...uploaded);
      }

      // Giữ ảnh cũ (đã có id)
      existingImages.forEach((img) => {
        stepImages.push({
          imageUrl: img.url,
          processStepImageId: img.id,
        });
      });

      result[i] = stepImages;
    }

    return result;
  };

  // Sự kiện 'Save'
  // const handleSave = async () => {
  //     if (!serviceId) {
  //         toast.error("Missing serviceId");
  //         return;
  //     }

  //     if (!validate()) return;

  //     try {
  //         const imageUrlsByStep = await uploadImagesAndGetUrls();
  //         const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  //         const payload = {
  //             serviceId: serviceId,
  //             processTittle: processTitle,
  //             description: processDescription,
  //             numberOfSteps: steps.length,
  //             processSteps: steps.map((step, i) => ({
  //                 stepId: step.stepId, // null nếu là bước mới
  //                 stepNumber: i + 1,
  //                 stepTitle: step.title,
  //                 stepDescription: step.description,
  //                 imagesWithId: imageUrlsByStep[i] // đã phân biệt ảnh cũ/mới
  //             })),
  //             deletedStepIds: deletedStepIds, // ✅ gửi lên backend
  //             deletedImageIds: deletedImageIds // ✅ thêm vào đây
  //         };

  //         console.log("📦 Payload gửi lên:", payload);

  //         await instance.put(`/api/process/update/${processId}`, payload, {
  //             headers: { Authorization: `Bearer ${token}` }
  //         });

  //         toast.success("PROCESS UPDATED SUCCESSFULLY!");
  //         navigate("/ServiceManagement");
  //     } catch (err) {
  //         console.error("Update failed:", err);
  //         console.error("❗ Response from server:", err.response?.data);
  //         toast.error("Failed to update process");
  //     }
  // };

  const handleSave = async () => {
    if (!serviceId) {
      toast.error("Missing serviceId");
      return;
    }

    if (!validate()) return;

    setIsLoading(true); // Bật loading khi bắt đầu xử lý

    try {
      const imageUrlsByStep = await uploadImagesAndGetUrls();
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const payload = {
        serviceId: serviceId,
        processTittle: processTitle,
        description: processDescription,
        numberOfSteps: steps.length,
        processSteps: steps.map((step, i) => ({
          stepId: step.stepId, // null nếu là bước mới
          stepNumber: i + 1,
          stepTitle: step.title,
          stepDescription: step.description,
          imagesWithId: imageUrlsByStep[i], // đã phân biệt ảnh cũ/mới
        })),
        deletedStepIds: deletedStepIds, // ✅ gửi lên backend
        deletedImageIds: deletedImageIds, // ✅ thêm vào đây
      };

      console.log("📦 Payload gửi lên:", payload);

      await instance.put(`/api/process/update/${processId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("PROCESS UPDATED SUCCESSFULLY!");
      navigate("/ServiceManagement");
    } catch (err) {
      console.error("Update failed:", err);
      console.error("❗ Response from server:", err.response?.data);
      toast.error("Failed to update process");
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
            <PopularService />
          </div>
          <div className="progress-right w-full lg:w-[66.5%] xl:w-[830px] lg:max-w-[830px]">
            <div className="create-progress-container flex-1 p-6">
              <h1 className="mb-4 text-2xl font-bold create-container-title text-start">
                Edit Process
              </h1>

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
                  <input
                    className="text-title-basic w-full px-4 py-6 rounded-[10px] border outline-none"
                    type="text"
                    placeholder="Write title for this process"
                    value={processTitle}
                    onChange={(e) => {
                      setProcessTitle(e.target.value);
                      if (errors.processTitle) {
                        setErrors((prev) => ({ ...prev, processTitle: "" }));
                      }
                    }}
                  />
                  {errors.processTitle && (
                    <p className="text-start text-red-500 text-sm mt-1">
                      {errors.processTitle}
                    </p>
                  )}
                </div>
                <div className="description-input w-full">
                  <textarea
                    className="text-description-basic w-full p-4 rounded-[10px] border outline-none"
                    rows={5}
                    placeholder="Write short description for this process"
                    value={processDescription}
                    onChange={(e) => {
                      setProcessDescription(e.target.value);
                      if (errors.processDescription) {
                        setErrors((prev) => ({
                          ...prev,
                          processDescription: "",
                        }));
                      }
                    }}
                  ></textarea>
                  {errors.processDescription && (
                    <p className="text-start text-red-500 text-sm mt-1">
                      {errors.processDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="progress-list-section space-y-6 mt-7">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="progress-step-container flex flex-row gap-[50px]"
                  >
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
                          onChange={(e) =>
                            handleStepChange(index, "title", e.target.value)
                          }
                        />

                        {errors.steps?.[index]?.title && (
                          <p className="text-start text-red-500 text-sm mt-1">
                            {errors.steps[index].title}
                          </p>
                        )}
                      </div>

                      <div className="description-step-input">
                        <textarea
                          className="text-description-basic w-full p-4 rounded-[10px] border outline-none"
                          rows={5}
                          placeholder="Write description detail for process step"
                          value={step.description}
                          onChange={(e) =>
                            handleStepChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        ></textarea>

                        {errors.steps?.[index]?.description && (
                          <p className="text-start text-red-500 text-sm mt-1">
                            {errors.steps[index].description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <input
                            id={`file-upload-${index}`}
                            type="file"
                            multiple
                            accept="image/*"
                            ref={(el) => (fileInputRefs.current[index] = el)}
                            onChange={(e) =>
                              handleImageChange(index, e.target.files)
                            }
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

                          {/* {step.images.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {step.images.map((img, i) => (
                                                                <div key={i} className="relative w-24 h-24">
                                                                    <img
                                                                        src={img.isNew ? URL.createObjectURL(img.file) : img.url}
                                                                        className="w-24 h-24 object-cover rounded border"
                                                                    />
                                                                    <button
                                                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                                                        onClick={() => handleDeleteImage(index, i)}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )} */}
                          {step.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {step.images.map((img, i) => (
                                <div key={i} className="relative w-24 h-24">
                                  <img
                                    src={
                                      img.isNew
                                        ? URL.createObjectURL(img.file)
                                        : img.url
                                    } // Hiển thị URL tạm thời cho ảnh mới
                                    className="w-24 h-24 object-cover rounded border"
                                    alt={`Step ${index + 1} - Image ${i + 1}`}
                                  />
                                  <button
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
                className={`w-auto rounded-md px-8 py-3 text-white cursor-pointer mb-4 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={handleSave}
                disabled={isLoading} // Disable nút khi đang loading
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
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
export default EditProcessStep;
