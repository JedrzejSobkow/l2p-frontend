import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';
import { useState } from 'react';
import FriendsPanel from './friends-panel/FriendsPanel';
import FriendCard from './friends-panel/FriendCard';

const Layout = () => {
    const [isFriendsOpen,setFriendsOpen] = useState(false)

    const friendsMock = [
        {
            id: 1,
            nickname: 'asd',
            status: 'Online'
        },
        {
            id: 2,
            nickname: 'asd',
            status: 'Online'
        },
        {
            id: 3,
            nickname: 'asd',
            status: 'Online'
        },
        {
            id: 4,
            nickname: 'asd',
            status: 'Online'
        }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header onToggleFriends = {()=> setFriendsOpen(true)}/>
            <Outlet/>
            <FriendsPanel 
              open={isFriendsOpen} 
              onClose={()=>setFriendsOpen(false)}
              friends={friendsMock}>
            </FriendsPanel>
            <Footer />
        </div>
    );
};

export default Layout;
