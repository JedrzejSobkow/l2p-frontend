import React from 'react';
import Layout from '../components/Layout';

const ProfileScreen: React.FC = () => {
    return (
        <main className="content-section" style={{
            flex: 1,
            padding: '20px',
            backgroundColor: 'var(--color-background)',
            backgroundImage: 'url("/assets/images/watermark.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
        }}> 
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                gap: '30px',
                color: 'var(--color-headline)',
                fontFamily: 'Kantumruy, sans-serif',
            }}>
                {/* Profile Picture */}
                <div style={{
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    backgroundColor: '#D9D9D9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    position: 'relative',
                }}>
                    <img
                        src="/assets/images/profile-picture.png"
                        alt="Profile Picture"
                        style={{
                            width: '240px',
                            height: '240px',
                            borderRadius: '50%',
                        }}
                    />
                </div>

                {/* Rating */}
                <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--color-highlight)',
                    marginBottom: '10px',
                }}>
                    RATING <span style={{ color: 'var(--color-headline)', paddingLeft: '10px' }}>495.00</span> <span style={{ color: 'var(--color-lp)' }}>LP</span>
                </div>

                {/* Username */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    fontSize: '18px',
                    fontWeight: '400',
                    marginBottom: '20px',
                }}>
                    <img
                        src="/assets/icons/user.png"
                        alt="User Icon"
                        style={{
                            width: '26px',
                            height: '26px',
                        }}
                    />
                    <span>le_frogger422786</span>
                    <img
                        src="/assets/icons/edit.png"
                        alt="Edit Icon"
                        style={{
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                        }}
                    />
                </div>

                {/* About Me Section */}
                <div>
                    
                </div>
            </div>
        </main>
    );
};

export default ProfileScreen;
