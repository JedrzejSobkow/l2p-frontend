import React from 'react';
import { Link } from 'react-router';

const HomeScreen: React.FC = () => {
    return (
        <main className="content-section"
                style={{
                    flex: 1,
                    padding: '20px',
                    backgroundColor: 'var(--color-background)',
                    backgroundImage: 'url("/assets/images/watermark.png")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                }}>
                    {/* temporary buttons for convinience  */}
                    <Link 
                        to='/login'
                        className="mt-2 w-full rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
                    >Login</Link>
                    <Link 
                        to='/register'
                        className="mt-2 w-full rounded-full bg-button px-6 py-3 text-sm font-semibold text-button-text-dark transition hover:-translate-y-0.5 hover:shadow-[0_5px_10px_rgba(255,108,0,0.45)]"
                    >Register</Link>
        </main>
    );
};

export default HomeScreen;
