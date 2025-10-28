import React, { useState } from 'react';
import GameHeader from '../components/GameHeader';
import SectionButton from '../components/SectionButton';
import LobbyShortTile from '../components/LobbyShortTile';

const GameScreen: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('Available Lobbies');

    const lobbies = [
        { title: 'ttt adventure', slots: '1/4', creator: 'player222', timeAgo: '120 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', slots: '1/2', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/4.png' },
        { title: 'ttt adventure', slots: '2/3', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/7.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/2.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/12.png' },
        { title: 'ttt adventure', slots: '2/3', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/15.png' },
        { title: 'ttt adventure', slots: '2/4', creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
    ];

    return (
        <main className="w-4/7 mx-auto py-8">
            <GameHeader 
                title="Tic-tac-toe" 
                minPlayers={2} 
                maxPlayers={4} 
                estimatedPlaytime="20 minutes" 
                path="/src/assets/images/tic-tac-toe.png" 
            />
            <div className="mt-6">
                <SectionButton
                    options={['Available Lobbies', 'Game Rules']}
                    selectedOption={selectedSection}
                    onSelect={setSelectedSection}
                />
            </div>
            <div className="mt-4">
                {selectedSection === 'Available Lobbies' && (
                    <div className="grid grid-cols-3 gap-6 bg-background-secondary p-7">
                        {lobbies.map((lobby, index) => (
                            <LobbyShortTile 
                                key={index} 
                                title={lobby.title} 
                                slots={lobby.slots} 
                                creator={lobby.creator} 
                                timeAgo={lobby.timeAgo} 
                                profileImagePath={lobby.profileImagePath} 
                            />
                        ))}
                    </div>
                )}
                {selectedSection === 'Game Rules' && <p>Displaying Game Rules...</p>}
            </div>
        </main>
    );
};

export default GameScreen;
