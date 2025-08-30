import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ProcessSteps from "../../components/ProcessResult/ProcessSteps";
import ProcessIntroduction from "../../components/ProcessResult/ProcessIntroduction";
import ProcessResultInput from "../../components/ProcessResult/ProcessResultInput";
import ProcessResultHistory from "../../components/ProcessResult/ProcessResultHistory";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ProcessResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { SubprocessData, ProcessStepsData, isEdit } = location.state || {};

  console.log(isEdit)
  const [currentStep, setCurrentStep] = useState(null);
  const [stepResults, setStepResults] = useState([]);
  const [processSteps, setProcessSteps] = useState(ProcessStepsData || []);
  const [serviceData, setServiceData] = useState({ serviceName: "", imageUrl: "" });
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCompletedProcess, setIsCompletedProcess] = useState(false);

  // Lấy access token
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
  }, []);

  // Gọi API để lấy thông tin dịch vụ dựa trên processId
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!SubprocessData?.processId || !accessToken) return;
      try {
        const response = await instance.get(`/api/process/get-by-process-id/${SubprocessData.processId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.data.success && response.data.data.length > 0) {
          const service = response.data.data[0].service;
          setServiceData({
            serviceName: service.serviceName,
            imageUrl: service.imageUrl,
          });
        } else {
          toast.error(response.data.message || "Không thể lấy thông tin dịch vụ");
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
        toast.error("Lỗi khi lấy thông tin dịch vụ");
      }
    };
    fetchServiceData();
  }, [SubprocessData, accessToken]);

  // Set step đầu tiên làm mặc định
  useEffect(() => {
    if (processSteps && processSteps.length > 0) {
      setCurrentStep(processSteps[0].processStep);
    }
  }, [processSteps]);

  // Lấy danh sách kết quả khi thay đổi step
  useEffect(() => {
    if (currentStep && accessToken) {
      fetchStepResults(currentStep.stepId);
    }
  }, [currentStep, accessToken]);

  // Hàm lấy kết quả theo stepId
  const fetchStepResults = async (stepId) => {
    setLoading(true);
    try {
      const response = await instance.get(`/api/process-step/result/${stepId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        setStepResults(response.data.data);
      } else {
        setStepResults([]);
        console.log("No results found for this step");
      }
    } catch (error) {
      console.error("Error fetching step results:", error);
      setStepResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra step có kết quả hay không
  const checkStepHasResults = async (stepId) => {
    try {
      const response = await instance.get(`/api/process-step/result/${stepId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data.success && response.data.data.length > 0;
    } catch (error) {
      return false;
    }
  };

  // Hàm tạo kết quả mới
  const createStepResult = async (formData) => {
    try {
      const response = await instance.post('/api/process-step/result/create', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Create successful results!");
        fetchStepResults(currentStep.stepId);
        return true;
      } else {
        toast.error(response.data.message || "Create failed results!");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while creating the result.!");
      console.error("Error creating step result:", error);
      return false;
    }
  };

  // Hàm chuyển step
  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  //kiểm tra xem các prcess step đã có result hay chưa
  useEffect(() => {
    const handleCheckCompleted = async () => {

      try {
        const response = await instance.get(`/api/process/subprocess/check-completed/${SubprocessData.subprocessId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log(response)
        if (response.status === 200) {
          setIsCompletedProcess(true);
        }
      } catch (error) {
        console.log(error)
      }
    }

    handleCheckCompleted();
  }, [accessToken, SubprocessData])

  const handleConfirm = async (subprocessId, bookingServiceId) => {
    const result = await Swal.fire({
      title: 'Confirm completion',
      text: 'After confirming you cannot edit, are you sure you want to confirm to complete this process?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF3E36',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      // Hiển thị loading trong Swal
      Swal.fire({
        title: 'Sending...',
        text: 'Please wait while we send your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await instance.put(
          "/api/process/confirm-subprocess",
          {
            subprocessId: subprocessId,
            bookingServiceid: bookingServiceId
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );


        Swal.close(); // Đóng loading
        toast.success("Confirm successful completion of the process");
        navigate("/ProgressListFarmer");

      } catch (error) {
        Swal.close();

        // Nếu cần có logic cụ thể với từng lỗi (VD 409: đã confirm rồi)
        if (error?.response?.status === 409) {
          toast.warn("Tiến trình đã được xác nhận trước đó.");
          navigate("/ProgressListFarmer");
        } else {
          toast.error("Unable to confirm progress");
          console.error(error);
        }
      }
    }
  }
  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="flex flex-col gap-5 p-6 mx-auto md:flex-row max-w-7xl pt-[130px] text-left">
        {/* Left Section: Process Steps */}
        <div className="md:w-1/3">
          <ProcessSteps
            ProcessStepsData={processSteps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            checkStepHasResults={checkStepHasResults}
            accessToken={accessToken}
            serviceData={serviceData}
          />
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-5 md:w-2/3">
          <ProcessIntroduction
            SubprocessData={SubprocessData}
            currentStep={currentStep}
          />

          {isEdit === true && (
            <ProcessResultInput
              subprocessId={SubprocessData.subprocessId}
              currentStep={currentStep}
              onSubmit={createStepResult}
            />
          )}

          {isEdit === false && (
            <p style={{ color: "#EF3E36" }} className="font-bold italic text-xl">You are no role for edit result. Just view result of process.</p>
          )}

          {isEdit === true && isCompletedProcess === true && (
            <div className="mt-4 flex justify-end">
              <div onClick={() => handleConfirm(SubprocessData.subprocessId, SubprocessData.bookingServiceId)}
                style={{ color: "#EF3E36", cursor: "pointer" }}
                className="text-lg font-bold px-12 py-3 rounded-[2px] bg-[rgba(239,62,54,0.25)] hover:bg-[rgba(239,62,54,0.5)] cursor-pointer transition"
              >
                Confirm
              </div>
            </div>
          )}

          <ProcessResultHistory
            stepResults={stepResults}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessResultPage;