import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={{
            width: '100%',
            maxWidth: '1920px',
            height: '268px',
            backgroundColor: '#1B1A23',
            color: '#A7A9BE',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0 auto',
            padding: '20px 50px',
            position: 'relative',
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
                background: '#FF8906',
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
                        fontFamily: 'Kantumruy',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        fontSize: '18px',
                        lineHeight: '33px',
                        textAlign: 'center',
                        color: '#FF8906',
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
                    height: '254px',
                    background: 'url(image.png)',
                    border: '1px solid #1B1A23',
                    borderRadius: '20px',
                    textAlign: 'center',
                    color: '#A7A9BE',
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
                    {/* Media Links */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                        }}></div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                        }}></div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                        }}></div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                        }}></div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255, 255, 254, 0.04)',
                            borderRadius: '10px',
                        }}></div>
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
                        border: '1px dashed #A7A9BE',
                        borderRadius: '10px',
                        fontFamily: 'Kantumruy',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        fontSize: '18px',
                        lineHeight: '33px',
                        textAlign: 'center',
                        color: '#A7A9BE',
                    }}>
                        l2p.online@gmail.com
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
