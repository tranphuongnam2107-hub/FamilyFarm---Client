import React, { useState, useEffect } from "react";
import coldImage from "../../assets/images/cold.png";
import { getOwnProfile } from "../../services/accountService";

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null); // Bỏ giá trị mặc định cứng
  const [searchValue, setSearchValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState(null); // Thêm trạng thái lỗi
  const API_KEY = "a61826b4d48fe76b9fe95e09cd8430d4";
  const DEFAULT_CITY = "Can Tho";

  const updateTime = (data) => {
    setWeatherData((prev) => ({
      ...prev,
      time: new Date().toLocaleString("vi"),
    }));
  };

  const fetchWeatherData = async (city) => {
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    try {
      const response = await fetch(apiURL);
      const profile = await getOwnProfile();
      const cleanCity = profile.data.city.replace(/^(Tỉnh|Thành phố)\s*/i, "") || "Can Tho";
      const data = await response.json();
      if (data.cod === 200) {
        setWeatherData({
          city: cleanCity,
          country: data.sys.country,
          time: new Date().toLocaleString("vi"),
          temperature: (data.main.temp - 273.15).toFixed(),
          description: data.weather[0].main,
          visibility: `${data.visibility} (m)`,
          windSpeed: `${data.wind.speed} (m/s)`,
          humidity: `${data.main.humidity} (%)`,
        });
        setIsVisible(true);
        setError(null);
      } else {
        setIsVisible(false);
        setError(data.message || "City not found");
      }
    } catch (error) {
      setIsVisible(false);
      setError("Failed to fetch weather data");
      console.error("Error fetching weather:", error);
    }
  };

  // Tải dữ liệu mặc định khi component mount
  useEffect(() => {
    fetchWeatherData(DEFAULT_CITY); // Tải thời tiết cho Cần Thơ
    const interval = setInterval(() => updateTime(), 1000);
    return () => clearInterval(interval);
  }, []);

  const changeWeatherUI = async () => {
    if (!searchValue.trim()) {
      setError("Please enter a city name");
      setIsVisible(false);
      return;
    }
    await fetchWeatherData(searchValue);
  };

  return (
    <div className="flex items-center rounded-lg shadow-md">
      <div
        className="w-full p-6 bg-center bg-no-repeat bg-cover rounded-lg"
        style={{ backgroundImage: `url(${coldImage})` }}
      >
        <input
          type="text"
          className="search w-full p-3 border-none outline-none bg-white/30 rounded-[0_15px_0_15px] shadow-md transition-all duration-300 focus:bg-white/90 focus:rounded-[15px_0_15px_0]"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && changeWeatherUI()}
          placeholder="Enter city name"
        />
        {error && (
          <div className="mt-2 text-red-500 text-center">{error}</div>
        )}
        {weatherData && (
          <div
            className={`content text-center text-white mt-5 transition-all duration-400 ${isVisible ? "" : "invisible opacity-0"
              }`}
          >
            <h1
              className="text-2xl font-bold capital text-shadow"
              style={{ textShadow: "2px 2px rgba(0, 0, 0, 0.7)" }}
            >
              <span className="city">{weatherData.city}</span>
              <span>, </span>
              <span className="country">{weatherData.country}</span>
            </h1>
            <div className="mt-1 mb-5 text-sm time">{weatherData.time}</div>
            <div
              className="p-5 mx-8 text-6xl font-semibold shadow-lg temparature text-shadow-lg bg-white/40 rounded-xl"
              style={{
                fontWeight: 600,
                textShadow: "4px 4px rgba(0, 0, 0, 0.7)",
                boxShadow: "4px 4px rgba(0, 0, 0, 0.7)",
              }}
            >
              <span className="value text-shadow-lg">{weatherData.temperature}</span>
              <sup className="text-5xl">∘</sup>C
            </div>
            <div className="mt-5 mb-10 text-4xl font-bold short-desc text-shadow">
              {weatherData.description}
            </div>
            <div className="flex flex-row items-center justify-between more-desc">
              <div className="flex flex-col items-center justify-center gap-5 visibility">
                <i className="fa-regular fa-eye fa-lg"></i>
                <span>{weatherData.visibility}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-5 speed">
                <i className="fa-solid fa-wind fa-lg"></i>
                <span>{weatherData.windSpeed}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-5 humidity">
                <i className="fa-solid fa-cloud-sun fa-lg"></i>
                <span>{weatherData.humidity}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;