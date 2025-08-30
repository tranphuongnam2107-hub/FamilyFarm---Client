import React, { useState, useEffect } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { handleFileSelect } from '../../utils/validateFile';

const CreateServiceForm = () => {
    const navigate = useNavigate();
    const [serviceName, setServiceName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [publish, setPublish] = useState(false);
    const [categoryList, setCategoryList] = useState([]);
    const [errors, setErrors] = useState({});

    // const handleImageChange = (e) => {
    //     const file = e.target.files[0];
    //     setImage(file);
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setPreview(reader.result);
    //         };
    //         reader.readAsDataURL(file);
    //     } else {
    //         setPreview(null);
    //     }
    // };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra file hình ảnh
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
            if (!allowedImageTypes.includes(file.type)) {
                // Hiển thị toast thông báo lỗi nếu file không hợp lệ
                toast.error("Only accept image files in .jpg, .jpeg, .png, or .svg format");
                return; // Dừng lại nếu file không hợp lệ
            }

            // Nếu file hợp lệ, lưu vào state
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result); // Hiển thị preview
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
            setImage(null);
        }
    };
    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
    };

    // Load category từ API
    useEffect(() => {
        const fetchCategories = async () => {
        try {
            const res = await instance.get("/api/category-service/all");
            const wrappedData = res.data.data || [];
            const categories = wrappedData
                .map(item => item.categoryService) // bóc tách ra đúng object
                .filter(Boolean); // loại bỏ null

            setCategoryList(categories); // lưu vào state
            } catch (err) {
            console.error("Lỗi khi lấy category services:", err);
            }
        };
        fetchCategories();
    }, []);

    // ✅ Validate dữ liệu đầu vào
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
        if (!image) newErrors.image = "Image is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Validate dữ liệu đầu vào
    // const validate = () => {
    //     const newErrors = {};
    //     if (!serviceName.trim()) newErrors.serviceName = "Service name is required.";
    //     if (!category) newErrors.category = "Category is required.";
    //     if (!price) {
    //         newErrors.price = "Price is required.";
    //     } else if (isNaN(price)) {
    //         newErrors.price = "Price must be a number.";
    //     } else if (Number(price) <= 0) {
    //         newErrors.price = "Price must be a positive number.";
    //     }
    //     if (!description.trim()) newErrors.description = "Description is required.";
        
    //     // Validate hình ảnh
    //     if (!image) {
    //         newErrors.image = "Image is required.";
    //     } else {
    //         // Kiểm tra thêm định dạng file nếu cần
    //         const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    //         if (!allowedImageTypes.includes(image.type)) {
    //             newErrors.image = "Only image files (.jpeg, .jpg, .png, .svg) are allowed.";
    //             // toast.error('Only accept image files in .jpg, .jpeg, .png, or .svg format');
    //         }
    //     }

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };


    // ✅ Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const providerId = localStorage.getItem("accId");

        const formData = new FormData();
        console.log("Test status", publish);
        formData.append("ProviderId", providerId);
        formData.append("ServiceName", serviceName);
        formData.append("CategoryServiceId", category);
        formData.append("Price", parseFloat(price));
        formData.append("ServiceDescription", description);
        formData.append("Status", publish ? 1 : 0);
        formData.append("AverageRate", 0);
        formData.append("RateCount", 0);
        if (image) formData.append("ImageUrl", image);

        console.log("=== FormData preview ===");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        try {
            const res = await instance.post("/api/service/create", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            // alert("✅ Service created successfully!");
            toast.success("SERVICE CREATED SUCCESSFULLY!");
            console.log("data ne", res.data);

            const serviceId = res.data?.data?.[0]?.service?.serviceId;

            const createdService = res.data?.data?.[0]?.service;
            // const serviceId = createdService?.serviceId;
            const status = createdService?.status; // 0/1

            // navigate(`/CreateStepPage/${serviceId}`);
            navigate(`/CreateStepPage/${serviceId}`, {
                state: { status } // 👈 truyền kèm status sang trang kế
            });

            // Reset form
            setServiceName("");
            setCategory("");
            setPrice("");
            setDescription("");
            setImage(null);
            setPreview(null);
            setPublish(false);
            setErrors({});
        } catch (err) {
            console.error("❌ Error creating service:", err.response?.data || err);
            // alert("❌ Failed to create service: " + (err.response?.data?.message || "Unknown error"));
            toast.error("Failed to create service.");
        }
    };

    return (
        // <div className="p-6 bg-white shadow-xl rounded-lg text-left border border-solid border-gray-200">
        <div className="self-start p-6 bg-white shadow-xl rounded-lg text-left border border-solid border-gray-200 h-auto">
            <h2 className="text-xl font-semibold mb-2 text-[#3DB3FB]">Create New Service</h2>
            <hr />
            <form onSubmit={handleSubmit} className="space-y-4 mt-10">
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Service name</label>
                    <input type="text"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Name or Title"
                        className="w-full p-3 border rounded-lg"/>
                    {errors.serviceName && <p className="text-red-500 text-sm">{errors.serviceName}</p>}
                </div>
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block mb-2 font-medium text-gray-700">Category</label>
                        {/* <select value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border rounded-lg">
                            <option value="">Service Category</option>
                            <option value="category1">Category 1</option>
                            <option value="category2">Category 2</option>
                        </select> */}
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
                            className="w-full p-3 border rounded-lg"/>
                        <span className="transform font-bold text-red-500">VND</span>
                        </div>
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                    </div>
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Description</label>
                    <textarea value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description..."
                        className="w-full p-3 border rounded-lg h-24"/>
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Image</label>
                    <input type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageUpload"/>
                    {preview ? (
                        <div className="relative w-full h-[250px] border rounded bg-gray-50">
                            <img src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded"/>
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
                <div className="flex items-center py-5 gap-4">
                    <input type="checkbox"
                        checked={publish}
                        onChange={(e) => setPublish(e.target.checked)}
                        className="h-4 w-4" />
                    <label className="font-medium text-gray-700">Do you want to publish this service?</label>
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-xl w-1/4 font-bold">
                        CREATE
                    </button>
                    <button type="reset" className="p-2 rounded-xl w-1/4 font-bold border border-solid border-black"
                        onClick={() => {
                            setServiceName("");
                            setCategory("");
                            setPrice("");
                            setDescription("");
                            setImage(null);
                            setPreview(null);
                            setPublish(false);
                            setErrors({});
                        }}
                    >
                        RESET
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateServiceForm;