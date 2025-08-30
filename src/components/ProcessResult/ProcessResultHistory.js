import React from "react";
import formatTime from "../../utils/formatTime";

const ProcessResultHistory = ({ stepResults, loading }) => {
  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="text-gray-500">Loading results history...</div>
      </div>
    );
  }

  if (!stepResults || stepResults.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-gray-500">There are no results for this step yet.</div>
      </div>
    );
  }

  // Sắp xếp kết quả theo thời gian tạo (mới nhất trước)
  const sortedResults = [...stepResults].sort(
    (a, b) => new Date(b.result.createdAt) - new Date(a.result.createdAt)
  );

  return (
    <div className="space-y-6 process-result-history">
      <h3 className="text-lg font-semibold">Results History ({stepResults.length})</h3>
      
      {sortedResults.map((resultData, index) => (
        <div key={resultData.result.stepResultId}>
          <div className="flex mb-2">
            <p className="py-2 px-4 bg-[#3DB3FB]/25 text-[#3DB3FB] text-sm">
              {formatTime(resultData.result.createdAt)}
            </p>
          </div>
          
          <div className="w-full p-5 bg-white border border-gray-200 border-solid rounded-lg shadow-xl">
            <h4 className="mb-3 text-lg font-semibold">Result #{sortedResults.length - index}</h4>
            
            {resultData.result.stepResultComment && (
              <div className="mb-4">
                <div  
                  className="text-sm prose text-gray-800 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: resultData.result.stepResultComment }}
                />
              </div>
            )}
            
            {resultData.images && resultData.images.length > 0 && (
              <div className="mt-4">
                <h5 className="mb-2 text-md font-semibold">
                  Images ({resultData.images.length})
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {resultData.images.map((image, imgIndex) => (
                    <img
                      key={image.stepResultImageId}
                      src={image.imageUrl}
                      alt={`Result ${index + 1}`}
                      className="object-cover w-full h-32 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(image.imageUrl, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessResultHistory;