import React, { useState, useEffect } from 'react';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import LeaderboardCard from '../components/LeaderboardCard';
import GameRecommendationWithImages from '../components/GameRecommendationWithImages';
import SearchBar from '../components/SearchBar';
import GameLobbyCard from '../components/GameLobbyCard';
import Popup from '../components/Popup';

const HomeScreen: React.FC = () => {
  const leaderboardData = [
    { place: 1, pfp_path: '/src/assets/images/avatar/1.png', name: 'PlayerOne', rating: 1500 },
    { place: 2, pfp_path: '/src/assets/images/avatar/2.png', name: 'PlayerTwo', rating: 1400 },
    { place: 3, pfp_path: '/src/assets/images/avatar/3.png', name: 'cool_usersdfsfsdfsdf', rating: 1300 },
    { place: 4, pfp_path: '/src/assets/images/avatar/4.png', name: 'Cipicipi', rating: 1200 },
    { place: 5, pfp_path: '/src/assets/images/avatar/4.png', name: 'cidsof', rating: 1150 },
  ];

  const topPlayers = leaderboardData.slice(0, 5);

  const topPicksImages = [
    { src: '/src/assets/images/tic-tac-toe.png', alt: 'Tic Tac Toe', gameName: 'tic-tac-toe' },
    { src: '/src/assets/images/clobber.png', alt: 'Clobber', gameName: 'clobber' },
  ];

  const featuredGamesImages = [
    { src: '/src/assets/images/clobber.png', alt: 'Clobber', gameName: 'clobber' },
  ];

  const paginatedLobbies = [
    {
      page: 1,
      lobbies: [
        {
          gameName: 'Tic Tac Toe',
          lobbyName: 'Beginner Lobby',
          gameImage: '/src/assets/images/tic-tac-toe.png',
          players: [
            { username: 'PlayerOne', avatar: '/src/assets/images/avatar/1.png' },
            { username: 'PlayerTwo', avatar: '/src/assets/images/avatar/2.png' },
          ],
          maxPlayers: 5,
          duration: '5-10 mins',
        },
        {
          gameName: 'Clobber',
          lobbyName: 'Advanced Lobby',
          gameImage: '/src/assets/images/clobber.png',
          players: [
            { username: 'PlayerThree', avatar: '/src/assets/images/avatar/3.png' },
          ],
          maxPlayers: 2,
          duration: '10-15 mins',
        },
        {
          gameName: 'Chess',
          lobbyName: 'Strategy Lobby',
          gameImage: '/src/assets/images/chess.png',
          players: [
            { username: 'PlayerFour', avatar: '/src/assets/images/avatar/4.png' },
          ],
          maxPlayers: 4,
          duration: '15-20 mins',
        },
      ],
    },
    {
      page: 2,
      lobbies: [
        {
          gameName: 'Checkers',
          lobbyName: 'Casual Checkers',
          gameImage: '/src/assets/images/checkers.png',
          players: [
            { username: 'PlayerFive', avatar: '/src/assets/images/avatar/5.png' },
          ],
          maxPlayers: 3,
          duration: '10-15 mins',
        },
        {
          gameName: 'Sudoku',
          lobbyName: 'Puzzle Masters',
          gameImage: '/src/assets/images/sudoku.png',
          players: [
            { username: 'PlayerSix', avatar: '/src/assets/images/avatar/6.png' },
          ],
          maxPlayers: 6,
          duration: '20-30 mins',
        },
        {
          gameName: 'Minesweeper',
          lobbyName: 'Mine Hunters',
          gameImage: '/src/assets/images/minesweeper.png',
          players: [
            { username: 'PlayerSeven', avatar: '/src/assets/images/avatar/7.png' },
          ],
          maxPlayers: 4,
          duration: '10-15 mins',
        },
      ],
    },
    {
      page: 3,
      lobbies: [
        {
          gameName: 'Tic Tac Toe',
          lobbyName: 'Pro Lobby',
          gameImage: '/src/assets/images/tic-tac-toe.png',
          players: [
            { username: 'PlayerEight', avatar: '/src/assets/images/avatar/8.png' },
          ],
          maxPlayers: 2,
          duration: '5-10 mins',
        },
        {
          gameName: 'Clobber',
          lobbyName: 'Clobber Champs',
          gameImage: '/src/assets/images/clobber.png',
          players: [
            { username: 'PlayerNine', avatar: '/src/assets/images/avatar/9.png' },
          ],
          maxPlayers: 6,
          duration: '15-20 mins',
        },
      ],
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const [popup, setPopup] = useState<{ type: 'confirmation' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (location.state?.message) {
      setPopup({
        type: location.state.type || 'info',
        message: location.state.message,
      });
      // Clear the state so popup doesn't show on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleNextPage = () => {
    if (currentPage < paginatedLobbies.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentLobbies = paginatedLobbies.find((page) => page.page === currentPage)?.lobbies || [];

  return (
    <main className="flex flex-col gap-8 px-10 lg:px-20 py-5 bg-background h-full">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar
          size="normal"
          placeholder="Search for games..."
          suggestions={[
            { text: 'Tic Tac Toe', image: '/src/assets/images/tic-tac-toe.png' },
            { text: 'Clobber', image: '/src/assets/images/clobber.png' },
            { text: 'Chess', image: '/src/assets/images/chess.png' },
            { text: 'Checkers', image: '/src/assets/images/checkers.png' },
            { text: 'Sudoku', image: '/src/assets/images/sudoku.png' },
            { text: 'Minesweeper', image: '/src/assets/images/minesweeper.png' },
          ]}
          onEnterRoute="/find_games"
          onSuggestionClickRoute="/game"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left Column: Top Picks and Featured Games */}
        <div className="w-full md:w-[70%] flex flex-col gap-8">
          <GameRecommendationWithImages title="Top picks for you" images={topPicksImages} />
          <GameRecommendationWithImages title="Featured games" images={featuredGamesImages} />
        </div>

        {/* Right Column: Leaderboard */}
        <div className="flex flex-col gap-4 w-full md:w-[30%] min-w-[300px]">
          <h2 className="text-2xl font-bold text-headline mb-4">Top rated players</h2>
          {topPlayers.map((player) => (
            <LeaderboardCard
              key={player.place}
              place={player.place}
              pfp_path={player.pfp_path}
              name={player.name}
              rating={player.rating}
            />
          ))}
        </div>
      </div>

      {/* Game Lobbies Section */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-headline">Active lobbies</h2>
        </div>
        {currentLobbies.map((lobby, index) => (
          <GameLobbyCard
            key={index}
            gameName={lobby.gameName}
            lobbyName={lobby.lobbyName}
            gameImage={lobby.gameImage}
            players={lobby.players}
            maxPlayers={lobby.maxPlayers}
            duration={lobby.duration}
          />
        ))}
        <div className="flex justify-center items-center gap-6 mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-highlight disabled:opacity-50"
          >
            <FaAngleLeft size={30} />
          </button>
          <span className="text-lg font-bold text-headline">
            Page {currentPage} of {paginatedLobbies.length}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === paginatedLobbies.length}
            className="text-highlight disabled:opacity-50"
          >
            <FaAngleRight size={30} />
          </button>
        </div>
      </div>
      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </main>
  );
};

export default HomeScreen;
