import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router';
import { useState } from 'react';
import FriendsSlide from './friends/FriendsSlide';

const Layout = () => {
    const [isFriendsOpen,setFriendsOpen] = useState(false)

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
              friends={friendsMock}>
            </FriendsSlide>
            <Footer />
        </div>
    );
};

export default Layout;
