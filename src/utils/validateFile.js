import { toast } from "react-toastify";

// Hàm kiểm tra và xử lý file được chọn
export const handleFileSelect = ({ event, setSelectedFile }) => {
    const file = event.target.files[0];
    if (!file) return;

    // Danh sách các định dạng file được phép
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    const allowedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const inputType = event.target.accept;
    let isValid = false;

    // Kiểm tra loại file dựa trên input
    if (inputType.includes('image/*')) {
        isValid = allowedImageTypes.includes(file.type);
        if (!isValid) {
            toast.error('Only accept image files in .jpg, .jpeg, .png, or .svg format');
            event.target.value = ''; // Reset input
            return;
        }
    } else {
        isValid = allowedFileTypes.includes(file.type);
        if (!isValid) {
            toast.error('Only accept .pdf, .doc, or .docx files');
            event.target.value = ''; // Reset input
            return;
        }
    }

    // Nếu file hợp lệ, lưu thông tin file
    const fileUrl = URL.createObjectURL(file);
    setSelectedFile({
        file,
        url: fileUrl,
        name: file.name,
        type: inputType.includes('image/*') ? 'image' : 'file',
    });
};

// Hàm xóa file đã chọn
export const removeSelectedFile = ({ setSelectedFile, imageInputRef, fileInputRef }) => {
    setSelectedFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
};