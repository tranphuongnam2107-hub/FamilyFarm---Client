import React, { useState, useEffect } from 'react';
import './header.css';
import { Link } from 'react-router-dom';
import NotificationList from '../Notification/NotificationList';
import ChatListPopup from '../Chat/ChatListPopup';
import logo from '../../assets/images/logo.png';
import defaultAvatar from '../../assets/images/default-avatar.png';
import MenuHeader from './MenuHeader';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import SearchBox from '../Search/SearchBox';

const Header = () => {
    const { user } = useUser();
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [activePopup, setActivePopup] = useState(null);
    const { unreadCount } = useNotification(); // Lấy unreadCount từ context

    const toggleSidebar = () => {
        setIsSidebarActive((prev) => !prev);
    };

    const handlePopupToggle = (popupName) => {
        setActivePopup((prev) => (prev === popupName ? null : popupName));
    };

    useEffect(() => {
        setAvatarUrl(user?.avatar || defaultAvatar);
        setFullName(user?.fullName || "");
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const popupContainers = [
                '.menu-container',
                '.chat-box',
                '.notifi-box',
                '.chat-details-container',
                '.sidebar-menu',
            ];
            const isClickInsidePopup = popupContainers.some((selector) => {
                const isInside = event.target.closest(selector);
                return isInside;
            });

            if (!isClickInsidePopup) {
                setActivePopup(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username") || sessionStorage.getItem("username");
        const storedFullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
        const storedAvatarUrl = localStorage.getItem("avatarUrl") || sessionStorage.getItem("avatarUrl");

        if (storedUsername) {
            setUsername(storedUsername);
            setFullName(storedFullName || storedUsername);
        }
        setAvatarUrl(storedAvatarUrl || "https://firebasestorage.googleapis.com/v0/b/prn221-69738.appspot.com/o/image%2Fdefault-avatar.png?alt=media&token=69ee68ad-2b1b-4f74-8497-2fd68f25d283");
        console.log(avatarUrl)
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarActive(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className='fixed z-[1000]'>
            <div className="logo">
                <Link to="/" href="#">
                    <img src={logo} alt="logo" />
                </Link>
                <h3 className="font-bold name-page">Family Farm</h3>
            </div>

            <SearchBox />
            
            <div className="action">
                <>
                    <NotificationList
                        onToggle={() => handlePopupToggle('notification')}
                        isVisible={activePopup === 'notification'}
                    />
                    <ChatListPopup
                        onToggle={() => handlePopupToggle('chat')}
                        isVisible={activePopup === 'chat'}
                    />
                </>
                {username ? (
                    <div className="relative menu-container">
                        <div
                            className="avatar-box"
                            onClick={() => handlePopupToggle('menu')}
                            role="button"
                            aria-label="Toggle menu"
                            aria-expanded={activePopup === 'menu'}
                        >
                            <div className="avatar-circle">
                                <img src={avatarUrl} alt="avatar" />
                            </div>
                            <p className="name-account">{fullName}</p>
                        </div>
                        <MenuHeader
                            onToggle={() => handlePopupToggle('menu')}
                            isVisible={activePopup === 'menu'}
                        />
                    </div>
                ) : (
                    <div className="login-box">

                        <Link to="/Login">Login</Link>

                    </div>
                )}
            </div>

            <div className="menu-responsive" onClick={toggleSidebar}>
                <i className="fa-solid fa-bars"></i>
            </div>

            <div className={`sidebar-menu ${isSidebarActive ? 'active' : ''}`}>
                <Link to="/" className="sidebar-item">
                    <i className="fa-solid fa-house"></i>
                    <p>Home</p>
                </Link>
                <Link to="/" className="sidebar-item">
                    <i className="fa-solid fa-user"></i>
                    <p>Friend</p>
                </Link>
                <Link to="/" className="sidebar-item">
                    <i className="fa-solid fa-user-group"></i>
                    <p>Group</p>
                </Link>
                <Link to="/Service" className="sidebar-item">
                    <i className="fa-brands fa-servicestack"></i>
                    <p>Service</p>
                </Link>
                {username ? (
                    <div className="sidebar-item sidebar-item-profile"
                        onClick={() => handlePopupToggle('menu')}>
                        <div className="sidebar-item-profile-avatar">
                            <div>
                                <div>
                                    <img src={avatarUrl} alt="avatar" />
                                </div>
                                <p>{fullName}</p>
                            </div>
                        </div>
                        <MenuHeader
                            onToggle={() => handlePopupToggle('menu')}
                            isVisible={activePopup === 'menu'}
                        />
                    </div>
                ) : (

                    <Link to="/Login" className="sidebar-item">

                        <i className="fa-solid fa-right-to-bracket"></i>
                        <p>Login</p>
                    </Link>
                )}

                <div className='flex gap-6'>
                    <NotificationList
                        onToggle={() => handlePopupToggle('notification')}
                        isVisible={activePopup === 'notification'}
                    />
                    <ChatListPopup
                        onToggle={() => handlePopupToggle('chat')}
                        isVisible={activePopup === 'chat'}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;