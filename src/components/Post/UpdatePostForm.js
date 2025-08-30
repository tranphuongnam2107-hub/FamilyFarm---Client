import React, { useRef, useEffect, useState } from "react";
import defaultAvatar from '../../assets/images/default-avatar.png';
import namHashtag from "../../assets/icons/nam_hashtag.svg";
import namCategory from "../../assets/icons/nam_categoryPost.svg";
import namTagFriend from "../../assets/icons/nam_userTag.svg";
import namImage from "../../assets/icons/nam_image.svg";
import camera_icon from "../../assets/icons/camera_icon.svg";
import "./UpdatePost.css"
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";

const UpdatePostForm = ({ postId }) => {
    const [accoutId, setAccountId] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const navigate = useNavigate();

    //THÔNG TIN DỮ LIỆU POST CŨ
    const [oldPost, setOldPost] = useState({});
    const [oldCategories, setOldCategories] = useState([]);
    const [oldHashtags, setOldHashtags] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [oldTagFriends, setOldTagFriends] = useState([]);

    //Thông tin mới khi submit update
    const [postContent, setPostContent] = useState("");
    const [postScope, setPostScope] = useState("Public");

    const [newCategories, setNewCategories] = useState([]);
    const [deleteCategories, setDeleteCategories] = useState([]);

    const [newHashtag, setNewHashtag] = useState([]);
    const [deleteHashtags, setDeleteHashtags] = useState([]);

    const [newTagFriends, setNewTagFriends] = useState([]);
    const [deleteTagFriends, setDeleteTagFriend] = useState([]);

    const [newImages, setNewImages] = useState([]);
    const [deleteImages, setDeleteImages] = useState([]);

    //Bien dung de lay danh sach all category va friends cua accId
    const [listCategories, setListCategory] = useState([]);
    const [listFriends, setListFriends] = useState([]);
    const [categoryDropdown, setCategoryDropdown] = useState(false);
    const withWhomInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [withWhom, setWithWhom] = useState("");
    const [images, setImages] = useState([]);
    const [newHashtagInput, setNewHashtagInput] = useState("");

    //xử lý khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        //Gán dữ liệu vào form data
        formData.append("PostId", postId)
        formData.append("Content", postContent);
        formData.append("Privacy", postScope);

        // Thêm ảnh mới
        newImages.forEach((file) => {
            formData.append("ImagesToAdd", file);
        });
        // Thêm ảnh cần xoá
        deleteImages.forEach((imageId) => {
            formData.append("ImagesToRemove", imageId);
        });

        // Thêm Hashtag mới
        newHashtag.forEach((hashtag) => {
            formData.append("HashTagToAdd", hashtag);
        });
        // Thêm Hashtag cần xoá
        deleteHashtags.forEach((hashtagId) => {
            formData.append("HashTagToRemove", hashtagId);
        });

        // Thêm Category mới
        newCategories.forEach((category) => {
            formData.append("CategoriesToAdd", category.categoryId);
        });
        // Thêm Category cần xoá
        deleteCategories.forEach((categoryPostId) => {
            formData.append("CategoriesToRemove", categoryPostId);
        });

        // Thêm TagFriend mới
        newTagFriends.forEach((friend) => {
            formData.append("PostTagsToAdd", friend.accId);
        });
        // Thêm TagFriend cần xoá
        deleteTagFriends.forEach((friendId) => {
            formData.append("PostTagsToRemove", friendId);
        });

        try {
            const response = await instance.put('/api/post/update', formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data' // quan trọng
                }
            });

            console.log(response.data.message)

            if (response.status === 200) {
                toast.success(response.data.message);
                navigate(`/PersonalPage/${accoutId}`)
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật bài viết:", err);
        }
    };

    //Goi api lay danh sach all category post
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await instance.get('/api/category-post/list', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
                if (response.status === 200) {
                    var listCategoryDb = response.data.data;
                    setListCategory(listCategoryDb);
                }
            } catch (error) {
                console.log("Cannot fetch api get category with error: " + error)
            }
        }

        fetchCategories();
    }, [])

    //Goi api lay danh sach friend cua accId
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await instance.get('/api/friend/list-friend', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                if (response.status === 200) {
                    var listFriendDb = response.data.data;
                    setListFriends(listFriendDb);
                }
            } catch (error) {
                console.log("Cannot fetch api get friend with error: " + error)
            }
        }

        fetchFriends()
    }, [])

    //lấy thông tin người dùng từ storage
    useEffect(() => {
        const storedAccId = localStorage.getItem("accId") || sessionStorage.getItem("accId");
        const storedAvatarUrl = localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");
        const storedAccesstoken = localStorage.getItem("accessToken");
        if (storedAccId) {
            setAccountId(storedAccId);
            setAvatarUrl(storedAvatarUrl || defaultAvatar);
            setAccessToken(storedAccesstoken);
        }
    }, []);

    //GỌI API LẤY THÔNG TIN POST DỰA VÀO POST ID
    useEffect(() => {
        const fetchOldPost = async () => {
            try {
                const response = await instance.get(`/api/post/get-by-id/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                if (response.status === 200) {
                    //set dữ liệu cũ vào các biến
                    setOldPost(response.data.data.post);
                    setOldCategories(response.data.data.postCategories);
                    setOldHashtags(response.data.data.hashTags);
                    setOldImages(response.data.data.postImages);
                    setOldTagFriends(response.data.data.postTags);

                    console.log(response.data.data)
                }
            } catch (error) {
                toast.error("Cannot load data from server!")
            }
        }

        fetchOldPost();
    }, [])

    //CAC METHOD CAN THIET
    const addCategory = (category) => {
        // Tránh thêm trùng ID
        if (!newCategories.find((c) => c.categoryId === category.categoryId)) {
            setNewCategories([...newCategories, category]); // ✅ Lưu object
        }
        setCategoryDropdown(false);
    };

    const removeNewCategory = (category) => {
        setNewCategories(newCategories.filter((c) => c !== category));
    };

    const addDeleteCategory = (category) => {
        setDeleteCategories(prev => [...prev, category.categoryPostId]);

        // Xoá item ra khỏi oldCategories dựa vào categoryId
        setOldCategories(prev => prev.filter(item => item.categoryId !== category.categoryId));
    };

    const filteredFriends = (listFriends || []).filter((friend) =>
        (friend?.fullName || "").toLowerCase().includes((withWhom || "").toLowerCase())
    );

    const removeFriend = (friend) => {
        setNewTagFriends(newTagFriends.filter((f) => f !== friend));
    };

    const addDeleteTagFriend = (tag) => {
        // Thêm postTagId vào danh sách xoá
        setDeleteTagFriend(prev => [...prev, tag.postTagId])

        // Xoá tag friend ra khỏi danh sách hiển thị
        setOldTagFriends(prev => prev.filter(item => item.postTagId !== tag.postTagId));
    }

    const handlePhotoVideo = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        const fileUrls = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...fileUrls]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const addDeleteImages = (image) => {
        // Thêm postImageId vào danh sách deleteImages
        setDeleteImages(prev => [...prev, image.postImageId]);

        // Xoá ảnh ra khỏi oldImages để không hiển thị nữa
        setOldImages(prev => prev.filter(item => item.postImageId !== image.postImageId));
    };

    const removeOldHashtag = (hashtag) => {
        // Thêm hashTagId vào danh sách deleteHashtag
        setDeleteHashtags(prev => [...prev, hashtag.hashTagId]);

        // Xoá hashtag ra khỏi danh sách oldHashtags
        setOldHashtags(prev => prev.filter(item => item.hashTagId !== hashtag.hashTagId));
    };

    const handleOnchangeHashtag = (e) => {
        const input = e.target.value;
        setNewHashtagInput(input);

        // Tách hashtags ngay sau mỗi lần nhập
        const hashtags = input
            .split('#')
            .map(tag => tag.trim())
            .filter(tag => tag !== "");

        setNewHashtag(hashtags);
    }

    useEffect(() => {
        if (oldPost?.postContent) {
            setPostContent(oldPost.postContent);
        }
    }, [oldPost]);

    return (
        <div className="update-post-form">
            <h1 className="title-update-post">Update Post</h1>

            <form onSubmit={handleSubmit}>
                {/* CONTENT  */}
                <div className="content-wrapper">
                    <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full" />

                    <textarea value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Write something about you..."
                        className="flex-grow p-2 outline-none content-post" />
                </div>

                {/* SCOPE  */}
                <div className="scope-post">
                    <select value={oldPost.postScope}
                        onChange={(e) => setPostScope(e.target.value)}
                        className="select-scope appearance-none" >
                        <option className="select-scope-item" value="Public">Public</option>
                        <option className="select-scope-item" value="Private">Private</option>
                    </select>
                </div>

                {/* HASHTAG  */}
                <div className="hastag-wrapper">
                    <p className="title-item-update">
                        <img src={namHashtag} alt="hashtag" />
                        <span>Hashtag</span>
                    </p>

                    <div>
                        <div className="new-hastag">
                            <div className="top-new-hashtag">
                                <p className="title-item-update">New hashtag:</p>
                                <input className="input-new-hastag"
                                    placeholder="Enter as follows: #hashtag1 #hashtag2"
                                    value={newHashtagInput}
                                    onChange={handleOnchangeHashtag} />
                            </div>
                            <div className="new-hashtag-items">
                                {newHashtag.map((tag, index) => (
                                    <span key={index}
                                        className="flex items-center px-2 py-1 text-gray-700 bg-gray-200 rounded-full">
                                        {tag}
                                    </span>
                                ))}

                            </div>
                        </div>
                        <div className="old-hastag">
                            <p className="title-item-update">Old hashtag:</p>
                            <div className="old-hashtag-item">

                                {oldHashtags && oldHashtags.length > 0 && (
                                    oldHashtags.map((hashtag) => (
                                        <span key={hashtag.hashTagId} className="flex items-center px-2 py-1 text-gray-700 bg-gray-200 rounded-full">
                                            {hashtag.hashTagContent || "Khong có"}
                                            <button
                                                type="button"
                                                onClick={() => removeOldHashtag(hashtag)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </span>
                                    ))
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* CATEGORY  */}
                <div className="category-wrapper">
                    <p className="title-item-update">
                        <img src={namCategory} alt="category" />
                        <span>Category</span>
                    </p>

                    <div>
                        <div className="new-category relative inline-block">
                            <div
                                onClick={() => setCategoryDropdown(!categoryDropdown)}
                                className="flex items-center gap-2 px-3 py-2 text-black-500 bg-gray-100 border border-solid rounded-lg cursor-pointer"
                            >
                                <img src={namCategory} alt="category" /> Categories{" "}
                                <i className="fa-solid fa-caret-down"></i>
                            </div>

                            {categoryDropdown && (
                                <div style={{ display: "flex", flexDirection: "column" }} className="absolute z-10 top-7 mt-2 w-full text-left bg-white border rounded-lg">
                                    {listCategories.map((cat) => (
                                        <div
                                            key={cat.categoryId}
                                            onClick={() => {
                                                addCategory(cat);
                                                setCategoryDropdown(false); // Đóng dropdown sau khi chọn
                                            }}
                                            className="p-2 text-black rounded cursor-pointer hover:bg-gray-100"
                                        >
                                            {cat.categoryName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="old-category">
                            <p className="title-item-update">New category:</p>
                            <div className="old-hashtag-item">
                                {newCategories && newCategories.length > 0 && (
                                    newCategories.map((category) => (
                                        <span key={category.categoryId} className="flex items-center px-2 py-1 text-gray-700 bg-gray-200 rounded-full">
                                            {category.categoryName || "Unknown"}
                                            <button
                                                type="button"
                                                onClick={() => removeNewCategory(category)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="old-category">
                            <p className="title-item-update">Old category:</p>
                            <div className="old-hashtag-item">
                                {oldCategories && oldCategories.length > 0 && (
                                    oldCategories.map((category) => (
                                        <span key={category.categoryPostId} className="flex items-center px-2 py-1 text-gray-700 bg-gray-200 rounded-full">
                                            {category.categoryName || "Unknown"}
                                            <button
                                                type="button"
                                                onClick={() => addDeleteCategory(category)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </span>
                                    ))
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Tag friend  */}
                <div className="tag-friend-wrapper">
                    <p className="title-item-update">
                        <img src={namTagFriend} alt="tag friend" />
                        <span>Tag friend</span>
                    </p>

                    <div>
                        <div className="relative mb-4 text-sm input-tag-friend">
                            <i className="absolute text-gray-400 transform -translate-y-1/2 fa-solid fa-magnifying-glass left-3 top-1/2"></i>
                            <input
                                ref={withWhomInputRef}
                                type="text"
                                value={withWhom}
                                onChange={(e) => setWithWhom(e.target.value)}
                                placeholder="Who are you with?"
                                className="w-full py-2 pl-10 pr-8 border border-gray-300 rounded-lg" />
                            {withWhom && (
                                <button type="button"
                                    onClick={() => setWithWhom("")}
                                    className="absolute text-gray-500 right-2 top-2 hover:text-gray-700">
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            )}
                            {withWhom && filteredFriends.length > 0 && (
                                <div className="absolute top-9 z-10 w-full mt-1 bg-white border rounded-lg">
                                    {filteredFriends.map((friend) => (
                                        <div key={friend.accId}
                                            onClick={() => {
                                                if (!newTagFriends.includes(friend)) {
                                                    setNewTagFriends([...newTagFriends, friend]);
                                                }
                                                setWithWhom("");
                                            }}
                                            className="p-2 cursor-pointer bg-slate-400 hover:bg-gray-200">
                                            {friend.fullName}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="new-tag-friend">
                            <p className="title-item-update">New tags:</p>
                            <div className="new-tag-item">
                                {newTagFriends && newTagFriends.length > 0 && (
                                    newTagFriends.map((friend) => (
                                        <span key={friend.accId}
                                            className="flex items-center pl-2 text-sm text-white bg-gray-400 rounded">
                                            {friend.fullName}
                                            <button type="button"
                                                onClick={() => removeFriend(friend)}
                                                className="ml-2 bg-gray-200 hover:bg-gray-300 text-white rounded-r flex items-center justify-center px-[8px] p-[5px]">
                                                <i className="fa-solid fa-times text-xs text-[#33B1FF]"></i>
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="old-tag-friend">
                            <p className="title-item-update">Old tags:</p>
                            <div className="old-tag-item">
                                {oldTagFriends && oldTagFriends.length > 0 && (
                                    oldTagFriends.map((tagFriend) => (
                                        <span key={tagFriend.postTagId}
                                            className="flex items-center pl-2 text-sm text-white bg-gray-400 rounded">
                                            {tagFriend.fullname || "Unknown"}
                                            <button type="button"
                                                onClick={() => addDeleteTagFriend(tagFriend)}
                                                className="ml-2 bg-gray-200 hover:bg-gray-300 text-white rounded-r flex items-center justify-center px-[8px] p-[5px]">
                                                <i className="fa-solid fa-times text-xs text-[#33B1FF]"></i>
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* IMAGE  */}
                <div className="image-post-wrapper">
                    <p className="title-item-update">
                        <img src={namImage} alt="post" />
                        <span>Image</span>
                    </p>

                    <div className="image-post-wrapper-bot">
                        <div
                            onClick={handlePhotoVideo}
                            className="input-file-image flex items-center gap-2 px-3 py-2 text-blue-500 bg-gray-100 border border-solid rounded-lg">
                            <img src={camera_icon} alt="Photo/Video" /> Photo/Video
                        </div>

                        <input type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            className="hidden" />

                        <div className="new-image">
                            <p className="title-item-update">New image: </p>
                            <div className="new-image-items">
                                {images.slice(0, 6).map((image, index) => (

                                    <div
                                        key={index}
                                        className="image-item">
                                        <img
                                            src={image}
                                            alt="Post" />
                                        {/* className={`w-full h-24 rounded-lg object-cover ${index === 5 && images.length > 6 ? "brightness-50" : ""}`} /> */}
                                        {/* {index === 5 && images.length > 6 && (
                                         <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                                             +{images.length - 6} more
                                         </div>
                                     )} */}
                                        <button type="button"
                                            onClick={() => removeImage(index)}
                                            className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-70" >
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>

                                ))}
                            </div>
                        </div>

                        <div className="old-image">
                            <p className="title-item-update">Old image: </p>
                            <div className="old-image-items">
                                {oldImages && oldImages.length > 0 && (
                                    oldImages.map((image) => (
                                        <div
                                            key={image.postImageId}
                                            className="image-item">
                                            <img
                                                src={image.imageUrl}
                                                alt="Post" />
                                            {/* className={`w-full h-24 rounded-lg object-cover ${index === 5 && images.length > 6 ? "brightness-50" : ""}`} /> */}
                                            {/* {index === 5 && images.length > 6 && (
                                         <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                                             +{images.length - 6} more
                                         </div>
                                     )} */}
                                            <button type="button"
                                                onClick={() => addDeleteImages(image)}
                                                className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-70" >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                <button type="submit"
                    className="w-full mt-4 mb-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600" >
                    SAVE
                </button>
            </form>
        </div>
    );
}

export default UpdatePostForm;