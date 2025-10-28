import React from 'react';
import InLobbyUserTile from '../components/InLobbyUserTile';

const LobbyScreen: React.FC = () => {
    return (
    <main>
        <InLobbyUserTile 
            avatar="/src/assets/images/avatar/12.png" 
            username="JohnDoe" 
            status="ready" 
            place={1}
            isReady={false}
            isHost={false}
            isMe={true}
        />
    </main>
    );
}

export default LobbyScreen;
