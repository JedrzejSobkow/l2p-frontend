import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameTile from '../components/GameTile';

const FindGamesScreen: React.FC = () => {
  const { searchPhrase } = useParams<{ searchPhrase?: string }>();
  const navigate = useNavigate();

  const handleTileClick = (gameName: string) => {
    navigate(`/game/${gameName}`);
  };

  const games = [
    {
      gameName: 'Tic Tac Toe',
      src: '/src/assets/images/tic-tac-toe.png',
      description: 'A classic game of Xs and Os. Simple yet strategic, Tic Tac Toe is a timeless game that challenges players to align three symbols in a row, column, or diagonal. Perfect for quick matches and sharpening your strategic thinking.',
    },
    {
      gameName: 'Clobber',
      src: '/src/assets/images/clobber.png',
      description: 'A fun and challenging board game for two players, Clobber requires players to think several moves ahead. The goal is to outmaneuver your opponent by strategically removing pieces from the board while maintaining control.',
    },
    {
      gameName: 'Chess',
      src: '/src/assets/images/clobber.png',
      description: 'The timeless strategy game of kings and queens, Chess is a battle of wits and tactics. With countless strategies and openings, this game has been a favorite for centuries, offering endless opportunities for learning and mastery.',
    },
    {
      gameName: 'Checkers',
      src: '/src/assets/images/clobber.png',
      description: 'A simple yet engaging game of capturing pieces, Checkers is easy to learn but hard to master. Players must plan their moves carefully to outsmart their opponents and reach the other side of the board.',
    },
    {
      gameName: 'Sudoku',
      src: '/src/assets/images/clobber.png',
      description: 'A number puzzle game to test your logic skills, Sudoku is a brain-teasing challenge that requires players to fill a grid with numbers while adhering to specific rules. It’s a perfect game for sharpening your problem-solving abilities.',
    },
    {
      gameName: 'Minesweeper',
      src: '/src/assets/images/clobber.png',
      description: 'Uncover tiles and avoid the mines in this classic game. Minesweeper combines logic and luck as players navigate a grid to reveal safe spaces while avoiding hidden mines. A great game for quick thinking and risk assessment.',
    },
  ];

  const filteredGames = searchPhrase
    ? games.filter((game) =>
        game.gameName.toLowerCase().includes(searchPhrase.toLowerCase())
      )
    : games;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-headline mb-4">
        {searchPhrase
          ? `Searching for games matching the phrase '${searchPhrase}'`
          : 'Displaying all available games'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGames.map((game, index) => (
          <GameTile
            key={index}
            gameName={game.gameName}
            imageSrc={game.src}
            description={game.description}
            onClick={() => handleTileClick(game.gameName)}
          />
        ))}
      </div>
    </div>
  );
};

export default FindGamesScreen;
