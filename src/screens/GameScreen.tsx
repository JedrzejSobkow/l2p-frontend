import React, { useState } from 'react';
import GameHeader from '../components/GameHeader';
import SectionButton from '../components/SectionButton';
import LobbyShortTile from '../components/LobbyShortTile';
import RangeSlider from '../components/RangeSlider';
import { FaUsers } from 'react-icons/fa';

const GameScreen: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('Available Lobbies');
    const [playerCount, setPlayerCount] = useState<number>(2);

    const lobbies = [
        { title: 'ttt adventure', occupiedSlots: 1, totalSlots: 4, creator: 'player222', timeAgo: '120 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', occupiedSlots: 1, totalSlots: 2, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/4.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 3, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/7.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/2.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/12.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 3, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/15.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
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
            <div className="">
                <SectionButton
                    options={['Available Lobbies', 'Game Rules']}
                    selectedOption={selectedSection}
                    onSelect={setSelectedSection}
                />
            </div>
            <div className="mt-4">
                {selectedSection === 'Available Lobbies' && (
                    <>
                    <div className='bg-background-secondary p-7 pt-0'>
                    <RangeSlider 
                            min={2} 
                            max={10} 
                            value={playerCount} 
                            onChange={setPlayerCount} 
                            icon={<FaUsers />} 
                        />
                        <div className="grid grid-cols-3 gap-6 mt-4">
                            {lobbies.map((lobby, index) => (
                                <LobbyShortTile 
                                    key={index} 
                                    title={lobby.title} 
                                    occupiedSlots={lobby.occupiedSlots} 
                                    totalSlots={lobby.totalSlots} 
                                    creator={lobby.creator} 
                                    timeAgo={lobby.timeAgo} 
                                    profileImagePath={lobby.profileImagePath} 
                                />
                            ))}
                        </div>
                    </div>
                    </>
                )}
                {selectedSection === 'Game Rules' && <p>Displaying Game Rules...</p>}
            </div>
        </main>
    );
};

export default GameScreen;
