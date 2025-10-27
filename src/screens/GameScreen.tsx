import React from 'react';
import GameHeader from '../components/GameHeader';

const GameScreen: React.FC = () => {
    return (
    <main className="w-5/7 mx-auto py-8"> 
        <GameHeader 
            title="Tic-tac-toe" 
            minPlayers={2} 
            maxPlayers={4} 
            estimatedPlaytime="20 minutes" 
            path="/src/assets/images/tic-tac-toe.png" 
        />
    </main>
    );
}

export default GameScreen;
