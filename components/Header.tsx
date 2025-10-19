import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const handleLogoutClick = () => {
        logout();
    };

    return (
        <header style={{
            width: '100%',
            height: '66px',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-headline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'relative',
            fontFamily: 'Kantumruy, sans-serif',
            fontSize: '14px',
            fontWeight: '100',
            boxSizing: 'border-box', 
            overflow: 'hidden', 
        }}>
            {/* Bottom Line */}
            <div style={{
                width: '100%',
                height: '2px',
                background: 'rgba(255, 255, 254, 0.05)',
                position: 'absolute',
                bottom: '0',
            }}></div>
            {/* Orange Line */}
            <div style={{
                width: '100px',
                height: '2px',
                background: 'var(--color-highlight)',
                borderRadius: '1px',
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
            }}></div>
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingRight: '10px',
                flexShrink: 0, 
            }}>
                <img
                    src="/assets/images/logo.png"
                    alt="L2P Logo"
                    style={{
                        height: '74px',
                        width: 'auto', 
                    }}
                />
            </div>
            {/* Header Elements */}
            <div className="header-elements" style={{
                display: 'flex',
                gap: '25px',
                alignItems: 'center',
                paddingRight: '10px',
                flex: 1, 
                justifyContent: 'left', 
            }}>
                {/* Element 1 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <img
                        src="/assets/icons/wifi.png"
                        alt="WiFi Icon"
                        className="hide-on-smaller"
                        style={{
                            width: '38px',
                            height: '38px',
                        }}
                    />
                    <span className="hide-on-smaller">524 players online</span>
                </div>
                {/* Element 2 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <img
                        src="/assets/icons/play.png"
                        alt="Play Icon"
                        className="hide-on-small"
                        style={{
                            width: '38px',
                            height: '38px',
                        }}
                    />
                    <span className="hide-on-small">No need for creating account</span>
                </div>
                {/* Element 3 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <img
                        src="/assets/icons/globe.png"
                        alt="Globe Icon"
                        className="hide-on-small"
                        style={{
                            width: '38px',
                            height: '38px',
                        }}
                    />
                    <span className="hide-on-small">No need for downloading</span>
                </div>
                {/* Element 4 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <img
                        src="/assets/icons/people.png"
                        alt="People Icon"
                        className="hide-on-small"
                        style={{
                            width: '38px',
                            height: '38px',
                        }}
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
                                {user?.nickname}
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
            <div style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0, 
            }}>
                <img
                    src="/assets/icons/menu.png"
                    alt="Menu Icon"
                    style={{
                        width: '38px',
                        height: '38px',
                    }}
                />
            </div>
        </header>
    );
};

export default Header;
