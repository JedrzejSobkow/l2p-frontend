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
        </main>
    );
};

export default HomeScreen;
