import React, { useState, useRef } from "react";
import { useEffect } from "react";
import public_status_icon from "../../assets/icons/public_status_icon.svg";
import camera_icon from "../../assets/icons/camera_icon.svg";
import tag_icon from "../../assets/icons/tag_icon.svg";
import post_category_icon from "../../assets/icons/post_category_icon.svg";
import "./CreatePost.css";
import defaultAvatar from "../../assets/images/default-avatar.png";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";

const PostCreatePopup = ({ onCreatedPost, onClose, groupId }) => {
  const [withWhom, setWithWhom] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading

  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const withWhomInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [accountId, setAccountId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  //VARIABLE GỬI FORM CREATE
  const [imagesFile, setImagesFile] = useState([]);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [status, setStatus] = useState("Public");
  const [statusDropdown, setStatusDropdown] = useState(false);
  //danh sách lấy từ db
  const [listCategories, setListCategory] = useState([]);
  const [listFriends, setListFriends] = useState([]);

  const toggleStatusDropdown = () => setStatusDropdown(!statusDropdown);
  const closeStatusDropdown = () => setStatusDropdown(false);
  const handleSelectStatus = (value) => {
    setStatus(value);
    setStatusDropdown(false);
  };

  //xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Bật loading khi bắt đầu submit

    const formData = new FormData();

    //Gán dữ liệu vào form data
    // Loại bỏ hashtag (từ bắt đầu bằng #, theo regex)
    const contentWithoutHashtags = content.replace(/#\w+\s*/g, "").trim();
    formData.append("PostContent", contentWithoutHashtags);

    // Xử lý hashtags - trích xuất từ content
    const hashtags = content.match(/#\w+/g) || [];
    const cleanedHashtags = hashtags.map(tag => tag.replace('#', '')); // Loại bỏ dấu #
    cleanedHashtags.forEach((hashtag) =>
      formData.append("Hashtags", hashtag)
    );

    categories.forEach((cat) =>
      formData.append("ListCategoryOfPost", cat.categoryId)
    );
    taggedFriends.forEach((friend) =>
      formData.append("ListTagFriend", friend.accId)
    );
    imagesFile.forEach((file) => formData.append("ListImage", file));

    formData.append("Privacy", status);
    //formData.append("isInGroup", false);
    formData.append("isInGroup", groupId ? "true" : "false");

    if (groupId) {
      formData.append("GroupId", groupId);
    }

    try {
      const response = await instance.post("/api/post/create", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data", // quan trọng
        },
      });

      console.log("Response data:", response.data.data);
      console.log("Hashtags sent:", cleanedHashtags);

      if (response.status === 200) {
        toast.success("Post created successfully!");
        onCreatedPost(response.data.data);
        onClose(); // Đóng popup sau khi tạo post thành công
      }
    } catch (err) {
      console.error("Lỗi khi gửi bài viết:", err);
      toast.error("Failed to create post!");
    } finally {
      setIsLoading(false); // Tắt loading khi hoàn thành (thành công hoặc lỗi)
    }
  };

  //lấy thông tin người dùng từ storage
  useEffect(() => {
    const storedAccId =
      localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAvatarUrl =
      localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");
    const storedAccesstoken = localStorage.getItem("accessToken");
    if (storedAccId) {
      setAccountId(storedAccId);
      setAvatarUrl(storedAvatarUrl || defaultAvatar);
      setAccessToken(storedAccesstoken);
    }
  }, []);

  //GỌI API LẤY DANH SÁCH FRIEND CỦA ACCID
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await instance.get("/api/friend/list-friend", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          var listFriendDb = response.data.data;
          setListFriends(listFriendDb);
        }
      } catch (error) {
        // toast.error("Cannot get list friend!");
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    console.log("✅ list friend mới cập nhật:", listFriends);
  }, [listFriends]);

  //GỌI API LẤY CATEGORY post
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await instance.get("/api/category-post/list", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          var listCategoryDb = response.data.data;
          setListCategory(listCategoryDb);
        }
      } catch (error) {
        toast.error("Cannot get list category!");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("✅ listCategory mới cập nhật:", listCategories);
  }, [listCategories]);

  const removeCategory = (category) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const removeFriend = (friend) => {
    setTaggedFriends(taggedFriends.filter((f) => f !== friend));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesFile((prev) => prev.filter((_, i) => i !== index));
  };

  // Hàm toggle category (thêm/xóa category)
  const toggleCategory = (category) => {
    const existingCategory = categories.find((c) => c.categoryId === category.categoryId);
    if (existingCategory) {
      // Nếu đã có thì xóa
      setCategories(categories.filter((c) => c.categoryId !== category.categoryId));
    } else {
      // Nếu chưa có thì thêm
      setCategories([...categories, category]);
    }
  };

  // Hàm kiểm tra xem category có được chọn hay không
  const isCategorySelected = (category) => {
    return categories.some((c) => c.categoryId === category.categoryId);
  };

  // Hàm đóng category dropdown
  const closeCategoryDropdown = () => {
    setCategoryDropdown(false);
  };

  const handleTagFriends = () => {
    withWhomInputRef.current.focus();
  };

  const handlePhotoVideo = () => {
    fileInputRef.current.click();
  };

  // const handleFileChange = (e) => {
  //     const files = Array.from(e.target.files);
  //     const imageUrls = files.map((file) => URL.createObjectURL(file));
  //     setImages([...images, ...imageUrls]);
  //     e.target.value = ""; // Reset input file
  // };
  const handleFileChange = (e) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];

    // Lọc file ảnh hợp lệ
    const files = Array.from(e.target.files).filter(file =>
      validTypes.includes(file.type)
    );

    if (files.length === 0) {
      toast.error("Only accept image files in .jpg, .jpeg, .png, or .svg format");
      return;
    }

    setImagesFile((prev) => [...prev, ...files]);

    const fileUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...fileUrls]);

    // const files = Array.from(e.target.files);
    // setImagesFile((prev) => [...prev, ...files]);
    // const fileUrls = files.map((file) => URL.createObjectURL(file));
    // setImages((prev) => [...prev, ...fileUrls]);
  };

  const filteredFriends = (listFriends || []).filter((friend) =>
    (friend?.fullName || "")
      .toLowerCase()
      .includes((withWhom || "").toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-lg">
        <div className="header-create">
          <div className="header-left-create">
            <h2 className="">
              <i className="fa-solid fa-plus"></i> Create New Post
            </h2>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn-close-create-post"
            disabled={isLoading} // Disable khi đang loading
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 mb-4">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something about you..."
              className="flex-grow p-2 outline-none"
              disabled={isLoading} // Disable khi đang loading
            />
          </div>

          {(content.match(/#\w+/g) || []).length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-2 text-sm text-gray-500">
              Hashtag#:{" "}
              {(content.match(/#\w+/g) || []).map((tag, index) => (
                <span
                  key={index}
                  className="block max-w-full px-2 py-1 mr-1 overflow-hidden text-gray-700 truncate bg-gray-200 rounded-full cursor-help whitespace-nowrap"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
              Categories:
              {categories.map((category) => (
                <span
                  key={category.categoryId}
                  className="flex items-center px-2 py-1 text-gray-700 bg-gray-200 rounded-full"
                >
                  {category.categoryName || "Khong có"}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={isLoading} // Disable khi đang loading
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          )}

          {taggedFriends.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-gray-500">
              Tags:
              {taggedFriends.map((friend) => (
                <span
                  key={friend.accId}
                  className="flex items-center pl-2 text-sm text-white bg-gray-400 rounded"
                >
                  {friend.fullName}
                  <button
                    type="button"
                    onClick={() => removeFriend(friend)}
                    className="ml-2 bg-gray-200 hover:bg-gray-300 text-white rounded-r flex items-center justify-center px-[8px] p-[5px]"
                    disabled={isLoading} // Disable khi đang loading
                  >
                    <i className="fa-solid fa-times text-xs text-[#33B1FF]"></i>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative mb-4 text-sm">
            <i className="absolute text-gray-400 transform -translate-y-1/2 fa-solid fa-magnifying-glass left-3 top-1/2"></i>
            <input
              ref={withWhomInputRef}
              type="text"
              value={withWhom}
              onChange={(e) => setWithWhom(e.target.value)}
              placeholder="Who are you with?"
              className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-lg"
              disabled={isLoading} // Disable khi đang loading
            />
            {withWhom && (
              <button
                type="button"
                onClick={() => setWithWhom("")}
                className="absolute text-gray-500 right-2 top-2 hover:text-gray-700"
                disabled={isLoading} // Disable khi đang loading
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
            {withWhom && filteredFriends.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.accId}
                    onClick={() => {
                      if (!isLoading && !taggedFriends.includes(friend)) {
                        setTaggedFriends([...taggedFriends, friend]);
                      }
                      setWithWhom("");
                    }}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {friend.fullName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <hr />
          <div className="my-4">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="relative inline-block w-full lg:w-auto">
                <div
                  onClick={!isLoading ? toggleStatusDropdown : undefined}
                  className={`flex items-center gap-2 px-3 py-2 text-blue-500 bg-gray-100 border border-solid rounded-lg cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <img src={public_status_icon} alt="status icon" />
                  {status}
                  <i className="fa-solid fa-caret-down ml-auto"></i>
                </div>

                {statusDropdown && !isLoading && (
                  <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg">
                    <div
                      className={`p-3 cursor-pointer hover:bg-gray-100 ${status === "Public" ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                      onClick={() => handleSelectStatus("Public")}
                    >
                      Public
                    </div>
                    <div
                      className={`p-3 cursor-pointer hover:bg-gray-100 ${status === "Private" ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                      onClick={() => handleSelectStatus("Private")}
                    >
                      Private
                    </div>
                  </div>
                )}
              </div>
              <div
                onClick={!isLoading ? handlePhotoVideo : undefined}
                className={`flex items-center gap-2 px-3 py-2 text-blue-500 bg-gray-100 border border-solid rounded-lg cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <img src={camera_icon} alt="Photo/Video" /> Photo/Video
              </div>
              <div
                onClick={!isLoading ? handleTagFriends : undefined}
                className={`flex items-center gap-2 px-3 py-2 text-blue-500 bg-gray-100 border border-solid rounded-lg cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <img src={tag_icon} alt="Photo/Video" />
                Tag friends
              </div>

              <div className="relative inline-block">
                <div
                  onClick={!isLoading ? () => setCategoryDropdown(!categoryDropdown) : undefined}
                  className={`flex items-center gap-2 px-3 py-2 text-blue-500 bg-gray-100 border border-solid rounded-lg cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <img src={post_category_icon} alt="Photo/Video" />
                  Categories
                  <i className="fa-solid fa-caret-down"></i>
                </div>

                {categoryDropdown && !isLoading && (
                  <div className="absolute z-10 mt-2 w-64 bg-white border rounded-lg shadow-lg">
                    {/* Header của dropdown */}
                    <div className="flex items-center justify-between p-3 border-b">
                      <span className="font-semibold text-gray-700">Select Categories</span>
                      <button
                        type="button"
                        onClick={closeCategoryDropdown}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>

                    {/* Danh sách categories */}
                    <div className="max-h-64 overflow-y-auto">
                      {listCategories.map((cat) => (
                        <div
                          key={cat.categoryId}
                          onClick={() => toggleCategory(cat)}
                          className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${isCategorySelected(cat) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                        >
                          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${isCategorySelected(cat) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                            }`}>
                            {isCategorySelected(cat) && (
                              <i className="fa-solid fa-check text-white text-xs"></i>
                            )}
                          </div>
                          <span>{cat.categoryName}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer với nút Done */}
                    <div className="p-3 border-t">
                      <button
                        type="button"
                        onClick={closeCategoryDropdown}
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-2 lg:grid-cols-6">
            {images.slice(0, 6).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt="Post"
                  className={`w-full h-24 rounded-lg object-cover ${index === 5 && images.length > 6 ? "brightness-50" : ""
                    }`}
                />
                {index === 5 && images.length > 6 && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                    +{images.length - 6} more
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-70"
                  disabled={isLoading} // Disable khi đang loading
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              disabled={isLoading} // Disable khi đang loading
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 text-white rounded-lg transition-colors duration-200 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PUBLISHING...
              </div>
            ) : (
              'PUBLISH'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostCreatePopup;