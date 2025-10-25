import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';
import { useState } from 'react';
import FriendsSlide from './friends/FriendsSlide';
import ChatDock from './chat/ChatDock';
import { useChatDock } from './chat/ChatDockContext';

const Layout = () => {
    const [isFriendsOpen,setFriendsOpen] = useState(false)
    const {openChat} = useChatDock()

    const friendsMock = [
        {
            nickname: 'PlayerOne',
            status: 'Online'
        },
        {
            nickname: 'PlayerTwo',
            status: 'Online'
        },
        {
            nickname: 'PlayerThree',
            status: 'Offline'
        },
        {
            nickname: 'PlayerFour',
            status: 'Offline'
        }
    ]

    return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header onToggleFriends = {()=> setFriendsOpen(true)}/>
                <Outlet/>
                <FriendsSlide 
                  open={isFriendsOpen} 
                  onClose={()=>setFriendsOpen(false)}
                  friends={friendsMock}
                  onFriendSelect={openChat}>
                </FriendsSlide>
                <Footer />
                {/* Global chat dock overlay */}
                <ChatDock />
            </div>
    );
};

export default Layout;
