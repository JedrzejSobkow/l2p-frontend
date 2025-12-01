import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Outlet } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import FriendsSlide from '@/components/friends/FriendsSlide';
import ChatDock from '@/components/chat/ChatDock';
import { useAuth } from '@/components/AuthContext';
import { useLobby } from '@/components/lobby/LobbyContext';
import { usePopup } from '@/components/PopupContext';

const Layout = () => {
    const [isFriendsOpen,setFriendsOpen] = useState(false)
    const {isAuthenticated, user} = useAuth();
    const { gameState } = useLobby();
    const { showPopup } = usePopup();
    const navigate = useNavigate();
    const location = useLocation();
    const prevGameResultRef = useRef<string | undefined>(undefined);
    const lastTurnRef = useRef<any>(null);

    useEffect(() => {
        const currentResult = gameState?.result;

        if (!gameState?.result) {
            prevGameResultRef.current = undefined
        }
        if (currentResult === 'in_progress' && prevGameResultRef.current !== 'in_progress') {
            // Navigate on game start but allow leaving afterward
            navigate('/lobby/ingame');
        }
        prevGameResultRef.current = currentResult;
    }, [gameState?.result, navigate]);

    useEffect(() => {
        if (!gameState) {
            prevGameResultRef.current = undefined
        }
    }, [gameState]);

    useEffect(() => {
        if (!gameState || gameState?.result !== 'in_progress') {
            lastTurnRef.current = null;
            return;
        }
        const currentTurn = (gameState as any).current_turn_player_id;
        if (
            currentTurn !== lastTurnRef.current &&
            String(currentTurn) === String(user?.id) &&
            location.pathname !== '/lobby/ingame'
        ) {
            showPopup({ type: 'informative', message: "It's your turn! Head back to the game." });
        }
        lastTurnRef.current = currentTurn;
    }, [gameState, user?.id, location.pathname, showPopup]);


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


