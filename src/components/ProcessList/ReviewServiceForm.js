import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuProgressFarmer from "../MenuProgressFarmer/MenuProgress";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const ReviewServiceForm = ({bookingServiceId}) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [serviceDetails, setServiceDetails] = useState({});
    const [accessToken, setAccessToken] = useState("");
    const { serviceId } = useParams(); // Lấy serviceId từ URL
    const navigate = useNavigate();

    // Lấy accessToken từ localStorage hoặc sessionStorage
    useEffect(() => {
        const storedAccesstoken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (storedAccesstoken) {
            setAccessToken(storedAccesstoken);
        }
    }, []);

    // Gọi API để lấy thông tin dịch vụ
    useEffect(() => {
        if (!accessToken || !serviceId) return;

        const fetchServiceDetails = async () => {
            try {
                const response = await instance.get(`/api/service/get-by-id/${serviceId}`);

                if (response.status === 200 && response.data.success) {
                    const serviceData = response.data.data[0];
                    setServiceDetails({
                        serviceName: serviceData.service.serviceName,
                        price: serviceData.service.price,
                        image: serviceData.service.imageUrl,
                        expertName: serviceData.provider.fullName
                    });
                } else {
                    toast.error("Failed to retrieve service details");
                }
            } catch (error) {
                console.error("Error fetching service details:", error);
                toast.error("An error occurred while fetching service details");
            }
        };

        fetchServiceDetails();
    }, [accessToken, serviceId]);

    // Xử lý gửi đánh giá
    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!accessToken || !serviceId) {
            toast.error("Missing token or serviceId");
            return;
        }

        if (rating < 1 || rating > 5) {
            toast.error("Rating must be between 1 and 5 stars");
            return;
        }

        try {
            const response = await instance.post(
                "/api/review/create",
                {
                    ServiceId: serviceId,
                    BookingServiceId: bookingServiceId,
                    Rating: rating,
                    Comment: feedback || null // Gửi null nếu không có comment
                }
            );

            if (response.status === 200 && response.data.success) {
                toast.success("Feedback submitted successfully!");
                navigate("/HomeProcessFarmer");
                setRating(0);
                setFeedback("");
            } else {
                toast.error(response.data.message || "Failed to submit feedback!");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error(error.response?.data?.message || "An error occurred while submitting feedback!");
        }
    };

    return (
        <div>
            <div className="progress-managment pt-36">
                <div className="progress-managment-container flex flex-col lg:flex-row justify-center items-center lg:items-start gap-[23px] px-2">
                    <MenuProgressFarmer inPage="booking" />
                    <div className="w-full xl:w-[831px] max-w-[831px]">
                        <div className="text-left">
                            <h1 className="py-6 font-bold text-2xl">FEEDBACK</h1>
                            <div className="flex gap-5 items-center">
                                <img
                                    className="w-96 h-48 object-cover rounded-2xl"
                                    src={serviceDetails.image || "https://itech.edu.vn/wp-content/uploads/2022/08/pasted-image-0.png"}
                                    alt=""
                                />
                                <div className="space-y-5 text-lg">
                                    <h3 className="font-bold">{serviceDetails.serviceName || "Support ReactJs tutorials"}</h3>
                                    <p>
                                        Price: <span className="font-bold text-red-500">
                                            {serviceDetails.price != null ? serviceDetails.price.toLocaleString() : "N/A"} VND
                                        </span>
                                    </p>
                                    <p>
                                        Expert: <span className="font-bold">{serviceDetails.expertName || "Unknown Expert"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form className="text-left mt-12 space-y-5" onSubmit={handleSubmitFeedback}>
                            <p>How would you rate the quality of this service? *</p>

                            {/* Đánh giá sao với Font Awesome */}
                            <div className="flex gap-2 text-xl">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        className="focus:outline-none"
                                    >
                                        <i
                                            className={`fa-solid fa-star ${
                                                star <= (hover || rating)
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        ></i>
                                    </button>
                                ))}
                            </div>

                            <p>Your feedback:</p>
                            <textarea
                                rows={7}
                                className="w-full p-3 border border-solid border-gray-300 rounded-lg"
                                placeholder="Write your feedback..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            ></textarea>

                            <button
                                type="submit"
                                className="p-4 text-white bg-[#3DB3FB] w-full font-bold rounded-lg"
                            >
                                SEND FEEDBACK
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewServiceForm;
