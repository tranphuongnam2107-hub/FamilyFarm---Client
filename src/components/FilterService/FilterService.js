import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function FilterService({ onClose, onApplyFilter }) {
  // const [searchText, setSearchText] = useState("");
  // const [rating, setRating] = useState("");
  // const [priceRange, setPriceRange] = useState("");
  // const [publishDate, setPublishDate] = useState("");
  const [name, setName] = useState("");
  const [star, setStar] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // const [countries, setCountries] = useState([]);
  // const [cities, setCities] = useState([]);
  // const [selectedCountry, setSelectedCountry] = useState("");
  // const [selectedCity, setSelectedCity] = useState("");

  // // API lấy danh sách quốc gia
  // useEffect(() => {
  //   axios.get("https://countriesnow.space/api/v0.1/countries")
  //     .then(res => {
  //       if (res.data && res.data.data) {
  //         setCountries(res.data.data.map(c => c.country));
  //       }
  //     })
  //     .catch(err => console.error("❌ Lỗi lấy danh sách quốc gia:", err));
  // }, []);

  // // API lấy danh sách thành phố quốc gia đã chọn
  // useEffect(() => {
  //   if (selectedCountry) {
  //     axios.post("https://countriesnow.space/api/v0.1/countries/cities", {
  //       country: selectedCountry
  //     })
  //       .then(res => {
  //         if (res.data && res.data.data) {
  //           setCities(res.data.data);
  //         }
  //       })
  //       .catch(err => console.error("❌ Lỗi lấy thành phố:", err));
  //   }
  // }, [selectedCountry]);

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  // Mặc định country là "Vietnam"
  const selectedCountry = "Vietnam";

  // Gọi API esgoo để lấy danh sách tỉnh/thành phố
  useEffect(() => {
    axios.get("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then(res => {
        const cityList = res.data?.data;
        console.log("✅ Dữ liệu thành phố:", cityList);
        if (Array.isArray(cityList)) {
          const cityNames = cityList.map(item => item.name_en);
          setCities(cityNames);
        } else {
          console.error("❌ Dữ liệu không phải mảng:", cityList);
        }
      })
      .catch(err => console.error("❌ Lỗi lấy thành phố:", err));
  }, []);

  const handleSubmit = () => {
    let priceMin = null;
    let priceMax = null;

    switch (priceRange) {
      case "low":
        priceMax = 200000;
        break;
      case "mid":
        priceMin = 200000;
        priceMax = 500000;
        break;
      case "high":
        priceMin = 500000;
        priceMax = 1000000;
        break;
      case "veryHigh":
        priceMin = 1000000;
        break;
      default:
        break;
    }

    onApplyFilter({
      name,
      star,
      priceMin,
      priceMax,
      createdAt,
      // country: selectedCountry,
      // city: selectedCity
      country: selectedCountry,
      city: selectedCity
    });
    onClose()
  };

  // useEffect(() => {
  //   const handleClose = () => onToggle();
  //   window.addEventListener("closeFilter", handleClose);
  //   return () => window.removeEventListener("closeFilter", handleClose);
  // }, [onToggle]);

  return (
    // <div className="relative">
    //   <div className="icon-filter"
    //         onClick={onToggle}
    //         role="button"
    //         aria-label="Toggle filter"
    //         aria-expanded={isVisible}>
    //     <img src={filterIcon} alt="image" />
    //   </div>
    // </div>

    <div className="flex justify-center items-center h-auto">
      <div className="bg-white w-[450px] p-8 rounded-lg shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg text-gray-800 flex items-center gap-2">
            <i className="fas fa-sliders-h text-sky-400"></i> Filter Service
          </h2>
          <div className="close-filter-btn w-8 h-8 rounded-full text-2xl text-gray-800 cursor-pointer hover:bg-slate-400" onClick={onClose}>&times;</div>
        </div>

        {/* Body */}
        <div className="ml-6">
          <div className="mb-4">
            <h4 className="text-sm text-gray-500 mb-2">Search name service</h4>
            <div className="flex items-center bg-red-100 rounded-lg px-4 py-2">
              <i className="fas fa-search text-gray-600 mr-2"></i>
              <input
                type="text"
                placeholder="Text here..."
                className="bg-transparent outline-none flex-1 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-5 mb-6 text-sm">
            {/* Publish Date */}
            {/* <div>
              <h4 className="text-gray-500 mb-2">Publish date</h4>
              <Link to="/1" className="text-sky-400 block mb-1 ml-1">
                Today
              </Link>
              <Link to="/1" className="text-sky-400 block mb-1 ml-1">
                This week
              </Link>
              <Link to="/1" className="text-sky-400 block mb-1 ml-1">
                This month
              </Link>
              <Link to="/1" className="text-sky-400 block mb-1 ml-1">
                This year
              </Link>
            </div> */}
            <div>
              <h4 className="text-gray-500 mb-2">Publish date</h4>
              {["today", "week", "month", "year"].map((val) => (
                <button
                  key={val}
                  onClick={() => setCreatedAt(val)}
                  className={`text-left block mb-1 ml-1 ${
                    createdAt === val ? "text-blue-600 font-bold" : "text-sky-400"
                  }`}
                >
                  {val === "today" && "Today"}
                  {val === "week" && "This week"}
                  {val === "month" && "This month"}
                  {val === "year" && "This year"}
                </button>
              ))}
            </div>

            {/* Star & Price */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-gray-500 whitespace-nowrap">Star rating</h4>
                <select className="text-sm border-none bg-transparent focus:outline-none"
                value={star}
                  onChange={(e) => setStar(e.target.value)}
                  >
                  <option value="">Any</option>
                  <option value="5">5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </div>
              <h4 className="text-gray-500 mb-2">Service price</h4>
              <div className="flex flex-col items-start gap-1 text-sky-500">
                <label className="ml-1">
                  <input
                    type="radio"
                    name="price"
                    value="low"
                    checked={priceRange === "low"}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  Lower 200.000
                </label>
                <label className="ml-1">
                  <input
                    type="radio"
                    name="price"
                    value="mid"
                    checked={priceRange === "mid"}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  200.000 to 500.000
                </label>
                <label className="ml-1">
                  <input
                    type="radio"
                    name="price"
                    value="high"
                    checked={priceRange === "high"}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  500.000 to 1.000.000
                </label>
                <label className="ml-1">
                  <input
                    type="radio"
                    name="price"
                    value="veryHigh"
                    checked={priceRange === "veryHigh"}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  Greater 1.000.000
                </label>
              </div>
            </div>
          </div>

          {/* Position Filters */}
          <div className="mb-6 text-start">
            <h4 className="text-sm text-gray-500 mb-2">Position</h4>
            <div className="mb-4">
              <label className="text-sky-400 text-sm mr-2">Country:</label>
              <select className="text-sm border-none bg-transparent focus:outline-none w-[100px]"
              value={selectedCountry} disabled>
                <option value="Vietnam">Vietnam</option>
              </select>
            </div>
            <div>
              <label className="text-sky-400 text-sm mr-2">City:</label>
              <select className="text-sm border-none focus:outline-none w-[100px] bg-white text-black border"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}>
                {/* <option>Select</option>
                <option>Hà Nội</option>
                <option>HCM</option> */}
                <option value="">Select</option>
                {cities.map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
              </select>
              {/* <pre>{JSON.stringify(cities, null, 2)}</pre> */}
            </div>
          </div>

          {/* Search Button */}
          <button className="bg-sky-400 text-white font-bold text-sm py-3 px-6 rounded-lg block ml-auto"
            onClick={handleSubmit}
          >
            SEARCH
          </button>
        </div>
      </div>
    </div>
  );
};
