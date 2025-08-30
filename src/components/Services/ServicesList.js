import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookingModal from "./BookingModal";
import serviceBg from "../../assets/images/service_thumb.png";
import filterIcon from "../../assets/images/filter_icon_svg.svg";
import lineService from "../../assets/images/Line 9.png";
import userAvatar from "../../assets/images/user1.png";
import cart from "../../assets/images/icon_shopping_cart.png";
import yellowStar from "../../assets/images/icon_yellow_star.png";
import grayStar from "../../assets/images/icon_gray_star.png";
import previous from "../../assets/images/previous.png";
import continous from "../../assets/images/continous.png";
import addFriend from "../../assets/images/weui_add-friends-filled.png";
import SuggestedExperts from "./SuggestedExperts";
import SuggestedGroups from "../Home/SuggestedGroups";
import FilterService from "../FilterService/FilterService";
import instance from "../../Axios/axiosConfig";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { jwtDecode } from "jwt-decode";
import SuggestedFriends from "../Home/SuggestedFriends";
import { toast } from "react-toastify";

export default function ServicesList() {
  const [groupSuggestData, setGroupData] = useState([]);
  const [suggestedExpert, setSuggestedExpert] = useState([]);
  const [suggestedFriend, setSuggestedFriend] = useState([]);
  const [services, setServices] = useState([]);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [filteredServices, setFilteredServices] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [filter, setFilter] = useState({
    name: "",
    star: "",
    priceMin: null,
    priceMax: null,
    createdAt: "",
  });

  // Bấm hiện filter
  const handleToggleFilter = () => {
    setShowFilterPopup(!showFilterPopup);
  };

  const handleApplyFilter = (filterData) => {
    console.log("Filter nhận được từ FilterService:", filterData);
    setFilter(filterData);
    setCurrentPage(1); // reset về trang đầu
    setShowFilterPopup(!showFilterPopup);
  };

  // Mở modal booking
  const openBookingModal = (id) => {
    const roleId = localStorage.getItem("roleId") || sessionStorage.getItem("roleId");
    if (roleId === "68007b2a87b41211f0af1d57") {
      toast.error("USER DOES NOT HAVE BOOKING PERMISSION.");
      return;
    }
    setSelectedServiceId(id);
    setIsBookingOpen(true);
  };

  // get accid
  let roleId = null;
  const token = localStorage.getItem("accessToken");
  if (token) {
    const decoded = jwtDecode(token);
    roleId = decoded.RoleId;
    console.log("roleId:", roleId);
  } else {
    console.log("⚠️ No token found");
  }

  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      try {
        // const res = await axios.get("https://localhost:7280/api/service/all");
        // const res = await instance.get("api/service/all");
        const res = await instance.get("api/service/all", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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

  const indexOfLastService = currentPage * itemsPerPage;
  const indexOfFirstService = indexOfLastService - itemsPerPage;
  const currentServices = filteredServices.slice(
    indexOfFirstService,
    indexOfLastService
  );
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  useEffect(() => {
    const now = new Date();

    const filtered = services.filter((service, index) => {
      const matchName = filter.name
        ? service.serviceName?.toLowerCase().includes(filter.name.toLowerCase())
        : true;

      const matchStar = filter.star
        ? Math.floor(service.averageRate || 0) === parseInt(filter.star)
        : true;

      const price = Number(service.price); // ← Ép kiểu tại đây
      const matchPrice =
        (filter.priceMin === null || price >= filter.priceMin) &&
        (filter.priceMax === null || price <= filter.priceMax);

      const matchCountry = filter.country
        ? service.country?.toLowerCase() === filter.country.toLowerCase()
        : true;

      const matchCity = filter.city
        ? service.city?.toLowerCase() === filter.city.toLowerCase()
        : true;

      let matchDate = true;
      if (filter.createdAt && service.createAt) {
        const createdAt = new Date(service.createAt);

        switch (filter.createdAt) {
          case "today": {
            const createdDateString = createdAt.toISOString().split("T")[0];
            const nowDateString = now.toISOString().split("T")[0];
            matchDate = createdDateString === nowDateString;
            break;
          }
          case "week": {
            const startOfDayUTC = (date) => {
              return new Date(
                Date.UTC(
                  date.getUTCFullYear(),
                  date.getUTCMonth(),
                  date.getUTCDate()
                )
              );
            };
            const created = startOfDayUTC(createdAt);
            const start = startOfDayUTC(new Date(now));
            start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // Chủ nhật
            const end = new Date(start);
            end.setUTCDate(start.getUTCDate() + 6); // Thứ bảy

            matchDate = created >= start && created <= end;

            break;
          }
          case "month":
            matchDate =
              createdAt.getMonth() === now.getMonth() &&
              createdAt.getFullYear() === now.getFullYear();
            break;
          case "year":
            matchDate = createdAt.getFullYear() === now.getFullYear();
            break;
          default:
            matchDate = true;
        }
      }

      return (
        matchName &&
        matchStar &&
        matchPrice &&
        matchDate &&
        matchCountry &&
        matchCity
      );
    });

    setFilteredServices(filtered);
  }, [services, filter]);

  const fetchSuggestedExpert = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `https://localhost:7280/api/friend/suggestion-expert`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      if (json.data.length !== 0) {
        setSuggestedExpert(json.data);
        console.log(
          "Suggested experts:",
          json.data[0].username + " aaaaaaaaaaaaaaaaaa"
        );
      } else {
        setSuggestedExpert([]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchSuggestedFriend = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `https://localhost:7280/api/friend/suggestion-friend-home`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      if (json.data.length !== 0) {
        setSuggestedFriend(json.data);
        console.log(
          "Suggested experts:",
          json.data[0].username + " aaaaaaaaaaaaaaaaaa"
        );
      } else {
        setSuggestedFriend([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (roleId === "68007b2a87b41211f0af1d57") {
      fetchSuggestedFriend();
    } else if (roleId === "68007b0387b41211f0af1d56") {
      fetchSuggestedExpert();
    }
  }, [roleId]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group/group-suggestion-in-service`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Kiểm tra dữ liệu và cập nhật state
      if (data.success === true) {
        setGroupData(data.data);
      } else {
        console.warn("Unexpected response format:", data);
        setGroupData([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="service">
      <div className="div">
        <div className="main-container w-full flex flex-row justify-center lg:mt-[9rem] mt-[5rem] gap-5 mx-auto">
          <div className="flex flex-col w-full mx-3 container-service max-w-[710px] md:mx-0 md:w-5xl">
            <div className="mt-2 service-header">
              <div className="flex flex-row justify-between px-4 service-header-title">
                <div className="text-wrapper">Services</div>
                <div>
                  {/* Icon Filter */}
                  <div
                    className="icon-filter cursor-pointer"
                    onClick={handleToggleFilter}
                  >
                    <img src={filterIcon} alt="Filter" />
                  </div>

                  {/* Popup FilterService */}
                  {showFilterPopup && (
                    <div className="fixed left-[35%] top-[200px] h-fit w-fit inset-0 flex justify-center items-center z-50">
                      <div className="relative">
                        <FilterService
                          onClose={() => setShowFilterPopup(false)}
                          onApplyFilter={handleApplyFilter}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <img className="mx-auto mt-2 line" src={lineService} />
            </div>

            <div className="service-container w-[91.8%] lg:w-[650px] mx-auto">
              {/* Hiển thị list service */}
              {currentServices.length === 0 ? (
                <div className="text-center text-gray-500 mt-6 text-lg">
                  No service found
                </div>
              ) : (
                currentServices.map((service, index) => (
                  <Link
                    key={index}
                    to={`/ServiceDetail/${service.serviceId}`}
                    className="service-box w-[42%] md:w-[44.55%] lg:w-[315px] pb-3"
                  >
                    <img
                      className="service-background object-cover"
                      src={
                        service.imageUrl && service.imageUrl.trim() !== ""
                          ? service.imageUrl
                          : "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fdefault_background.jpg?alt=media&token=0b68b316-68d0-47b4-9ba5-f64b9dd1ea2c"
                      }
                      alt="service background"
                    />
                    <div className="service-title w-[93%] min-h-[32px]">
                      {/* <Link
                        to={`/ServiceDetail/${service.serviceId}`}
                        className="text-[rgba(0,0,0,0.75)] hover:text-[#3db3fb] hover:no-underline transition-colors duration-200 ease-in-out"
                      >
                        {service.serviceName}
                      </Link> */}
                      <p className="text-[rgba(0,0,0,0.75)] hover:text-[#3db3fb] hover:no-underline transition-colors duration-200 ease-in-out">{service.serviceName}</p>
                    </div>
                    <div className="body-service px-3">
                      <div className="author-content">
                        <div className="avatar-content">
                          <img
                            className="w-[45px] h-[45px] rounded-full"
                            src={
                              service.avatar && service.avatar.trim() !== ""
                                ? service.avatar
                                : defaultAvatar
                            }
                            alt="avatar"
                          />
                        </div>
                        <div className="author-info">
                          <div className="author-name">{service.fullName}</div>
                          <div className="author-role">Expert</div>
                        </div>
                      </div>
                      <div className="price-content">
                        <div className="icon-cart">
                          <img src={cart} alt="cart" />
                        </div>
                        <span className="price-num">{service.price}</span>
                        <span className="price-deno">VND</span>
                      </div>
                    </div>
                    <div className="footer-service">
                      <div className="rate-cotent">
                        <div className="flex flex-row star-rates">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <img
                              key={star}
                              className="star-icon"
                              src={
                                star <= Math.round(service.averageRate || 0)
                                  ? yellowStar
                                  : grayStar
                              }
                              alt="star"
                            />
                          ))}
                        </div>
                        <div className="rate-num">
                          ({service.rateCount || 0})
                        </div>
                      </div>
                      <div className="status-expert-container">
                        <button
                          className="font-bold rounded-lg cursor-pointer bg-amber-300 px-4 py-2 hover:bg-amber-500 text-white"
                          // onClick={() => openBookingModal(service.serviceId)}
                          onClick={(e) => {
                            e.stopPropagation();     // Ngăn sự kiện nổi bọt lên Link
                            e.preventDefault();      // Ngăn hành vi mặc định của thẻ <a>
                            openBookingModal(service.serviceId);
                          }}
                        >
                          Booking
                        </button>
                      </div>
                    </div>
                  </Link>
                ))
              )}

            </div>

            {/* Phân trang */}
            <div className="flex flex-row justify-center gap-2 mx-auto pageniation mt-9 mb-3">
              {/* Nút Previous */}
              <div
                className="flex items-center justify-center mask-wrapper cursor-pointer"
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
              >
                <img className="mask" src={previous} />
              </div>

              {/* Số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <div
                    key={pageNum}
                    className={`flex items-center justify-center ${pageNum === currentPage ? "overlap-4" : "overlap-3"
                      } cursor-pointer`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    <div className="text-wrapper-2">{pageNum}</div>
                  </div>
                )
              )}

              {/* Nút Next */}
              <div
                className="flex items-center justify-center mask-group-wrapper cursor-pointer"
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
              >
                <img className="mask" src={continous} />
              </div>
            </div>
          </div>
          {/* Booking modal */}
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            serviceId={selectedServiceId}
          />
          <div className="suggest-expert hidden md:block md:w-[306px] max-w-[306px] space-y-6">
            {roleId === "68007b2a87b41211f0af1d57" && (
              <SuggestedFriends
                friends={suggestedFriend}
                onLoadList={fetchSuggestedFriend}
              />
            )}

            {roleId === "68007b0387b41211f0af1d56" && (
              <SuggestedExperts
                friends={suggestedExpert}
                onLoadList={fetchSuggestedExpert}
              />
            )}

            <SuggestedGroups groups={groupSuggestData} />
          </div>
        </div>
      </div>
    </div>
  );
}
