import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const handleLogoutClick = () => {
        logout();
    };

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
                    src="/assets/images/logo.png"
                    alt="L2P Logo"
                    className="h-18 w-auto"
                />
            </div>
            {/* Header Elements */}
            <div className="header-elements flex gap-6 items-center pr-2 flex-1 justify-start">
                {/* WiFi Section */}
                <div className="flex items-center gap-2 hide-on-smaller">
                    <img
                        src="/assets/icons/wifi.png"
                        alt="WiFi Icon"
                        className="w-9 h-9"
                    />
                    <span>524 players online</span>
                </div>
                {/* Element 2 */}
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/play.png"
                        alt="Play Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">No need for creating account</span>
                </div>
                {/* Element 3 */}
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/globe.png"
                        alt="Globe Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">No need for downloading</span>
                </div>
                {/* Element 4 */}
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/icons/people.png"
                        alt="People Icon"
                        className="w-9 h-9 hide-on-small"
                    />
                    <span className="hide-on-small">Just you and people you share passion with</span>
                </div>
            </div>
            {/* User Info */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0, 
                paddingRight: '15px',
            }}>
                {isAuthenticated ? (
                    <>
                        <img
                            src="/assets/images/pfp.png"
                            alt="User Icon"
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                            }}
                        />
                        <div className="user-info" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}>
                            <span className='hide-on-mobile' style={{
                                fontSize: '16px',
                                fontWeight: '100',
                                color: 'var(--color-headline)',
                            }}>
                                Hello, 
                                <span style={{
                                fontSize: '16px',
                                fontWeight: '400',
                                paddingLeft: '3px',
                                color: 'var(--color-headline)',}}> 
                                {user?.username}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="cursor-pointer border-0 bg-transparent p-0 text-[10px] font-bold uppercase text-[color:var(--color-highlight)] transition-colors hover:text-[color:var(--color-secondary)]"
                            >
                                logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            to='/login'
                            className="rounded-full border border-highlight px-4 py-2 text-xs font-semibold text-highlight transition-colors duration-200 hover:bg-highlight hover:text-button-text-dark"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="text-xs font-semibold text-headline transition-colors hover:text-highlight"
                        >
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
            {/* Menu Button */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <img
                    src="/assets/icons/menu.png"
                    alt="Menu Icon"
                    className="w-9 h-9"
                />
            </div>
        </header>
    );
};

export default Header;
