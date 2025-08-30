import instance from "../Axios/axiosConfig";

export const getOwnProfile = async () => {
  try {
    const response = await instance.get('/api/account/own-profile');
    return response.data;
  } catch (error) {
    // Xử lý lỗi, ví dụ trả về null hoặc một đối tượng lỗi tùy chỉnh
    if (error.message === "Network Error") {
      return;
    }
    // Xử lý các lỗi khác (nếu cần)
    return { error: error.message || "Đã xảy ra lỗi khi lấy thông tin hồ sơ." };
  }
};