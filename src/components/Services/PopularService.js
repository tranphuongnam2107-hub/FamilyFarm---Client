import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import instance from "../../Axios/axiosConfig";

const PopularService = () => {
  const [services, setServices] = useState([]);

  //get list service
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // const res = await axios.get("https://localhost:7280/api/service/all");
        const res = await instance.get("api/service/all");
        if (res.data.success) {
          const mappedServices = res.data.data
            .filter((item) => item.service)
            .map((item) => item.service);

          const enrichedServices = await Promise.all(
            mappedServices.map(async (service) => {
              try {
                // const providerRes = await axios.get(`https://localhost:7280/api/account/profile-another/${service.providerId}`);
                const providerRes = await instance.get(
                  `api/account/profile-another/${service.providerId}`
                );
                const provider = providerRes.data?.data;

                return {
                  ...service,
                  fullName: provider?.fullName || "",
                  avatar: provider?.avatar || "",
                  country: provider?.country || "",
                  city: provider?.city || "",
                };
              } catch (err) {
                console.error(
                  "❌ Không thể lấy thông tin provider:",
                  service.providerId,
                  err
                );
                return {
                  ...service,
                  fullName: "",
                  avatar: "",
                  country: "",
                  city: "",
                };
              }
            })
          );

          //setServices(mappedServices);
          setServices(enrichedServices);
          // console.log("✅ Services đã chuẩn hóa:", enrichedServices);
        } else {
          console.error("❌ Lỗi khi gọi API:", res.data.message);
        }
      } catch (err) {
        console.error("❌ Lỗi mạng:", err);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="bg-white p-5 max-h-fit rounded-lg shadow-md border border-solid border-gray-300">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold mb-3">Popular Service</h2>
        <Link className="text-blue-800" to="/Service">
          See all
        </Link>
      </div>
      <div className="flex flex-col gap-3 ">
        {Array.isArray(services) &&
          services.slice(0, 4).map((service, index) => (
            <div
              key={index}
              className="flex justify-between gap-1 rounded-lg relative border border-solid border-gray-200"
            >
              <div className="absolute bg-lime-600 mt-1 p-1 px-3 rounded-r-full">
                <p className="font-bold text-sm text-white">{service.price}</p>
              </div>
              <div className="flex flex-col w-full border rounded-md">
                <Link
                  className="text-blue-800"
                  to={`/ServiceDetail/${service.serviceId}`}
                >
                  {/* <img
                    src={
                      service.imageUrl ||
                      "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fdefault_background.jpg?alt=media&token=0b68b316-68d0-47b4-9ba5-f64b9dd1ea2c"
                    }
                    alt={service.serviceName}
                    className="rounded-md"
                  /> */}
                  <img
                    src={
                      service.imageUrl ||
                      "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fdefault_background.jpg?alt=media&token=0b68b316-68d0-47b4-9ba5-f64b9dd1ea2c"
                    }
                    alt={service.serviceName}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </Link>

                <p className="p-2 font-bold text-left">{service.serviceName}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PopularService;
