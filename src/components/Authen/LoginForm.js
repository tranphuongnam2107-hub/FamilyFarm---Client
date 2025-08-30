import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../../assets/images/logo_img.png";
import mdiUser from "../../assets/images/mdi_user.png";
import mdiClock from "../../assets/images/mdi_clock.png";
import iconEye from "../../assets/images/mdi_eye (1).png";
import googleIcon from "../../assets/images/devicon_google.png";
import fbIcon from "../../assets/images/devicon-plain_facebook.png";
import { getOwnProfile } from "../../services/accountService";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../Axios/axiosConfig";
import { toast } from "react-toastify";
import useGoogleAuth from "../../hooks/useGoogleAuth";
import { useUser } from "../../context/UserContext";
import Swal from "sweetalert2";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { reloadUser } = useUser();

  const navigate = useNavigate();
  const { initiateGoogleLogin, loading, error } = useGoogleAuth();

  // Helper function để clear tất cả tokens
  const clearAllTokens = () => {
    [
      "accessToken",
      "refreshToken",
      "username",
      "accId",
      "roleId",
      "tokenExpiry",
      "fullName",
      "avatarUrl",
      "profileData",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  // Helper function để lưu tokens theo rememberMe choice
  const saveTokens = (loginData, remember) => {
    const storage = remember ? localStorage : sessionStorage;

    // Clear tokens từ storage khác trước khi lưu
    const otherStorage = remember ? sessionStorage : localStorage;
    [
      "accessToken",
      "refreshToken",
      "username",
      "accId",
      "roleId",
      "tokenExpiry",
    ].forEach((key) => {
      otherStorage.removeItem(key);
    });

    // Lưu tokens vào storage được chọn
    storage.setItem("accessToken", loginData.accessToken);
    storage.setItem("refreshToken", loginData.refreshToken);
    storage.setItem("username", loginData.username);
    storage.setItem("accId", loginData.accId);
    storage.setItem("roleId", loginData.roleId);

    const expiryTime = Date.now() + loginData.tokenExpiryIn * 1000;
    storage.setItem("tokenExpiry", expiryTime);
  };

  // Helper function để lưu profile data
  const saveProfileData = (profileData, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    // Clear profile data từ storage khác
    ["fullName", "avatarUrl", "profileData"].forEach((key) => {
      otherStorage.removeItem(key);
    });

    // Lưu profile data
    storage.setItem(
      "fullName",
      profileData.data.fullName || storage.getItem("username")
    );
    storage.setItem("avatarUrl", profileData.data.avatar || "");
    storage.setItem("profileData", JSON.stringify(profileData.data || {}));
  };

  const handleGoogleLogin = () => {
    initiateGoogleLogin(rememberMe, navigate, reloadUser);
  };

  useEffect(() => {
    // Tải SDK Facebook nếu chưa có
    if (!window.FB) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        window.FB.init({
          appId: "1018117513816487",
          cookie: true,
          xfbml: true,
          version: "v17.0",
        });
      };
      document.body.appendChild(script);
    } else {
      window.FB.init({
        appId: "1018117513816487",
        cookie: true,
        xfbml: true,
        version: "v17.0",
      });
    }
  }, []);

  // Đăng nhập bằng facebook
  const handleFacebookLogin = () => {
    window.FB.login(
      function (response) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          window.FB.api(
            "/me",
            { fields: "id,name,email,picture", access_token: accessToken },
            async function (userInfo) {
              const payload = {
                facebookId: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.picture?.data?.url || null,
              };

              try {
                const loginResponse = await instance.post(
                  "api/authen/login-facebook",
                  payload,
                  {
                    skipInterceptor: true,
                  }
                );

                const loginData = loginResponse.data;

                if (loginResponse.status === 200) {
                  // Sử dụng helper function để lưu tokens
                  saveTokens(loginData, rememberMe);

                  // Lấy thông tin profile
                  try {
                    const profileResponse = await getOwnProfile();
                    saveProfileData(profileResponse, rememberMe);
                  } catch (profileError) {
                    console.warn("Could not fetch profile data:", profileError);
                  }

                  await reloadUser();
                  toast.success("LOGIN SUCCESSFULLY!");
                  navigate("/");
                } else {
                  toast.error("Login failed!");
                }
              } catch (error) {
                if (error.response && error.response.status === 401) {
                  toast.error("Login failed! Please check your Facebook info!");
                } else {
                  toast.error("Server not responding");
                }
              }
            }
          );
        }
      },
      { scope: "public_profile,email" }
    );
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  const handleLogin = async (e) => {
    let hasError = false;
    let newErrors = {};

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsSubmitted(true);

    // const newErrors = {};

    // if (!username.trim()) {
    //   newErrors.username = "Username is required";
    // }

    if (!username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    }

    // if (!password) {
    //   newErrors.password = "Password is required";
    // }

    if (!password.trim()) {
    newErrors.password = "Password is required";
    hasError = true;
  } 
  // else if (password.length < 8) {
  //   newErrors.password = "Password must be at least 8 characters";
  //   hasError = true;
  // }

  if (hasError) {
    setErrors(newErrors);
    setIsSubmitted(true);
    return; // Không gọi API nếu có lỗi
  }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // Clear any existing tokens before new login
      clearAllTokens();

      const loginResponse = await instance.post(
        "/api/authen/login",
        {
          Identifier: username,
          Password: password,
        },
        {
          skipInterceptor: true,
        }
      );

      const loginData = loginResponse.data;

      if (loginResponse.status === 200) {
        // Sử dụng helper function để lưu tokens
        saveTokens(loginData, rememberMe);

        // Lấy thông tin profile
        try {
          const profileData = await getOwnProfile();
          saveProfileData(profileData, rememberMe);
        } catch (profileError) {
          console.warn("Could not fetch profile data:", profileError);
          // Fallback: chỉ lưu username
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem("fullName", loginData.username);
          storage.setItem("avatarUrl", "");
          storage.setItem("profileData", JSON.stringify({}));
        }

        await reloadUser();
        toast.success("LOGIN SUCCESSFULLY!");
        if (loginData.roleId === "67fd41dfba121b52bbc622c3") {
          navigate("/Dashboard");
        }
        else {
          navigate("/");
        }
      } else {
        toast.error("Login failed! Please check your username or password!");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 401) {
          toast.error("Login failed! Please check your username or password!");
        } else if (status === 423) {
          if (message === "Account is locked login.") {
            const lockedUntil = error.response.data.lockedUntil;

            if (lockedUntil) {
              const lockedDate = new Date(lockedUntil);
              const now = new Date();
              const diffMs = lockedDate - now;
              const minutes = Math.floor(diffMs / 60000);
              const seconds = Math.floor((diffMs % 60000) / 1000);

              Swal.fire({
                icon: "error",
                title: "Your account has been locked.",
                html: `Please try again in <b>${minutes} minutes ${seconds} seconds</b>.`,
                confirmButtonText: "OK",
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Your account has been locked.",
                text: "Please try again later.",
                confirmButtonText: "OK",
              });
            }
          } else if (message === "Your account has not been approved.") {
            Swal.fire({
              icon: "warning",
              title: "Account not approved.",
              text: "Please come back in a few days.",
              confirmButtonText: "OK",
            });
          } else if (message === "Account does not exist or has been deleted.") {
            toast.error(message);
          }
        } else {
          toast.error("An unknown error occurred");
        }

      } else {
        toast.error("Server not responding");
      }
    }
  };

  return (
    <div className="overlap w-full md:w-1/2 mt-6 md:mt-0 md:ml-[5%] bg-gray-200 bg-opacity-25">
      <div className="form-container w-full max-w-[466px] flex flex-col gap-7 mx-auto">
        <div className="flex items-center justify-center mx-auto logo gap-x-4">
          <img className="w-12 h-auto" src={logo} alt="Logo" />
          <div className="family-farm">Family Farm</div>
        </div>

        <div className="frame-4">
          <p className="p">Welcome back, start your journey!</p>
          <div className="text-wrapper-5">Login to Family Farm</div>
        </div>

        <div className="group">
          <div className="frame-5">
            <div className="text-wrapper-6">Enter your Username</div>
            <div className="text-wrapper-7">*</div>
          </div>
          <div className="w-full mt-4 overlap-group-wrapper">
            <div className="flex w-full overlap-group">
              <img className="mdi-user" src={mdiUser} alt="User Icon" />
              <input
                className="input-text"
                type="text"
                placeholder="Enter your username, email or phone"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (isSubmitted && e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, username: "" }));
                  }
                }}
              />
            </div>
          </div>
          {errors.username && (
            <span className="text-sm italic text-red-600">
              {errors.username}
            </span>
          )}
        </div>

        <div className="group-2">
          <div className="frame-5">
            <div className="text-wrapper-6">Enter your Password</div>
            <div className="text-wrapper-7">*</div>
          </div>
          <div className="w-full mt-4 overlap-group-wrapper">
            <div className="flex w-full overlap-group">
              <img className="mdi-clock" src={mdiClock} alt="Clock Icon" />
              <input
                className="input-text"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);

                  if (isSubmitted) {
                    if (value.length >= 8) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }
                }}
              />
              {/* <img
                className="mdi-eye cursor-pointer"
                src={iconEye}
                alt="Toggle Password Visibility"
                onClick={() => setShowPassword((prev) => !prev)}
              /> */}
              <div
                className="mdi-eye cursor-pointer flex items-center px-2"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </div>
            </div>
          </div>
          {errors.password && (
            <span className="text-sm italic text-red-600">
              {errors.password}
            </span>
          )}
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              value="check"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-wrapper-10">Remember me!</span>
          </label>
          <Link to="/ForgotPassword" className="text-wrapper-11">
            Forgot password?
          </Link>
        </div>

        <div className="w-full frame-2">
          <div
            className="div-wrapper"
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <button type="button" className="text-wrapper-2">
              Login
            </button>
          </div>
          <div className="frame-3">
            <div className="text-wrapper-3">Don't have an account?</div>
            <Link to="/Register" className="text-wrapper-4">
              Register now
            </Link>
          </div>
        </div>

        <div className="frame-8">
          <div className="text-wrapper-12">Login With</div>
          <div className="flex flex-col items-center justify-center frame-9 lg:flex-row">
            <div className="frame-10 w-full lg:w-[223px]">
              <div
                className={`frame-10 w-full lg:w-[223px] cursor-pointer flex items-center justify-center border border-gray-300 rounded-md py-2 ${loading ? "opacity-50 pointer-events-none" : ""
                  }`}
                onClick={handleGoogleLogin}
              >
                <img
                  className="img w-6 h-6 mr-2"
                  src={googleIcon}
                  alt="Google Icon"
                />
                <div className="text-wrapper-13">
                  {loading ? "Logging in..." : "Continue with Google"}
                </div>
              </div>
            </div>
            <div
              className="frame-11 w-full lg:w-[223px]"
              onClick={handleFacebookLogin}
            >
              <img className="img" src={fbIcon} alt="Facebook Icon" />
              <div className="text-wrapper-14">Continue with Facebook</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
