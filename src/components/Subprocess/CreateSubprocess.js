import React, { useEffect, useState, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import ProcessNav from "../ProcessNav/ProcessNav";
import ProgressMenu from "../ProcessList/ProgressMenu"
import "./subprocess.css"


const CreateSubprocess = () => {
  const location = useLocation();
  const { service, booking, IsExtraProcess } = location.state || {};
  
  console.log(booking);
  console.log(service)
  console.log(IsExtraProcess);

  const navigate = useNavigate();
  const fileInputRefs = useRef({});
  const [accessToken, setAccessToken] = useState("");
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [processId, setProcessId] = useState("");

  const [processTitle, setProcessTitle] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [deletedStepIds, setDeletedStepIds] = useState([]);

  const [errors, setErrors] = useState({
    processTitle: "",
    processDescription: "",
    steps: [] // array of { title: "", description: "" } theo index
  });

  const [steps, setSteps] = useState([
    { title: "", description: "", images: [] } // khởi tạo 1 bước đầu tiên (nếu muốn)
  ]);

  // fetch dữ liệu service, process và process step
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        // 2. Fetch process
        const processRes = await instance.get(`/api/process/get-by-id/${service.serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = processRes.data?.data?.[0];

        setProcessId(data.process.processId);
        setProcessTitle(data.process.processTittle);
        setProcessDescription(data.process.description);

        const mappedSteps = data.steps.map((s) => ({
          stepId: s.step.stepId,
          title: s.step.stepTitle,
          description: s.step.stepDesciption,
          images: s.images.map(img => ({ url: img.imageUrl, id: img.processStepImageId }))
        }));

        setSteps(mappedSteps);
      } catch (err) {
        console.error("Failed to load process or service:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (service) {
      fetchData();
    }
  }, [service]);

  // Sự kiện add step form
  const handleAddStep = () => {
    setSteps([...steps, { title: "", description: "", images: [] }]);

    // ✅ Xóa lỗi toàn cục nếu đang có
    setErrors((prev) => ({
      ...prev,
      global: ""
    }));
  };

  // Sự kiện delete step
  const handleDeleteStep = (index) => {
    const stepToDelete = steps[index];

    if (stepToDelete?.stepId) {
      setDeletedStepIds(prev => [...prev, stepToDelete.stepId]);
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
        global: "" // ✅ Xóa luôn lỗi tổng nếu có
      };
    });
  };

  // Xử lý sự change của image
  const handleImageChange = (index, files) => {
    const updatedSteps = [...steps];
    const newFiles = Array.from(files).map(file => ({ file, isNew: true }));
    updatedSteps[index].images = [...updatedSteps[index].images, ...newFiles];
    setSteps(updatedSteps);
  };

  // Xóa ảnh mỗi step
  const handleDeleteImage = (stepIndex, imageIndex) => {
    const updatedSteps = [...steps];
    const imageToDelete = updatedSteps[stepIndex].images[imageIndex];

    // Nếu ảnh cũ (không phải ảnh mới), lưu id để gửi xóa backend
    if (!imageToDelete.isNew && imageToDelete.id) {
      setDeletedImageIds(prev => [...prev, imageToDelete.id]);
    }

    // Xóa khỏi giao diện
    updatedSteps[stepIndex].images.splice(imageIndex, 1);
    setSteps(updatedSteps);
  };

  // Lấy URL khi up từ file
  const uploadImagesAndGetUrls = async () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const result = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepImages = [];

      const newImages = step.images.filter(img => img.isNew);
      const existingImages = step.images.filter(img => !img.isNew);

      // Upload ảnh mới
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach(img => formData.append("files", img.file));

        const res = await instance.post("/api/process/upload-images", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });

        const uploaded = res.data.map((f) => ({ imageUrl: f.urlFile }));
        // stepImages.push(...uploaded);
        stepImages.push(...uploaded.map(u => u.imageUrl));
      }

      // Giữ ảnh cũ (đã có id)
      // existingImages.forEach(img => {
      //   stepImages.push({
      //     imageUrl: img.url,
      //     processStepImageId: img.id
      //   });
      // });
      existingImages.forEach(img => {
        stepImages.push(img.url);
      });

      result[i] = stepImages;
    }

    return result;
  };

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

  //XỬ LÝ SỰ KIỆN CREATE SUB PROCESS
  const handleCreateSubprocess = async () => {
    if (service === null || booking === null) {
      toast.error("Cannot create subprocess");
      return;
    }

    if (!validate()) return;

    try {
      const imageUrlsByStep = await uploadImagesAndGetUrls();

      const requestBody = {
        farmerId: booking.accId,
        bookingServiceId: booking.bookingServiceId,
        processId: processId,
        title: processTitle,
        description: processDescription,
        numberOfSteps: steps.length,
        isExtraProcess: IsExtraProcess,
        processSteps: steps.map((step, i) => ({
          stepNumber: i + 1,
          stepTitle: step.title,
          stepDescription: step.description,
          images: imageUrlsByStep[i]
        }))
      };

      console.log(requestBody)

      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

      const res = await instance.post("/api/process/subprocess", requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      console.log(res.status === 200)
      console.log(res)
      if (res.status === 200 && res.data?.success) {
        toast.success("Subprocess created successfully!");
        navigate("/ProcessList");
      }

    } catch (error) {
      console.error("❌ Failed to create process:", error);
      console.error("➡️ Response from server:", error.response?.data);
      toast.error("Failed to create subprocess");
    }

  }

  if (loading) return <p>Loading service info...</p>;
  if (!service) return <p>Service not found.</p>;

  return (
    <div className="CreateSubprocess pt-16 progress-management progress-managment">
      <div className="px-2 div">
        <ProcessNav inPage="Process" />

        <div className="flex flex-col w-full gap-6 mt-6 progress-container lg:mt-14 lg:flex-row lg:justify-center">

          <div className="progress-left w-full lg:w-[32%] xl:w-[344px] lg:max-w-[344px]">
            <ProgressMenu inPage="Waiting" />
          </div>

          <div className="progress-right w-full lg:w-[66.5%] xl:w-[830px] lg:max-w-[830px]">

            <div className="create-progress-container flex-1 p-6">
              <h1 className="mb-4 text-2xl font-bold create-container-title text-start">Create New Subprocess</h1>

              <div className="header-section mb-6">
                <div className="flex flex-col md:flex-row items-center gap-7 mb-2 mt-4">
                  <div className="second-header flex gap-2">
                    <span className="font-semibold">For booking ID - </span>
                    <span style={{ color: "#3DB3FB" }} className="ml-auto">
                      {booking.bookingServiceId}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-7 mb-2 mt-4">
                  <div className="second-header description-farmer">
                    <span className="font-semibold">Description of Farmer </span>
                    <span className="ml-auto">
                      {booking.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* FORM CREATE SUBPROCESS  */}
              <div className="basic-info-section flex flex-col items-start rounded-[10px] gap-6 w-full p-4">
                <div className="basic-title">Basic Information for subprocess</div>
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
                    }}
                  />
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
                                    src={img.isNew ? URL.createObjectURL(img.file) : img.url}
                                    className="w-24 h-24 object-cover rounded border"
                                    alt="" />
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
            </div>

            <div className="w-full flex justify-end p-6">
              <button className="w-auto bg-blue-500 hover:bg-blue-600 rounded-md px-8 py-3 text-white cursor-pointer mb-4"
                onClick={handleCreateSubprocess}
              >
                Create
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreateSubprocess