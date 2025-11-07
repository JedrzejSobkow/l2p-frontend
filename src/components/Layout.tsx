import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';
import { useState } from 'react';
import FriendsSlide from './friends/FriendsSlide';
import ChatDock from './chat/ChatDock';
import { useAuth } from './AuthContext';

const Layout = () => {
    const [isFriendsOpen,setFriendsOpen] = useState(false)
    const {isAuthenticated} = useAuth();


    return (

                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header onToggleFriends = {()=> setFriendsOpen(true)}/>
                <Outlet/>
                {isAuthenticated &&
                <div className=''>
                    <FriendsSlide 
                        open={isFriendsOpen} 
                        onClose={()=>setFriendsOpen(false)}
                    >
                    </FriendsSlide>
                
                </div>
                }   
                <Footer />
                {isAuthenticated &&
                    <ChatDock />}
                </div>
    );
};

export default Layout;


