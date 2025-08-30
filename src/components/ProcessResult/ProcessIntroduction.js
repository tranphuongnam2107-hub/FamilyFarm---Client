import React from "react";

const ProcessIntroduction = ({ SubprocessData, currentStep }) => {
  console.log("currentStep:", currentStep);

  return (
    <div className="w-full bg-white">
      <div className="flex flex-col gap-5">
        {/* Current Step Info */}
        {currentStep && (
          <>
            {/* Instructions Section */}
            <div className="p-5 border border-gray-200 border-solid rounded-lg shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-800">INSTRUCTION</h2>
              <p className="text-gray-600 text-sm mb-4">
                {currentStep.stepDesciption || "No detailed instructions."}
              </p>
            </div>
            {/* Illustration Section */}
            <div className="p-5 border border-gray-200 border-solid rounded-lg shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-gray-800">ILLUSTRATION</h2>
              {currentStep.processStepImages && currentStep.processStepImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {currentStep.processStepImages.map((image, index) => (
                    <img
                      key={index}
                      src={image.imageUrl}
                      alt={`Minh họa ${index + 1}`}
                      className="object-cover w-full h-40 rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No illustrations.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcessIntroduction;