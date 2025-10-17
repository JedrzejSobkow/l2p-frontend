import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';

const Layout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Outlet/>
            <Footer />
        </div>
    );
};

export default Layout;
