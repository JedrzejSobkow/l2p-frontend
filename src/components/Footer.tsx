import React from 'react';
import { tiktokIcon, youtubeIcon, discordIcon, telegramIcon, instagramIcon } from '@assets/icons';
import { logoImage } from '@assets/images';

const Footer: React.FC = () => {
    return (
        <footer className="w-full max-w-screen-2xl h-52 bg-background text-paragraph flex flex-col items-center justify-between mx-auto px-12 py-5 relative font-sans text-xs box-border overflow-hidden">
            {/* Top Line */}
            <div
                className="absolute top-0 w-full h-0.5"
                style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}
            ></div>
            {/* Orange Line */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-highlight rounded"></div>
            {/* Content */}
            <div className="footer-content flex justify-between items-center w-full h-full">
                {/* Left Section */}
                <div className="flex flex-col justify-start">
                    <div className="font-medium text-lg leading-8 text-center text-highlight mb-5">
                        Wroclaw University of Science and Technology
                    </div>
                    <div className="footer-names flex flex-col gap-2">
                        <div>Piotr Ryszko</div>
                        <div>Jędrzej Sobków</div>
                        <div>Dariusz Majnert</div>
                        <div>Damian Kwolek</div>
                    </div>
                </div>
                {/* Right Section */}
                <div className="footer-right-section flex flex-col items-center gap-5">
                    {/* Social Media Links */}
                    <div className="footer-social-media flex gap-2">
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}>
                            <img
                                src={tiktokIcon}
                                alt="TikTok"
                                className="w-1/2"
                            />
                        </a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}>
                            <img
                                src={youtubeIcon}
                                alt="YouTube"
                                className="w-1/2"
                            />
                        </a>
                        <a href="https://www.discord.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}>
                            <img
                                src={discordIcon}
                                alt="Discord"
                                className="w-1/2"
                            />
                        </a>
                        <a href="https://www.telegram.org" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}>
                            <img
                                src={telegramIcon}
                                alt="Telegram"
                                className="w-1/2"
                            />
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 254, 0.1)' }}>
                            <img
                                src={instagramIcon}
                                alt="Instagram"
                                className="w-1/2"
                            />
                        </a>
                    </div>
                    {/* Logo and Email */}
                    <div className="footer-logo-email flex flex-col items-center gap-2">
                        <div className="footer-logo w-32 h-16">
                            <img
                                src={logoImage}
                                alt="L2P Logo"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="footer-email w-80 h-8 flex items-center justify-center border border-dashed border-paragraph rounded-lg text-sm leading-8 text-center">
                            l2p.online@gmail.com
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
