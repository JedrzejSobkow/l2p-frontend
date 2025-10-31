import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';
import { useState } from 'react';
import FriendsSlide from './friends/FriendsSlide';
import ChatDock from './chat/ChatDock';

const Layout = () => {
    const [isFriendsOpen,setFriendsOpen] = useState(false)


    return (

                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header onToggleFriends = {()=> setFriendsOpen(true)}/>
                <Outlet/>
                <div className=''>
                    <FriendsSlide 
                        open={isFriendsOpen} 
                        onClose={()=>setFriendsOpen(false)}
                    >
                    </FriendsSlide>
                
                </div>
                
                <Footer />
                <ChatDock />
                </div>
    );
};

export default Layout;


