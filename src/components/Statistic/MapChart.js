import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import * as signalR from "@microsoft/signalr";

export function MapChart() {
  const chartRef = useRef(null);
  const echartsInstance = useRef(null);

  // chuẩn hóa tên tỉnh
  const normalizeProvinceName = (name) => {
    const mapping = {
      "an giang": "An Giang",
      "ba ria vung tau": "Bà Rịa - Vũng Tàu",
      "bac giang": "Bắc Giang",
      "bac kan": "Bắc Kạn",
      "bac lieu": "Bạc Liêu",
      "bac ninh": "Bắc Ninh",
      "ben tre": "Bến Tre",
      "binh duong": "Bình Dương",
      "binh phuoc": "Bình Phước",
      "binh thuan": "Bình Thuận",
      "binh dinh": "Bình Định",
      "ca mau": "Cà Mau",
      "can tho": "Cần Thơ",
      "cao bang": "Cao Bằng",
      "gia lai": "Gia Lai",
      "ha giang": "Hà Giang",
      "ha nam": "Hà Nam",
      "ha noi": "Hà Nội",
      "ha tinh": "Hà Tĩnh",
      "hai duong": "Hải Dương",
      "hai phong": "Hải Phòng",
      "hau giang": "Hậu Giang",
      "ho chi minh": "TP. Hồ Chí Minh",
      "hoa binh": "Hòa Bình",
      "hung yen": "Hưng Yên",
      "khanh hoa": "Khánh Hòa",
      "kien giang": "Kiên Giang",
      "kon tum": "Kon Tum",
      "lai chau": "Lai Châu",
      "lam dong": "Lâm Đồng",
      "lang son": "Lạng Sơn",
      "lao cai": "Lào Cai",
      "long an": "Long An",
      "nam dinh": "Nam Định",
      "nghe an": "Nghệ An",
      "ninh binh": "Ninh Bình",
      "ninh thuan": "Ninh Thuận",
      "phu tho": "Phú Thọ",
      "phu yen": "Phú Yên",
      "quang binh": "Quảng Bình",
      "quang nam": "Quảng Nam",
      "quang ngai": "Quảng Ngãi",
      "quang ninh": "Quảng Ninh",
      "quang tri": "Quảng Trị",
      "soc trang": "Sóc Trăng",
      "son la": "Sơn La",
      "tay ninh": "Tây Ninh",
      "thai binh": "Thái Bình",
      "thai nguyen": "Thái Nguyên",
      "thanh hoa": "Thanh Hóa",
      "thua thien hue": "Thừa Thiên Huế",
      "tien giang": "Tiền Giang",
      "tra vinh": "Trà Vinh",
      "tuyen quang": "Tuyên Quang",
      "vinh long": "Vĩnh Long",
      "vinh phuc": "Vĩnh Phúc",
      "yen bai": "Yên Bái",
      "da nang": "Đà Nẵng",
      "dak lak": "Đắk Lắk",
      "dak nong": "Đắk Nông",
      "dien bien": "Điện Biên",
      "dong nai": "Đồng Nai",
      "dong thap": "Đồng Tháp",
    };

    // chuyển tiếng Việt có dấu thành không dấu
    const removeVietnameseTones = (str) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
    };

    // loại dấu, chuyển thường, loại bỏ khoảng trắng thừa
    const processedName = removeVietnameseTones(name)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    return mapping[processedName] || name;
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // tạo biểu đồ ECharts
    echartsInstance.current = echarts.init(chartRef.current);

    let connection = null;

    const loadMapAndConnect = async () => {
      try {
        // bản đồ geojson
        const geoRes = await fetch(
          "https://raw.githubusercontent.com/uyenvuminh/mapChartUyen/refs/heads/main/mapVN"
        );
        const vietnamGeoJSON = await geoRes.json();
        echarts.registerMap("VN", vietnamGeoJSON);

        // render biểu đồ từ dữ liệu
        const renderChart = (rawData) => {
          const data = rawData.map((item) => ({
            name: normalizeProvinceName(item.province),
            value: item.userCount || 0,
          }));

          const option = {
            title: {
              text: "User in province",
              left: "center",
              textStyle: { color: "#8b9dff" },
            },
            tooltip: {
              trigger: "item",
              formatter: "{b}: {c} users",
            },
            visualMap: {
              min: 0,
              max: Math.max(...data.map((d) => d.value)) || 100,
              left: "left",
              top: "bottom",
              text: ["More", "Less"],
              calculable: true,
              inRange: {
                color: ["#e7c768", "#dfb127", "#b38702"],
              },
            },
            series: [
              {
                name: "Người dùng",
                type: "map",
                map: "VN",
                roam: true,
                label: {
                  show: true,
                  fontSize: 8,
                  color: "#333",
                },
                emphasis: {
                  label: {
                    show: true,
                    fontWeight: "thin",
                    color: "#000",
                  },
                },
                data: data,
              },
            ],
          };

          echartsInstance.current.setOption(option);
        };

        // dữ liệu lần đầu
        const response = await fetch(
          "https://localhost:7280/api/statistic/users-by-province"
        );
        const result = await response.json();
        renderChart(result.data);

        // SignalR
        connection = new signalR.HubConnectionBuilder()
          .withUrl("https://localhost:7280/topEngagedPostHub")
          .withAutomaticReconnect()
          .build();

        connection.on("UsersByProvince", (newData) => {
          console.log("Realtime update:", newData);
          renderChart(newData);
        });

        await connection.start();
        console.log("Connected to SignalR hub");
      } catch (error) {
        console.error("Lỗi khi load bản đồ hoặc kết nối SignalR:", error);
      }
    };

    loadMapAndConnect();

    return () => {
      if (echartsInstance.current) {
        echartsInstance.current.dispose();
      }
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  return (
    <div className="p-4">
      <div
        ref={chartRef}
        className="border rounded shadow w-full h-[700px]"
      ></div>
    </div>
  );
}

export default MapChart;
