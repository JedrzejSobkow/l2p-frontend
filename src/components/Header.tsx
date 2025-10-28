import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header = ({ onToggleFriends }:{
    onToggleFriends?:() => void
    }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const isFriendsScreen = location.pathname.startsWith('/friends');

    const isAuthScreen = location.pathname === '/login' || location.pathname === '/register';

    return (
        <header className="w-full h-16 bg-background text-headline flex items-center justify-between px-5 relative font-sans text-sm font-light overflow-hidden">
            {/* Bottom Line */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}
            ></div>
            {/* Orange Line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-highlight rounded"></div>
            {/* Logo */}
            <div className="flex items-center gap-2 pr-2 flex-shrink-0">
                <Link to='/'><img
                    src="/src/assets/images/logo.png"
                    alt="L2P Logo"
                    className="h-18 w-auto"
                />
                </Link>
            </div>
            {/* Header Elements */}
            <div className="header-elements flex gap-6 items-center pr-2 flex-1 justify-start">
                {/* WiFi Section */}
                <div className="flex items-center gap-2 hide-on-smaller">
                    <img
                        src="/src/assets/icons/wifi.png"
                        alt="WiFi Icon"
                        className="w-9 h-9"
                    />
                    <span>524 players online</span>
                </div>
                {/* Element 2 */}
                <div className="flex items-center gap-2">
                    <img
                        src="/src/assets/icons/play.png"
                        alt="Play Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">No need for creating account</span>
                </div>
                {/* Element 3 */}
                <div className="flex items-center gap-2">
                    <img
                        src="/src/assets/icons/globe.png"
                        alt="Globe Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">No need for downloading</span>
                </div>
                {/* Element 4 */}
                <div className="flex items-center gap-2">
                    <img
                        src="/src/assets/icons/people.png"
                        alt="People Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">Just you and people you share passion with</span>
                </div>
            </div>
            {/* User Info */}
            <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                {isAuthenticated ? (
                    <>
                        <Link to="/profile">
                            <img
                                src={user?.pfp_path || "/src/assets/avatars/default.png"}
                                alt="User Icon"
                                className="w-10 h-10 rounded-full cursor-pointer"
                            />
                        </Link>
                        <div className="user-info flex flex-col items-start">
                            <Link to="/profile" className="hide-on-mobile text-base font-light text-headline cursor-pointer">
                                Hello, 
                                <span className="text-base font-medium pl-1 text-headline">{user?.nickname}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={logout}
                                className="text-xs font-bold text-highlight no-underline bg-transparent border-0 cursor-pointer"
                            >
                                logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {!isAuthScreen && (
                            <>
                                <div className="user-info flex flex-col items-start">
                                    <span className="hide-on-mobile text-base font-light text-headline">
                                        Hello, 
                                        <span className="text-base font-medium pl-1 text-headline">Guest</span>
                                    </span>
                                </div>
                            </>
                        )}
                        <Link
                            to="/login"
                            className="rounded-full border border-highlight px-4 py-2 text-xs font-semibold text-highlight transition-colors duration-200 hover:bg-highlight hover:text-button-text-dark"
                        >
                            Log in
                        </Link>
                    </>
                )}
            </div>
            {/* Menu Button */}
            {isAuthenticated && (
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <img
                    onClick={onToggleFriends}
                    src="/src/assets/icons/menu.png"
                    alt="Menu Icon"
                    className="w-9 h-9"
                />
            </div>
            )}
            
        </header>
    );
};

export default Header;
