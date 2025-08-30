import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import YourGroupDetailListItem from "../../components/Group/YourGroupDetailListItem";
import GroupDetailHeader from "../../components/Group/GroupDetailHeader";
import RequestGroupCard from "../../components/Group/RequestGroupCard";
import MemberPermission from "../../components/Group/MemberPermission";
import MemberCard from "../../components/Group/MemberCard";
import PopularService from "../../components/Services/PopularService";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import instance from "../../Axios/axiosConfig";
import { useSignalR } from "../../context/SignalRContext";
import PostCreate from "../../components/Post/PostCreate";
import { toast, Bounce } from "react-toastify";
import PostCardSkeleton from "../../components/Post/PostCardSkeleton";
import defaultAvatar from "../../assets/images/default-avatar.png";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import PostInGroupCard from "../../components/Group/PostInGroupCard";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // lấy groupId từ URL
  const [groupDetail, setGroupDetail] = useState(null);
  const [listMemberOfgroup, setListmember] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [memberStatus, setMemberStatus] = useState(null);
  const [userAccId, setUserAccId] = useState(null);
  const [groupReload, setGroupReload] = useState(null);
  const { connection } = useSignalR();
  //get service
  const [services, setServices] = useState([]);
  // handle search
  const [searchKeyword, setSearchKeyword] = useState("");

  // get list request join group
  const [listRequestToJoin, setListRequestToJoin] = useState([]);
  // cpnnect signar
  const connectionRef = useRef(null);
  // select home, member,...
  const [selectedTab, setSelectedTab] = useState("posts");

  //List your group đã join
  const [yourGroupsData, setGroupData] = useState([]);

  // xử lí list post and create post
  const [avatarUrl, setAvatarUrl] = useState("");
  const [posts, setPosts] = useState([]);

  //Load trang signalR
  const ReloadSignlR = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      const res = await instance.get(`/api/group/get-by-id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupDataRaw = res.data?.data ? res.data.data : res.data;
      const groupData = Array.isArray(groupDataRaw)
        ? groupDataRaw[0]
        : groupDataRaw;
      setGroupDetail(groupData);

      // Nếu muốn load thành viên, gọi API tương tự ở đây (nếu cần)
      // const memberRes = await instance.get(...);
      // setListMemberOfGroup(memberRes.data.data);
    } catch (err) {
      console.error("Lỗi reload group:", err);
    }
  }, [id]);

  // ---- Load group ngay khi mở page hoặc đổi groupId ----
  useEffect(() => {
    ReloadSignlR();
  }, [ReloadSignlR]);

  // Ở component cha (GroupDetailPage)
  useEffect(() => {
    if (!connection) return;
    console.log("SignalR connection state:", connection.state);
    const handler = (groupUpdated) => {
      if (groupUpdated.groupId === groupDetail?.groupId) {
        console.log("Nhận được GroupUpdated:", groupUpdated);
        ReloadSignlR();
      }
    };
    connection.on("GroupUpdated", handler);
    return () => {
      connection.off("GroupUpdated", handler);
    };
  }, [connection, groupDetail?.groupId, ReloadSignlR]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      const accId = decoded.AccId;
      setUserAccId(accId);
    }
  }, []);
  useEffect(() => {
    if (userAccId) {
      fetchListMemberData();
    }
  }, [userAccId]); // gọi lại khi userAccId được cập nhật
  // get your group
  const fetchYourGroupsData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group/all-group-user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Kiểm tra dữ liệu và cập nhật state
      if (Array.isArray(data.data)) {
        setGroupData(data.data);
        console.log(data[0]);
      } else {
        console.warn("Unexpected response format:", data);
        setGroupData([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
    }
  };

  const fetchGroupDetailData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group/get-by-id/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Kiểm tra dữ liệu và cập nhật state

      setGroupDetail(data.data[0]);
      console.log(data.data[0].background);
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
    }
  };

  // get list member
  const fetchListMemberData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group-member/users/in-group/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("List member from API:", data);

      if (Array.isArray(data)) {
        setListmember(data);
      } else {
        console.warn("Unexpected response format:", data);
        setListmember([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
    }
  };

  // get list resquest to join
  const fetchListRequestToJoinData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found.");
        return;
      }

      const res = await fetch(
        `https://localhost:7280/api/group-member/list-request-to-join/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data.data)) {
        const list = Array.isArray(data.data) ? data.data : [];

        // Luôn tạo mảng mới để React biết là thay đổi
        setListRequestToJoin([...list]);
      } else {
        console.warn("Unexpected response format:", data);
        setListRequestToJoin([]);
      }
    } catch (err) {
      console.error("Error fetching groups:", err.message || err);
    } finally {
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = jwtDecode(token);
      const accId = decoded.AccId;
      setUserAccId(accId);
    }
  }, []);

  useEffect(() => {
    if (listMemberOfgroup && listMemberOfgroup.length > 0 && userAccId) {
      const person = listMemberOfgroup.find(
        (member) => member.accId.trim() === userAccId.trim()
      );
      setUserRole(person?.roleInGroupId);
      setMemberStatus(person?.memberStatus);
      console.log(
        "Role of current user:",
        person?.fullName,
        person?.roleInGroupId,
        person?.memberStatus
      );
    }
  }, [listMemberOfgroup, userAccId]);
  // phụ thuộc cả 2

  useEffect(() => {
    fetchListMemberData();
    fetchGroupDetailData();
    fetchListRequestToJoinData();

    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7280/friendHub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected");

        // Đảm bảo không đăng ký trùng
        connection.off("GroupMemberUpdate");
        connection.off("GroupDeleted");

        // Lắng nghe các sự kiện
        connection.on("GroupMemberUpdate", () => {
          console.log("Received GroupMemberUpdate signal");
          fetchListMemberData();
          fetchListRequestToJoinData();
        });

        connection.on("GroupDeleted", (deletedGroupId) => {
          if (deletedGroupId === id) {
            toast.error("This group has been deleted!", { autoClose: 3000 });
            navigate("/GroupDetail", { replace: true });
          }
        });
      })
      .catch((err) => console.error("SignalR connection error: ", err));

    connectionRef.current = connection;

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [id]);

  useEffect(() => {
    fetchYourGroupsData();
  }, []);

  // const ReloadData = () => {
  //   fetchListRequestToJoinData();
  //   fetchListMemberData();
  // };
  // xử lí list post and create post
  const [accountId, setAccountId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  //DÙNG CHO INFINITE SCROLL

  const [lastPostId, setLastPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const postContainerRef = useRef(null);
  const PAGE_SIZE = 5;

  //lấy thông tin người dùng từ storage
  useEffect(() => {
    const storedAccId =
      localStorage.getItem("accId") || sessionStorage.getItem("accId");
    const storedAvatarUrl =
      localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");

    if (storedAccId) {
      setAccountId(storedAccId);
      setAvatarUrl(storedAvatarUrl || defaultAvatar);
    }
  }, []);

  const fetchPosts = async ({ lastPostId, reset = false }) => {
    if (!hasMore && !reset) return;

    setLoading(true);
    if (lastPostId && !reset) setLoadingMore(true);
    setError(null);

    try {
      const response = await instance.get(
        "/api/post/get-post-in-group-detail",
        {
          params: {
            lastPostId,
            pageSize: PAGE_SIZE,
            groupId: id,
          },
        }
      );

      const newPosts = response.data.data || [];
      const success = response.data.success;

      if (success) {
        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }

        if (newPosts.length > 0) {
          setLastPostId(newPosts[newPosts.length - 1].post.postId);
          setHasMore(response.data.hasMore);
        } else {
          // Nếu không có bài mới => dừng scroll
          setHasMore(false);
          setLastPostId(null); // ✅ reset để không trigger lại
        }
      } else {
        setError(response.data.message || "Tải bài post thất bại!");
      }
    } catch (error) {
      setError("Failed to load posts!");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  //GỌI LẦN ĐẦU

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadPosts = async () => {
      setInitialLoading(true); // ✅ Mới thêm
      setSkip(0);
      setLastPostId(null);
      setHasMore(true);
      setPosts([]);
      setError(null);

      if (isSearching) return;

      try {
        const response = await instance.get(
          "/api/post/get-post-in-group-detail",
          {
            params: {
              lastPostId: null,
              pageSize: PAGE_SIZE,
              groupId: id,
            },
          }
        );

        if (!cancelled && response.data.success) {
          const newPosts = response.data.data || [];
          setPosts(newPosts);
          setHasMore(response.data.hasMore);
          if (newPosts.length > 0) {
            setLastPostId(newPosts.at(-1).post.postId);
          }
        }
      } catch (error) {
        if (!cancelled) setError("Tải bài post thất bại!");
      } finally {
        setInitialLoading(false); // ✅ Mới thêm
      }
    };

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const { skip, setSkip } = useInfiniteScroll({
    fetchData: () => {
      if (!loading && !loadingMore && hasMore && lastPostId !== null) {
        return fetchPosts({ lastPostId });
      }
    },
    containerRef: window,
    direction: "down",
    threshold: 50,
    hasMore,
    loading,
    loadingMore,
    comments: posts.length,
    data: PAGE_SIZE,
    take: posts.length,
  });

  const handleCommentCountChange = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((postMapper) =>
        postMapper.post && postMapper.post.postId === postId
          ? { ...postMapper, post: { ...postMapper.post, comments: newCount } }
          : postMapper
      )
    );
  };
  const handleDeletePost = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post.post.postId !== postId)
    );
  };

  const handlePostCreate = (newPostData) => {
    if (newPostData.post.postScope === "Public") {
      setPosts((prevPosts) => [newPostData, ...prevPosts]);
      setPostCount((count) => count + 1);
    }
  };
  // filter when search

  const fetchPostCount = async (groupId) => {
    try {
      const response = await instance.get("/api/post/count-post-in-group", {
        params: {
          groupId: groupId,
        },
      });

      if (response.data.success) {
        return response.data.data; // số lượng post public
      } else {
        console.warn("Failed to fetch post count:", response.data.message);
        return 0;
      }
    } catch (error) {
      console.error("Error fetching post count:", error);
      return 0;
    }
  };
  useEffect(() => {
    if (id) {
      fetchPostCount(id).then((count) => {
        setPostCount(count);
      });
    }
  }, [id]);
  const fetchFilteredPostsFromServer = async (keyword) => {
    try {
      setLoading(true);
      const response = await instance.get(
        `/api/post/search-posts-in-group-dto/${id}`,
        {
          params: {
            keyword: keyword,
          },
        }
      );

      if (response.data.success) {
        setPosts(response.data.data || []);
        setHasMore(false); // không còn infinite scroll khi đang search
      }
    } catch (error) {
      console.error("Search failed", error);
      setError("Failed to search posts");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (searchKeyword.trim()) {
      setIsSearching(true);
      fetchFilteredPostsFromServer(searchKeyword);
    } else {
      setIsSearching(false);
      setPosts([]); // reset lại
      setLastPostId(null);
      fetchPosts({ lastPostId: null, reset: true }); // gọi lại infinite scroll từ đầu
    }
  }, [searchKeyword]);

  const filteredMembers = listMemberOfgroup.filter((member) =>
    member.fullName?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const filteredRequests = listRequestToJoin.filter((request) =>
    request.accountFullName?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const filteredPermissionList = listMemberOfgroup.filter((member) =>
    member.fullName?.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  // trường hợp đang view group mà bị amdin xóa
  const [memberListLoaded, setMemberListLoaded] = useState(false);

  useEffect(() => {
    if (listMemberOfgroup && userAccId) {
      const person = listMemberOfgroup.find(
        (member) => member.accId.trim() === userAccId.trim()
      );

      if (memberListLoaded) {
        if (!person) {
          toast.error("You have been removed from the group!", {
            autoClose: 3000,
          });
          navigate("/GroupDetail", { replace: true }); // hoặc về trang khác
          return;
        }
      }

      // nếu tìm được thì set role và status
      if (person) {
        setUserRole(person.roleInGroupId);
        setMemberStatus(person.memberStatus);
      }

      // đánh dấu đã load xong ít nhất 1 lần
      setMemberListLoaded(true);
    }
  }, [listMemberOfgroup, userAccId]);
  //get service
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // const res = await axios.get("https://localhost:7280/api/service/all");
        const res = await instance.get("api/service/all");
        if (res.data.success) {
          const mappedServices = res.data.data
            .filter((item) => item.service)
            .map((item) => item.service);

          const enrichedServices = await Promise.all(
            mappedServices.map(async (service) => {
              try {
                // const providerRes = await axios.get(`https://localhost:7280/api/account/profile-another/${service.providerId}`);
                const providerRes = await instance.get(
                  `api/account/profile-another/${service.providerId}`
                );
                const provider = providerRes.data?.data;


                return {
                  ...service,
                  fullName: provider?.fullName || "",
                  avatar: provider?.avatar || "",
                  country: provider?.country || "",
                  city: provider?.city || "",
                };
              } catch (err) {
                console.error(
                  "❌ Không thể lấy thông tin provider:",
                  service.providerId,
                  err
                );
                return {
                  ...service,
                  fullName: "",
                  avatar: "",
                  country: "",
                  city: "",
                };
              }
            })
          );

          //setServices(mappedServices);
          setServices(enrichedServices);
          // console.log("✅ Services đã chuẩn hóa:", enrichedServices);
        } else {
          console.error("❌ Lỗi khi gọi API:", res.data.message);
        }
      } catch (err) {
        console.error("❌ Lỗi mạng:", err);
      }
    };

    fetchServices();
  }, []);

  return (
    <div>
      <Header />
      <NavbarHeader />
      <div className="md:flex md:flex-row md:pt-36 md:ml-[120px] gap-6 flex flex-col ml-[40px] pt-20">
        <div className="w-[342px] flex flex-col gap-6">
          <YourGroupDetailListItem YourGroupList={yourGroupsData} />
          <PopularService list={services}/>
        </div>
        <div>
          <GroupDetailHeader
            group={groupDetail}
            userRole={userRole}
            userAccId={userAccId}
            memberStatus={memberStatus}
            countMember={listMemberOfgroup.length}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            // reload={ReloadData}
            reloadsignlR={ReloadSignlR}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            countPosts={postCount}
          />
          {/* {selectedTab === "posts" && <MemberCard />} */}
          {selectedTab === "members" && groupDetail && (
            <div>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <MemberCard
                    key={member.accId}
                    member={member}
                    userRole={userRole}
                    userAccId={userAccId}
                    // reload={ReloadData}
                    ownerId={groupDetail.ownerId}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">Not found</div>
              )}
            </div>
          )}
          {selectedTab === "requests" && (
            <div>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <RequestGroupCard
                    key={request.groupMemberId}
                    request={request}
                    userRole={userRole}
                    // reload={ReloadData}
                    setListRequestToJoin={setListRequestToJoin}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No data to display
                </div>
              )}
            </div>
          )}

          {selectedTab === "permission" && groupDetail && (
            <div>
              {filteredPermissionList.length > 0 ? (
                filteredPermissionList.map((member) => (
                  <MemberPermission
                    key={member.groupMemberId}
                    member={member}
                    userRole={userRole}
                    userAccId={userAccId}
                    // reload={ReloadData}
                    ownerId={groupDetail.ownerId}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No data to display
                </div>
              )}
            </div>
          )}

          {selectedTab === "posts" && groupDetail && (
            <div className="md:w-[770px] w-full">
              <PostCreate
                profileImage={avatarUrl}
                onPostCreate={handlePostCreate}
                groupId={id}
              />
              <div className="w-full flex flex-col items-center pt-3">
                <div className="w-full max-w-3xl flex flex-col gap-4">
                  {initialLoading ? (
                    <div className="flex flex-col gap-5">
                      {[...Array(3)].map((_, index) => (
                        <PostCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">{error}</div>
                  ) : posts.length > 0 ? (
                    posts.map((postMapper, index) =>
                      postMapper && postMapper.post && postMapper.ownerPost ? (
                        <PostInGroupCard
                          onDeletePost={handleDeletePost}
                          key={`${postMapper.post.postId}-${index}`}
                          post={{
                            accId: postMapper.ownerPost.accId || "Unknown",
                            postId: postMapper.post.postId,
                            fullName:
                              postMapper.ownerPost.fullName || "Unknown User",
                            avatar:
                              postMapper.ownerPost.avatar ||
                              "https://via.placeholder.com/40",
                            createAt: postMapper.post.createdAt,
                            content: postMapper.post.postContent,
                            images:
                              postMapper.postImages?.map(
                                (img) => img.imageUrl
                              ) || [],
                            hashtags:
                              postMapper.hashTags?.map(
                                (tag) => tag.hashTagContent
                              ) || [],
                            tagFriends:
                              postMapper.postTags?.map((tag) => ({
                                accId: tag.accId,
                                fullname:
                                  tag.fullname || tag.username || "Unknown", // Sử dụng username nếu fullname là null
                              })) || [],
                            categories:
                              postMapper.postCategories?.map(
                                (cat) => cat.categoryName
                              ) || [],
                            likes: postMapper.reactionCount || 0,
                            comments: postMapper.commentCount || 0,
                            shares: postMapper.shareCount || 0,
                          }}
                          groupData={postMapper.group}
                          onCommentCountChange={(newCount) =>
                            handleCommentCountChange(
                              postMapper.post.postId,
                              newCount
                            )
                          }
                        />
                      ) : null
                    )
                  ) : (
                    <div className="text-center py-4">Not found any post</div>
                  )}
                  {loadingMore && (
                    <div className="flex flex-col gap-5 py-4">
                      {[...Array(2)].map((_, index) => (
                        <PostCardSkeleton key={`more-${index}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
