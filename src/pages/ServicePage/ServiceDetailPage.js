import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import ServiceDetailCard from "../../components/Services/ServiceDetailCard";
import FeedbackSummary from "../../components/Services/FeedbackSummary";
import FeedbackList from "../../components/Services/FeedbackList";
import PopularService from "../../components/Services/PopularService";

const ServiceDetailPage = () => {
    const { id } = useParams();
    const [serviceData, setServiceData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState("");

    // Lấy accessToken từ localStorage hoặc sessionStorage
    useEffect(() => {
        const storedAccesstoken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        if (storedAccesstoken) {
            setAccessToken(storedAccesstoken);
        }
    }, []);

    // Gọi các API
    useEffect(() => {
        if (!accessToken || !id) return;

        const fetchServiceData = async () => {
            try {
                // Lấy thông tin dịch vụ
                const serviceRes = await instance.get(`/api/service/get-detail-by-id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (serviceRes.data?.success && serviceRes.data.data) {
                    setServiceData(serviceRes.data.data);
                } else {
                    toast.error("Không thể lấy thông tin dịch vụ");
                }

                // Lấy danh sách đánh giá
                const reviewsRes = await instance.get(`/api/review/get-by-service/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (reviewsRes.data?.success && reviewsRes.data.data) {
                    setReviews(reviewsRes.data.data);
                } else {
                    toast.error("Không thể lấy danh sách đánh giá");
                }

                // Lấy tóm tắt đánh giá
                const summaryRes = await instance.get(`/api/review/summary/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (summaryRes.data?.success && summaryRes.data.averageRating != null) {
                    setSummary(summaryRes.data);
                } else {
                    // Gán giá trị mặc định nếu API không trả về dữ liệu hợp lệ
                    setSummary({
                        averageRating: 0,
                        ratingCounts: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
                    });
                    toast.warn("Chưa có đánh giá nào cho dịch vụ này");
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
                // Gán giá trị mặc định cho summary nếu có lỗi
                setSummary({
                    averageRating: 0,
                    ratingCounts: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [id, accessToken]);

    if (loading) return <p className="pt-24 text-center">Loading data...</p>;
    if (!serviceData) return <p className="pt-24 text-center">No service found</p>;

    return (
        <div className="ServicePage">
            <Header />
            <NavbarHeader />
            <div className="mx-auto max-w-7xl lg:pt-[140px] pt-[65px] text-left">
                <ServiceDetailCard data={serviceData} summary={summary} />
                <div className="grid lg:grid-cols-[3fr_2fr] gap-5">
                    <div className="gap-5">
                        <FeedbackSummary summary={summary} />
                        <FeedbackList reviews={reviews} />
                    </div>
                    <div className="hidden pt-6 lg:block">
                        <PopularService />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;