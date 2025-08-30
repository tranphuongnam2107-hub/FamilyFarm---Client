// RePaymentResult.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RePaymentResult = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchPaymentResult = async () => {
  //     console.log("Chay repayment call back");
  //     try {
  //       const query = window.location.search;
  //       // console.log("Query");
  //       // console.log(query);
  //       const response = await axios.get(`https://localhost:7280/api/payment/vnpay-return-repayment${query}`);

  //       if (response.data.success) {
  //         // ✅ Lưu trạng thái để PaymentManagementPage mở đúng tab
  //         localStorage.setItem("viewMode", "ExpertPayout");

  //         // ✅ Điều hướng về trang quản lý thanh toán
  //         navigate("/PaymentManagement");
  //       } else {
  //         navigate("/RePaymentFailed");
  //       }
  //     } catch (error) {
  //       console.error("Lỗi khi xác minh thanh toán:", error);
  //       console.log("Server response:", error.response?.data);
  //       navigate("/RePaymentFailed");
  //     }
  //   };

  //   fetchPaymentResult();
  // }, [navigate]);

  useEffect(() => {
    // const calledRef = useRef(false);

    // if (calledRef.current) return;
    // calledRef.current = true;

    const fetchPaymentResult = async () => {
      try {
        const query = window.location.search;
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        // 🔹 1. Gọi xác nhận thanh toán hoàn trả
        // const response = await axios.get(`https://localhost:7280/api/payment/vnpay-return-repayment${query}`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        const response = await axios.get(`https://localhost:7280/api/payment/vnpay-return-repayment${query}`);

        if (response.data.success) {
          // 🔹 2. Lấy hóa đơn mới nhất
          const latest = await axios.get("https://localhost:7280/api/payment/latest-payment", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const paymentId = latest.data?.paymentId;

          if (!paymentId) {
            alert("Không tìm thấy hóa đơn vừa thanh toán.");
            return navigate("/PaymentManagement");
          }

          // 🔹 3. Gửi email bill
          await axios.post(
            "https://localhost:7280/api/payment/send-bill-email",
            {
              PaymentId: paymentId,
              Subject: "Family Farm - Service Payment Invoice",
              ToAccId: "", // để rỗng nếu backend tự xác định
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // 🔹 4. Điều hướng tới trang xem bill
          localStorage.setItem("viewMode", "ExpertPayout");
          navigate(`/PaymentInvoice/${paymentId}`);
        } else {
          navigate("/RePaymentFailed");
        }
      } catch (error) {
        console.error("Lỗi khi xử lý repayment:", error);
        navigate("/RePaymentFailed");
      }
    };

    fetchPaymentResult();
  }, [navigate]);

  return <p>Verifying payment...</p>;
};

export default RePaymentResult;
