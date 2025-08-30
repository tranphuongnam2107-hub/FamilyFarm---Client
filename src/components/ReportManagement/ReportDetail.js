import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import defaultAvatar from "../../assets/images/default-avatar.png";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // Thêm SweetAlert2

const ReportDetail = () => {
    const { reportId } = useParams(); // Lấy reportId từ URL
    const navigate = useNavigate(); // Để điều hướng sau khi xử lý
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false); // Trạng thái cho hành động Accept/Reject
    const [actionError, setActionError] = useState(null); // Lỗi cho hành động Accept/Reject

    // Gọi API để lấy chi tiết báo cáo
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const response = await instance.get(`/api/report/get-by-id/${reportId}`);
                console.log("API Response:", response.data);

                if (!response.data || !response.data.data) {
                    throw new Error("API response is empty or missing 'data' property");
                }

                setReportData(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error("API Error:", {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                });
                setError(`Failed to fetch report: ${err.message}`);
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    // Hàm xử lý Accept với xác nhận
    const handleAccept = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to accept this report?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3DB3FB",
            cancelButtonColor: "#EF3E36",
            confirmButtonText: "Yes, accept it!",
            cancelButtonText: "No, cancel",
        });

        if (result.isConfirmed) {
            try {
                setActionLoading(true);
                setActionError(null);
                const response = await instance.put(`/api/report/accept/${reportId}`);
                console.log("Accept Response:", response.data);

                if (response.status === 200) {
                    toast.success(response.data.message || "Report accepted successfully!");
                    navigate("/ReportManagement"); // Điều hướng về danh sách báo cáo
                } else {
                    throw new Error(response.data.message || "Failed to accept report");
                }
            } catch (err) {
                console.error("Accept Error:", {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                });
                setActionError(`Failed to accept report: ${err.message}`);
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Hàm xử lý Reject với xác nhận
    const handleReject = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to reject this report?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3DB3FB",
            cancelButtonColor: "#EF3E36",
            confirmButtonText: "Yes, reject it!",
            cancelButtonText: "No, cancel",
        });

        if (result.isConfirmed) {
            try {
                setActionLoading(true);
                setActionError(null);
                const response = await instance.put(`/api/report/reject/${reportId}`);
                console.log("Reject Response:", response.data);

                if (response.status === 200) {
                    toast.success(response.data.message || "Report rejected successfully!");
                    navigate("/ReportManagement"); // Điều hướng về danh sách báo cáo
                } else {
                    throw new Error(response.data.message || "Failed to reject report");
                }
            } catch (err) {
                console.error("Reject Error:", {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                });
                setActionError(`Failed to reject report: ${err.message}`);
            } finally {
                setActionLoading(false);
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    // Dữ liệu từ API
    const report = reportData?.report;
    const reporter = reportData?.reporter;
    const post = reportData?.post?.post;
    const postImages = reportData?.post?.postImages || [];
    const hashTags = reportData?.post?.hashTags || [];
    const postCategories = reportData?.post?.postCategories || [];
    const postTags = reportData?.post?.postTags || [];

    return (
        <>
            <div className="bg-[#E6F0FA] p-4 mb-6 rounded-lg text-[#3E3F5E] text-left">
                {report?.reason || "No reason provided"}
                {actionError && <div className="text-red-500 mt-2">{actionError}</div>}
                <div className="flex mt-4 gap-3">
                    <button
                        className="bg-[#EF3E36] text-white px-4 py-2 rounded mr-2 hover:bg-red-600 w-24 disabled:bg-gray-400"
                        onClick={handleReject}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Processing..." : "Reject"}
                    </button>
                    <button
                        className="bg-[#3DB3FB] text-white px-4 py-2 rounded hover:bg-blue-600 w-24 disabled:bg-gray-400"
                        onClick={handleAccept}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Processing..." : "Accept"}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                    <img
                        src={reporter?.avatar || defaultAvatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#3E3F5E]">
                        {reporter?.fullName || "Unknown"} -{" "}
                        <span className="p-2 bg-[#3DB3FB]/25 text-[#3DB3FB]">Farmer</span>
                    </span>
                    <span className="text-gray-500">posted a post with the following content:</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col gap-4 text-[#3E3F5E]">
                    <div className="flex">
                        <div className="font-semibold text-left min-w-80">Content:</div>
                        <div className="font-normal">{post?.postContent || "No content available"}</div>
                    </div>

                    <div className="flex">
                        <div className="font-semibold text-left min-w-80">Hashtags:</div>
                        <div className="text-[#3DB3FB]">
                            {hashTags.length > 0
                                ? hashTags.map((tag) => `#${tag.hashTagContent}`).join(" ")
                                : "No hashtags"}
                        </div>
                    </div>

                    <div className="flex">
                        <div className="font-semibold text-left min-w-80">Category:</div>
                        <div className="font-normal">
                            {postCategories.length > 0
                                ? postCategories.map((cat) => cat.categoryName).join(", ")
                                : "No categories"}
                        </div>
                    </div>

                    <div className="flex">
                        <div className="font-semibold text-left min-w-80">Tag users:</div>
                        <div className="font-normal">
                            {postTags.length > 0
                                ? postTags.map((tag) => tag.username).join(", ")
                                : "No tagged users"}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="font-semibold text-left min-w-80">Images:</div>
                        <div className="flex flex-wrap gap-4">
                            {postImages.length > 0 ? (
                                postImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <img
                                            src={image.imageUrl}
                                            alt={`${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div>No images available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportDetail;