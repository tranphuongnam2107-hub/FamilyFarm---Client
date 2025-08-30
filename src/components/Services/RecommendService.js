import React from "react";
import serviceBg from "../../assets/images/service_thumb.png";

export default function RecommendService() {
  const services = [
    { id: 1, name: "Service 1", image: serviceBg },
    { id: 2, name: "Service 2", image: serviceBg },
  ];

  return (
    <div className="recommend-service-expert w-full max-w-[345px] bg-[#FAFAFA] rounded-lg">
      <div className="recommend-container w-full p-4">
        <div className="recent-service text-start font-roboto font-medium text-[#3e3f5e] text-[18px] leading-normal whitespace-nowrap">
          Recent service
        </div>

        {services.map((service) => (
          <div key={service.id} className="service-box w-full mt-6">
            <div className="service-card relative h-[160px] overflow-hidden rounded-xl cursor-pointer">
              <div className="background-service absolute inset-0 rounded-xl overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="service-name relative z-20 w-full h-[50px] bg-white/50 top-[110px] pl-4">
                <p className="name-text h-full flex items-center font-roboto font-bold text-[#3e3f5e] text-[16px] leading-normal whitespace-nowrap">
                  {service.name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
