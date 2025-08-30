// import React, { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import axios from "axios";

// const PaymentCallback = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const bookingId = searchParams.get("vnp_TxnRef");

//   useEffect(() => {
//     const verifyPayment = async () => {
//       if (!bookingId) {
//         navigate("/PaymentFailed");
//         return;
//       }

//       try {
//         const res = await axios.get(`https://localhost:5001/api/booking-service/${bookingId}`);
//         const isPaid = res.data?.isPaidByFarmer;

//         if (isPaid === true) {
//           navigate("/HomeProcessFarmer");
//         } else {
//           navigate("/PaymentFailed");
//         }
//       } catch (err) {
//         console.error("Error verifying payment", err);
//         navigate("/PaymentFailed");
//       }
//     };

//     verifyPayment();
//   }, [bookingId, navigate]);

//   return <p>🔄 Đang xác minh thanh toán...</p>;
// };

// export default PaymentCallback;


import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = window.location.search;
        const response = await axios.get(
          `https://localhost:5001/api/payment/vnpay-return${urlParams}`
        );

        if (response.data.success) {
          navigate("/HomeProcessFarmer");
        } else {
          navigate("/PaymentFailed");
        }
      } catch (error) {
        console.error("Error verifying payment", error);
        navigate("/PaymentFailed");
      }
    };

    verifyPayment();
  }, [navigate]);

  return <div>Đang xác minh thanh toán từ VNPay...</div>;
};

export default PaymentCallback;
