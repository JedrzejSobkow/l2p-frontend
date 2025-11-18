import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameTile from '../components/GameTile';
import { ticTacToeImage, clobberImage } from '@assets/images';
import { useLobby } from '../components/lobby/LobbyContext';
import { getImage } from '../utils/imageMap';

const FindGamesScreen: React.FC = () => {
  const { searchPhrase } = useParams<{ searchPhrase?: string }>();
  const navigate = useNavigate();
  const { availableGames, getAvailableGames } = useLobby();

  useEffect(() => {
    getAvailableGames();
  }, [getAvailableGames]);

  const handleTileClick = (gameName: string) => {
    navigate(`/game/${gameName}`);
  };

  const filteredGames = searchPhrase
    ? availableGames.filter((game: any) =>
        game.display_name.toLowerCase().includes(searchPhrase.toLowerCase())
      )
    : availableGames;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-headline mb-4">
        {searchPhrase
          ? `Searching for games matching the phrase '${searchPhrase}'`
          : 'Displaying all available games'}
      </h1>
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGames.map((game: any, index: number) => (
            <GameTile
              key={index}
              gameName={game.display_name}
              imageSrc={getImage('games', game.game_name) || ''}
              description={game.description}
              onClick={() => handleTileClick(game.game_name)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-headline py-8">
          {searchPhrase
            ? `No games found matching '${searchPhrase}'`
            : 'No games available'}
        </div>
      )}
    </div>
  );
};

export default FindGamesScreen;
