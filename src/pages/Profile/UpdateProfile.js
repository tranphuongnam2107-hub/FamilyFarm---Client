import React, { useEffect, useState } from "react";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header";
import NavbarHeader from "../../components/Header/NavbarHeader";
import CoverBackground from "../../components/Profile/CoverBackground";
import ProfileAvatar from "../../components/Profile/ProfileAvatar";
import UpdateProfileForm from "../../components/Profile/UpdateProfileForm";
import { Link, } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const UpdateProfile = () => {
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        const res = await instance.get("/api/account/own-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data && res.data.success) {
          console.log("Profile data:", res.data.data);
          setProfileData(res.data.data);
        } else {
          toast.error("Failed to load profile!");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Error fetching profile!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NavbarHeader />
      <div className="flex-grow">
        <div className="container mx-auto max-w-7xl">
          <div className="relative">
            <CoverBackground backgroundImage={profileData?.background || user?.background} />
            <ProfileAvatar
              fullName={profileData?.fullName || user?.fullName || "Unknown"}
              avatarImage={profileData?.avatar || user?.avatar}
              initialProfileImage={profileData?.avatar || user?.avatar}
            />
          </div>
          <div className="flex-row gap-5 pt-10 text-left">
            <div className="p-3">
              <Link to="/PersonalPage">Profile /</Link>
              <Link className="text-blue-500" to="">
                {" "}
                Update{" "}
              </Link>
            </div>
            <UpdateProfileForm profileData={profileData || user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;