import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main
                className="content-section"
                style={{
                    flex: 1,
                    padding: '20px',
                    backgroundColor: 'var(--color-background)',
                    backgroundImage: 'url("/assets/images/watermark.png")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'contain',
                }}
            >
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
