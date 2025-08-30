import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditServiceForm = () => {
    const { id } = useParams(); // serviceId từ URL
    const navigate = useNavigate();

    const [serviceName, setServiceName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [categoryList, setCategoryList] = useState([]);

    // Các giá trị cần giữ lại để gửi lại
    const [status, setStatus] = useState(1);
    const [averageRate, setAverageRate] = useState(0);
    const [rateCount, setRateCount] = useState(0);
    const [providerId, setProviderId] = useState("");

    useEffect(() => {
        // Lấy danh sách category
        const fetchCategories = async () => {
            try {
                const res = await instance.get("/api/category-service/all");
                const wrappedData = res.data.data || [];
                const categories = wrappedData
                    .map(item => item.categoryService) // bóc tách ra đúng object
                    .filter(Boolean); // loại bỏ null

                setCategoryList(categories); // lưu vào state
            } catch (err) {
                console.error("Lỗi khi lấy danh sách category:", err);
            }
        };

        // Lấy thông tin dịch vụ cần chỉnh sửa
        const fetchService = async () => {
            try {
                const res = await instance.get(`/api/service/get-by-id/${id}`);
                const getService = res.data.data;
                const serviceOnly = getService
                    .map(item => item.service) // bóc tách ra đúng object
                    .filter(Boolean)[0];

                console.log("Service để chỉnh sửa:", serviceOnly);

                if (serviceOnly) {
                    setServiceName(serviceOnly.serviceName);
                    setCategory(serviceOnly.categoryServiceId);
                    setPrice(serviceOnly.price);
                    setDescription(serviceOnly.serviceDescription);
                    setPreview(serviceOnly.imageUrl); // nếu có image

                    setStatus(serviceOnly.status);
                    setAverageRate(serviceOnly.averageRate);
                    setRateCount(serviceOnly.rateCount);
                    setProviderId(serviceOnly.providerId);
                }
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu dịch vụ:", err);
            }
        };

        fetchCategories();
        fetchService();
    }, [id]);

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     setImage(file);
    //     setPreview(URL.createObjectURL(file));
    // };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        // Các điều kiện validate file hình ảnh
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];

        if (file) {
            if (!allowedImageTypes.includes(file.type)) {
                toast.error("Only accept image files in .jpg, .jpeg, .png, or .svg format");
                return; // Dừng nếu file không hợp lệ
            }

            // Nếu file hợp lệ, cập nhật state
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Tạo preview của ảnh
        } else {
            setImage(null);
            setPreview(null);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!serviceName.trim()) newErrors.serviceName = "Service name is required.";
        if (!category) newErrors.category = "Category is required.";
        // if (!price || isNaN(price) || price <= 0) newErrors.price = "Valid price is required.";
        if (!price) {
            newErrors.price = "Price is required.";
        } else if (isNaN(price)) {
            newErrors.price = "Price must be a number.";
        } else if (Number(price) <= 0) {
            newErrors.price = "Price must be a positive number.";
        }
        if (!description.trim()) newErrors.description = "Description is required.";
        if (!preview) newErrors.image = "Image is required."; // ✅ validate hình ảnh
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        formData.append("ProviderId", providerId);
        formData.append("ServiceName", serviceName);
        formData.append("CategoryServiceId", category);
        formData.append("Price", parseFloat(price));
        formData.append("ServiceDescription", description);
        formData.append("Status", status);
        formData.append("AverageRate", averageRate);
        formData.append("RateCount", rateCount);

        if (image) {
            formData.append("ImageUrl", image);
        } else {
            formData.append("ImageUrl", preview);
        }

        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            await instance.put(`/api/service/update/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("SERVICE UPDATED SUCCESSFULLY!");
            navigate("/ServiceManagement");
        } catch (err) {
            console.error("Cập nhật thất bại:", err);
            console.error("Chi tiết lỗi:", err.response?.data || err.message); // ✅ thêm dòng này
            // alert("Failed to update service.");
            toast.error("Failed to update service.");
        }
    };

    return (
        // <div className="p-6 bg-white shadow-xl rounded-lg text-left border border-solid border-gray-200 h-auto">
        <div className="self-start p-6 bg-white shadow-xl rounded-lg text-left border border-solid border-gray-200 h-auto">
            <h2 className="text-xl font-semibold mb-2 text-[#3DB3FB]">Edit Service</h2>
            <hr />
            <form onSubmit={handleSubmit} className="space-y-4 mt-10">
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Service name</label>
                    <input type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Name or Title"
                        className="w-full p-3 border rounded-lg" />
                    {errors.serviceName && <p className="text-red-500 text-sm">{errors.serviceName}</p>}
                </div>
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block mb-2 font-medium text-gray-700">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-lg">
                            <option value="">Service Category</option>
                            {categoryList.map((cat) => (
                                <option key={cat.categoryServiceId} value={cat.categoryServiceId}>
                                    {cat.categoryName}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                    </div>
                    <div className="w-1/2">
                        <label className="block mb-2 font-medium text-gray-700">Price</label>
                        <div className="flex items-center gap-4">
                            <input type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Price"
                                className="w-full p-3 border rounded-lg" />
                            <span className="transform font-bold text-red-500">VND</span>
                            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Description</label>
                    <textarea value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description..."
                        className="w-full p-3 border rounded-lg h-24" />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Image</label>
                    <input type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload" />
                    {preview ? (
                        <div className="relative w-full h-[250px] border rounded bg-gray-50">
                            <img src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded" />
                            <button onClick={handleRemoveImage}
                                className="absolute top-1 right-1 rounded-full w-6 h-6 flex items-center justify-center" >
                                <i className="fas fa-window-close"></i>
                            </button>
                        </div>
                    ) : (
                        <label htmlFor="imageUpload"
                            className="w-full h-[250px] p-2 border rounded-lg cursor-pointer text-blue-500 text-sm bg-gray-50 text-center flex items-center justify-center">
                            Click to upload Image Service
                        </label>
                    )}
                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-xl w-1/4 font-bold">
                        UPDATE
                    </button>
                    <button type="button" onClick={() => navigate("/ServiceManagement")} className="p-2 rounded-xl w-1/4 font-bold border border-black">CANCEL</button>
                </div>
            </form>
        </div>
    );
};

export default EditServiceForm;