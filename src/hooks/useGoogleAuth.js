import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import instance from '../Axios/axiosConfig';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { getOwnProfile } from '../services/accountService';

const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginContext, setLoginContext] = useState({ 
    rememberMe: null, 
    navigate: null, 
    reloadUser: null  // ✅ Add reloadUser to context
  });

  const handleGoogleLogin = async (rememberMe, navigate, reloadUser, tokenResponse) => {
    setLoading(true);
    try {
      const userInfo = await axios.get('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      const payload = {
        email: userInfo.data.email,
        fullName: userInfo.data.name,
      };

      const response = await instance.post('/api/authen/login-google', payload);
      const loginData = response.data;

      if (response.status === 200) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Clear tokens from other storage first
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        ['accessToken', 'refreshToken', 'username', 'accId', 'roleId', 'tokenExpiry'].forEach(key => {
          otherStorage.removeItem(key);
        });

        // Save tokens
        storage.setItem('accessToken', loginData.accessToken);
        storage.setItem('refreshToken', loginData.refreshToken);
        storage.setItem('username', loginData.username);
        storage.setItem('accId', loginData.accId);
        storage.setItem('roleId', loginData.roleId);
        
        const expiryTime = Date.now() + loginData.tokenExpiryIn * 1000;
        storage.setItem('tokenExpiry', expiryTime);

        // Get and save profile data
        try {
          const profileData = await getOwnProfile();
          
          // Clear profile data from other storage
          ['fullName', 'avatarUrl', 'profileData'].forEach(key => {
            otherStorage.removeItem(key);
          });
          
          storage.setItem('fullName', profileData.data.fullName || loginData.username);
          storage.setItem('avatarUrl', profileData.data.avatar || '');
          storage.setItem('profileData', JSON.stringify(profileData.data || {}));
        } catch (profileError) {
          console.warn('Could not fetch profile data:', profileError);
          // Fallback: save basic info
          storage.setItem('fullName', loginData.username);
          storage.setItem('avatarUrl', '');
          storage.setItem('profileData', JSON.stringify({}));
        }

        // ✅ Call reloadUser to update UserContext
        if (reloadUser) {
          await reloadUser();
        }

        toast.success('LOGIN SUCCESSFULLY!');
        navigate('/');
      } else {
        toast.error('Login failed!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Google token response:', tokenResponse);
      if (loginContext.rememberMe !== null && loginContext.navigate && loginContext.reloadUser) {
        handleGoogleLogin(
          loginContext.rememberMe, 
          loginContext.navigate, 
          loginContext.reloadUser,  // ✅ Pass reloadUser
          tokenResponse
        );
      } else {
        setError('Cannot log in due to configuration error');
        toast.error('Cannot log in due to configuration error');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google login failed');
      toast.error('Google login failed');
    },
    flow: 'implicit',
    prompt: 'select_account',
    scope: 'profile email',
  });

  const initiateGoogleLogin = (rememberMe, navigate, reloadUser) => {  // ✅ Accept reloadUser parameter
    setLoginContext({ rememberMe, navigate, reloadUser });  // ✅ Save reloadUser in context
    loginGoogle();
  };

  return { initiateGoogleLogin, loading, error };
};

export default useGoogleAuth;