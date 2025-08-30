import React, { useState, useEffect } from "react";

const ProcessSteps = ({ ProcessStepsData, currentStep, onStepChange, checkStepHasResults, accessToken, serviceData }) => {
  const [stepsWithResults, setStepsWithResults] = useState({});

  // Kiểm tra kết quả cho tất cả steps
  useEffect(() => {
    if (ProcessStepsData && accessToken) {
      const checkAllSteps = async () => {
        const results = {};
        for (const stepData of ProcessStepsData) {
          const hasResults = await checkStepHasResults(stepData.processStep.stepId);
          results[stepData.processStep.stepId] = hasResults;
        }
        setStepsWithResults(results);
      };
      checkAllSteps();
    }
  }, [ProcessStepsData, accessToken, checkStepHasResults]);

  // Kiểm tra xem step có thể click được không
  const canAccessStep = (stepIndex) => {
    if (stepIndex === 0) return true; // Step đầu tiên luôn có thể access
    
    // Kiểm tra step trước có kết quả hay không
    const prevStep = ProcessStepsData[stepIndex - 1];
    return stepsWithResults[prevStep.processStep.stepId] || false;
  };

  const handleStepClick = (step, stepIndex) => {
    if (canAccessStep(stepIndex)) {
      onStepChange(step.processStep);
    }
  };

  return (
    <div className="w-full">
      <img
        src={serviceData.imageUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNl6ByXPYWepPI7KOWpK9sW6RGfz8eH-DCJeGi3R1vhhO9_kzslj3e2rCxEbh52glj6GM&usqp=CAU"}
        alt="Service img"
        className="object-cover w-full h-44 rounded-xl"
      />
      <h2 className="py-4 text-xl font-bold">{serviceData.serviceName || "Service Name"}</h2>
      <h2 className="py-4 text-lg font-bold">Process steps:</h2>
      <div className="space-y-0">
        {ProcessStepsData && ProcessStepsData.map((step, index) => {
          const isActive = currentStep && currentStep.stepId === step.processStep.stepId;
          const hasResults = stepsWithResults[step.processStep.stepId];
          const canAccess = canAccessStep(index);
          
          return (
            <button
              key={step.processStep.stepId}
              onClick={() => handleStepClick(step, index)}
              disabled={!canAccess}
              className={`flex items-center w-full px-4 py-4 text-left transition ${
                isActive
                  ? "bg-[#3DB3FB]/25 border-l-4 border-[#3DB3FB]"
                  : canAccess
                  ? "hover:bg-blue-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <i
                className={`w-6 mr-3 ${
                  hasResults 
                    ? "fa-solid fa-circle-check text-[#3DB3FB]" 
                    : canAccess 
                    ? "fa-regular fa-circle text-gray-400"
                    : "fa-solid fa-lock text-gray-400"
                }`}
              />
              <div className="flex">
                <div className="text-sm font-medium">
                  Step {step.processStep.stepNumber}:  
                  <span> {step.processStep.stepTitle}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessSteps;