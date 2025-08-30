import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";

const ProcessResultInput = ({ subprocessId, currentStep, onSubmit }) => {
    const [images, setImages] = useState([]);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const resultRef = useRef(null);
    
    console.log(subprocessId)

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            url: URL.createObjectURL(file),
            file,
        }));
        setImages((prevImages) => [...prevImages, ...newImages]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImageRemove = (indexToRemove) => {
        setImages((prevImages) => {
            const imageToRemove = prevImages[indexToRemove];
            URL.revokeObjectURL(imageToRemove.url);
            return prevImages.filter((_, index) => index !== indexToRemove);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentStep) {
            toast.info("Please select step to enter result!");
            return;
        }

        if (!content.trim() && images.length === 0) {
            toast.info("Please enter comment or add image!");
            return;
        }

        setIsSubmitting(true);

        // Tạo FormData
        const formData = new FormData();
        formData.append('StepId', currentStep.stepId);
        formData.append('StepResultComment', content);
        formData.append('SubprocessId', subprocessId);
        
        // Thêm hình ảnh vào FormData
        images.forEach((image, index) => {
            formData.append('Images', image.file);
        });

        const success = await onSubmit(formData);
        
        if (success) {
            // Reset form
            setContent("");
            setImages([]);
            // Revoke tất cả object URLs
            images.forEach(img => URL.revokeObjectURL(img.url));
        }

        setIsSubmitting(false);
    };

    if (!currentStep) {
        return (
            <div className="p-5 mt-5 bg-white border border-gray-200 border-solid rounded-lg shadow-xl">
                <p className="text-gray-500 text-center">Please select a step to enter the result</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Step {currentStep.stepNumber}: {currentStep.stepTitle}</h3>
                <a className="text-blue-500 hover:underline text-sm scroll-smooth">
                    VIEW LIST RESULT
                </a>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 mt-5 bg-white border border-gray-200 border-solid rounded-lg shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-800">YOUR RESULT:</h2>
                <div className="flex flex-col gap-4">
                    <div className="rich-text-editor">
                        <ReactQuill
                            value={content}
                            onChange={setContent}
                            className="h-32 mb-8 bg-white flex-left ReactQuill"
                            placeholder="Write your result..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={`Result ${index + 1}`}
                                    className="object-cover w-full h-40 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleImageRemove(index)}
                                    className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    title="Remove image"
                                >
                                    <i className="fa-solid fa-times text-xs"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-start">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <span className="inline-block px-4 py-2 transition bg-[#3DB3FB]/25 hover:bg-[#2EA3EB] text-[#3DB3FB]">
                                Add images
                            </span>
                        </label>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`py-3 px-10 ${
                                isSubmitting 
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                    : "bg-[#3DB3FB]/25 hover:bg-[#2EA3EB] text-[#3DB3FB]"
                            }`}
                        >
                            {isSubmitting ? "Submitting.." : "Continue"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProcessResultInput;