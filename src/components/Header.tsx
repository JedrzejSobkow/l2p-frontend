import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { logoImage, pfpImage } from '@assets/images';
import { wifiIcon, playIcon, globeIcon, peopleIcon, menuIcon } from '@assets/icons';
import { useLobby } from './lobby/LobbyContext';
import { usePopup } from './PopupContext';
import { useFriends } from './friends/FriendsContext';
import ConfirmDialog from './ConfirmDialog';
import { useChat } from './chat/ChatProvider';


const Header = ({ onToggleFriends }: { onToggleFriends?: () => void }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { currentLobby } = useLobby(); // Dodano currentLobby
    const location = useLocation();
    const navigate = useNavigate();
    const { showPopup } = usePopup()
    const {incomingRequests} = useFriends()
    const {hasAnyUnread} = useChat()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    

    const handleNavigation = (path: string) => {
        if (currentLobby) {
            showPopup({
                type: 'informative',
                message: 'Please leave the lobby before navigating to another page.',
            });
        } else {
            navigate(path);
        }
    };

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
                <img
                    src={logoImage}
                    alt="L2P Logo"
                    className="h-18 w-auto cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                    onClick={() => handleNavigation('/')}
                />
            </div>
            {/* Header Elements */}
            <div className="header-elements flex gap-6 items-center pr-2 flex-1 justify-start">
                {/* WiFi Section */}
                <div className="flex items-center gap-2 hide-on-smaller">
                    <img
                        src={wifiIcon}
                        alt="WiFi Icon"
                        className="w-9 h-9"
                    />
                    <span>524 players online</span>
                </div>
                {/* Element 2 */}
                <div className="flex items-center gap-2">
                    <img
                        src={playIcon}
                        alt="Play Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">No need for creating account</span>
                </div>
                {/* Element 3 */}
                <div className="flex items-center gap-2">
                    <img
                        src={globeIcon}
                        alt="Globe Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">No need for downloading</span>
                </div>
                {/* Element 4 */}
                <div className="flex items-center gap-2">
                    <img
                        src={peopleIcon}
                        alt="People Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">Just you and people you share passion with</span>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                {isAuthenticated ? (
                    <>
                        {/* Authenticated User Info */}
                        <div 
                            className="flex items-center gap-2"
                        >
                            {/* Profile Picture with Hover Scale */}
                            <img
                                src={user?.pfp_path || pfpImage}
                                alt="User Icon"
                                onClick={() => handleNavigation('/profile')}
                                className="w-10 h-10 rounded-full transition-transform duration-200 hover:scale-105 cursor-pointer"
                            />
                            
                            <div className="user-info flex flex-col items-start">
                                <span className="hide-on-mobile text-base font-light text-headline">
                                    Hello, 
                                    {/* Przejście do profilu po kliknięciu na nick, który też się lekko skaluje */}
                                    <span 
                                        onClick={() => handleNavigation('/profile')}
                                        className="text-base cursor-pointer font-medium pl-1 text-headline transition-transform duration-200 hover:text-highlight">
                                        {user?.nickname}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    // Użycie lokalnego stanu do otwarcia Modalu/Dialogu
                                    // Zastąp 'true' funkcją ustawiającą stan np. setShowLogoutConfirm(true)
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="text-xs font-bold text-highlight no-underline bg-transparent border-0 cursor-pointer transition-colors hover:text-red-400"
                                >
                                    logout
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Guest/Unauthenticated User Info */}
                        {!isAuthScreen && (
                            <div className="user-info flex flex-col items-start">
                                <span className="hide-on-mobile text-base font-light text-headline">
                                    Hello, 
                                    <span className="text-base font-medium pl-1 text-headline">Guest</span>
                                </span>
                            </div>
                        )}
                        
                        { !isAuthScreen && <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleNavigation('/login')}
                                className="rounded-full bg-highlight px-4 py-2 text-xs font-semibold text-background-secondary transition-transform duration-200 hover:scale-105"
                            >
                                Log in
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavigation('/register')}
                                className="rounded-full border border-highlight px-4 py-2 text-xs font-semibold text-highlight transition-transform duration-200 hover:scale-105 hide-on-mobile"
                            >
                                Register
                            </button>
                        </div>}
                    </>
                )}
            </div>
            {/* Menu Button */}
            {isAuthenticated && (
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 cursor-pointer relative group"
                    onClick={onToggleFriends}>
                    <img
                        src={menuIcon}
                        alt="Menu Icon"
                        className="w-9 h-9 transition-transform group-hover:scale-105"
                    />
                    {(incomingRequests.length > 0 || hasAnyUnread) && (
                        <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-button border-2 border-background animate-bounce" />
                    )}
                </div>
            )}
            <ConfirmDialog
            open={showLogoutConfirm}
            title="Log out?"
            description="Are you sure you want to log out?"
            confirmLabel="Log Out"
            onConfirm={logout}
            onCancel={() => setShowLogoutConfirm(false)}
        />
        </header>
    );
};

export default Header;
