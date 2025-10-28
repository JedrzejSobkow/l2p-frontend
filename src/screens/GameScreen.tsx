import React, { useState } from 'react';
import GameHeader from '../components/GameHeader';
import SectionButton from '../components/SectionButton';
import LobbyShortTile from '../components/LobbyShortTile';
import RangeSlider from '../components/RangeSlider';
import { FaUsers } from 'react-icons/fa';

const GameScreen: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('Available Lobbies');
    const [playerCount, setPlayerCount] = useState<number>(2);

    const gameRules = `
        Tic-tac-toe is a simple yet strategic game where two players take turns marking spaces in a 3×3 grid.
        The objective is to be the first player to place three of your marks in a horizontal, vertical, or diagonal row.
        Players alternate turns, and each turn consists of marking an empty space with their symbol (either X or O).

        The game begins with an empty grid, and the first player is chosen randomly or by agreement.
        As the game progresses, players must carefully plan their moves to block their opponent's attempts to form a row
        while simultaneously creating opportunities to win.

        If all spaces in the grid are filled and no player has succeeded in forming a row, the game ends in a draw.
        Tic-tac-toe is not only a fun pastime but also a great way to develop strategic thinking and problem-solving skills.
        It is a timeless game enjoyed by people of all ages around the world.
    `;

    const lobbies = [
        { title: 'ttt_adventure', occupiedSlots: 1, totalSlots: 4, creator: 'player222', timeAgo: '120 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt_adventure', occupiedSlots: 1, totalSlots: 2, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/4.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 3, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', occupiedSlots: 1, totalSlots: 2, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 3, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/7.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/2.png' },
        { title: 'ttt adventure', occupiedSlots: 1, totalSlots: 2, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/12.png' },
        { title: 'ttt adventure', occupiedSlots: 1, totalSlots: 3, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/1.png' },
        { title: 'ttt adventure', occupiedSlots: 1, totalSlots: 2, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/15.png' },
        { title: 'ttt adventure', occupiedSlots: 2, totalSlots: 4, creator: 'player222', timeAgo: '20 seconds ago', profileImagePath: '/src/assets/images/avatar/3.png' },
    ];

    const filteredLobbies = lobbies.filter(
        (lobby) => lobby.totalSlots == playerCount
    );

    return (
        <main className="w-full max-w-screen-lg mx-auto py-8 px-10 sm:px-20">
            <GameHeader 
                title="Tic-tac-toe" 
                minPlayers={2} 
                maxPlayers={4} 
                estimatedPlaytime="20 minutes" 
                path="/src/assets/images/tic-tac-toe.png" 
            />
            <div className="mt-4">
                <SectionButton
                    options={['Available Lobbies', 'Game Rules']}
                    selectedOption={selectedSection}
                    onSelect={setSelectedSection}
                />
            </div>
            <div className="mt-4">
                {selectedSection === 'Available Lobbies' && (
                    <>
                    <div className='bg-background-secondary p-4 sm:p-6 md:p-7 rounded-lg'>
                        <RangeSlider 
                            min={2} 
                            max={10} 
                            value={playerCount} 
                            onChange={setPlayerCount} 
                            icon={<FaUsers />} 
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                            {filteredLobbies.map((lobby, index) => (
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
                {selectedSection === 'Game Rules' && (
                    <div className="bg-background-secondary p-4 sm:p-6 md:p-7 rounded-lg">
                        <p className="text-sm sm:text-base text-headline">{gameRules}</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default GameScreen;
