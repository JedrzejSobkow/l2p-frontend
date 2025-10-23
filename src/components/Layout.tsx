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
            nickname: 'asd',
            status: 'Online'
        },
        {
            nickname: 'asd',
            status: 'Online'
        },
        {
            nickname: 'asd',
            status: 'Online'
        },
        {
            nickname: 'asd',
            status: 'Online'
        }
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header onToggleFriends = {()=> setFriendsOpen(true)}/>
            <Outlet/>
            <FriendsPanel open={isFriendsOpen} onClose={()=>setFriendsOpen(false)}>
                {friendsMock.map((friend)=>(
                    <FriendCard nickname={friend.nickname} status={friend.status}></FriendCard>
                ))}
            </FriendsPanel>
            <Footer />
        </div>
    );
};

export default Layout;
