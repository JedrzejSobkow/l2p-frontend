import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            width: '100%',
            maxWidth: '1920px',
            height: '200px',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-paragraph)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0 auto',
            padding: '20px 50px',
            position: 'relative',
            fontFamily: 'Kantumruy, sans-serif',
            fontSize: '12px',
            boxSizing: 'border-box',
            overflow: 'hidden',
        }}>
            {/* Top Line */}
            <div style={{
                width: '100%',
                height: '2px',
                background: 'rgba(255, 255, 254, 0.05)',
                position: 'absolute',
                top: '0',
            }}></div>
            {/* Orange Line */}
            <div style={{
                width: '100px',
                height: '2px',
                background: 'var(--color-highlight)',
                borderRadius: '1px',
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
            }}></div>
            {/* Content */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '100%',
            }}>
                {/* Left Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                }}>
                    <div style={{
                        fontWeight: '400',
                        fontSize: '16px',
                        lineHeight: '33px',
                        textAlign: 'center',
                        color: 'var(--color-highlight)',
                        marginBottom: '20px',
                    }}>
                        Wroclaw University of Science and Technology
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}>
                        <div>Piotr Ryszko</div>
                        <div>Jędrzej Sobków</div>
                        <div>Dariusz Majnert</div>
                        <div>Damian Kwolek</div>
                    </div>
                </div>
                {/* Advertisement */}
                <div style={{
                    width: '557px',
                    height: 'auto',
                    background: 'url(image.png)',
                    borderRadius: '20px',
                    textAlign: 'center',
                    color: 'var(--color-paragraph)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    Advertisement: You can place ads in either sidebar too.
                </div>
                {/* Right Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                }}>
                    {/* Social Media Links */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                    }}>
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/assets/icons/tiktok.png"
                                alt="TikTok"
                                style={{
                                    width: '50%',
                                    // height: '50%',
                                }}
                            />
                        </a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/assets/icons/youtube.png"
                                alt="YouTube"
                                style={{
                                    width: '50%',
                                    // height: '50%',
                                }}
                            />
                        </a>
                        <a href="https://www.discord.com" target="_blank" rel="noopener noreferrer" style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/assets/icons/discord.png"
                                alt="Discord"
                                style={{
                                    width: '50%',
                                    // height: '50%',
                                }}
                            />
                        </a>
                        <a href="https://www.telegram.org" target="_blank" rel="noopener noreferrer" style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/assets/icons/telegram.png"
                                alt="Telegram"
                                style={{
                                    width: '50%',
                                    // height: '50%',
                                }}
                            />
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/assets/icons/instagram.png"
                                alt="Instagram"
                                style={{
                                    width: '50%',
                                    // height: '50%',
                                }}
                            />
                        </a>
                    </div>
                    {/* Logo */}
                    <div style={{
                        width: '126px',
                        height: '64px',
                    }}>
                        <img
                            src="/assets/images/logo.png"
                            alt="L2P Logo"
                            style={{
                                width: '100%',
                                height: 'auto',
                            }}
                        />
                    </div>
                    {/* Email */}
                    <div style={{
                        width: '338px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed var(--color-paragraph)',
                        borderRadius: '10px',
                        fontWeight: '400',
                        fontSize: '16px',
                        lineHeight: '33px',
                        textAlign: 'center',
                        color: 'var(--color-paragraph)',
                    }}>
                        l2p.online@gmail.com
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
