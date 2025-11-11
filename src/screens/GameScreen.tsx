import React, { useState, useEffect } from 'react';
import GameHeader from '../components/GameHeader';
import SectionButton from '../components/SectionButton';
import LobbyShortTile from '../components/LobbyShortTile';
import RangeSlider from '../components/RangeSlider';
import { FaUsers } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useLobby } from '../components/lobby/LobbyContext';

interface Game {
    game_name: string;
    display_name: string;
    description: string;
    min_players: number;
    max_players: number;
    game_image_path: string;
    supported_rules?: Record<string, any>;
    turn_based?: boolean;
    category?: string;
}

const GameScreen: React.FC = () => {
    const { gameName } = useParams<{ gameName: string }>();
    const { availableGames, getAvailableGames, getPublicLobbiesByGame, publicLobbies, isLoading } = useLobby();
    
    const [selectedSection, setSelectedSection] = useState<string>('Available Lobbies');
    const [playerCount, setPlayerCount] = useState<number>(2);
    const [currentGame, setCurrentGame] = useState<Game | null>(null);

    useEffect(() => {
        getAvailableGames();
    }, [getAvailableGames]);

    useEffect(() => {
        if (gameName) {
            getPublicLobbiesByGame(gameName);
        }
    }, [gameName, getPublicLobbiesByGame]);

    useEffect(() => {
        if (availableGames.length > 0 && gameName) {
            const game = availableGames.find(
                (g: Game) => g.game_name.toLowerCase() === gameName.toLowerCase()
            );
            if (game) {
                setCurrentGame(game);
                setPlayerCount(game.min_players);
            }
        }
    }, [availableGames, gameName]);

    const filteredLobbies = publicLobbies.filter(
        (lobby) => lobby.max_players === playerCount
    );

    if (!currentGame) {
        return <div className="w-full max-w-screen-lg mx-auto py-8 px-10 sm:px-20">Loading...</div>;
    }

    return (
        <main className="w-full max-w-screen-lg mx-auto py-8 px-10 sm:px-20">
            <GameHeader 
                title={currentGame.display_name} 
                minPlayers={currentGame.min_players} 
                maxPlayers={currentGame.max_players} 
                path={`/src/assets/images/games/${currentGame.game_name}.png`}
                
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
                            min={currentGame.min_players} 
                            max={currentGame.max_players} 
                            value={playerCount} 
                            onChange={setPlayerCount} 
                            icon={<FaUsers />} 
                        />
                        {isLoading ? (
                            <div className="mt-6 text-center text-headline">Loading lobbies...</div>
                        ) : filteredLobbies.length === 0 ? (
                            <div className="mt-6 text-center text-headline">No lobbies available</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                                {filteredLobbies.map((lobby) => (
                                    <LobbyShortTile 
                                        key={lobby.lobby_code} 
                                        title={lobby.name} 
                                        occupiedSlots={lobby.current_players} 
                                        totalSlots={lobby.max_players} 
                                        creator={lobby.members[0]?.nickname || 'Unknown'} 
                                        timeAgo={new Date(lobby.created_at).toLocaleString()} 
                                        profileImagePath={`/src/assets${lobby.members[0]?.pfp_path || '/images/avatar/default.png'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    </>
                )}
                {selectedSection === 'Game Rules' && (
                    <div className="bg-background-secondary p-4 sm:p-6 md:p-7 rounded-lg">
                        <p className="text-sm sm:text-base text-headline">{currentGame.description}</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default GameScreen;
